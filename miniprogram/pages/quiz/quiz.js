const event = require('../../utils/event');
const app = getApp();

const COUNT_DOWN = 100;
let countDownInterval = null;

Page({
  /**
   * 页面数据缓存
   */

  data: {
    quizs: [], // 考卷
    progressIndex: -1, // 进度
    correctCnt: 0, // 正确数
    participates: [],
    quizPreLoading: false,
    answers: [],
    countDown: COUNT_DOWN,
    ready: false,
    finished: false,
    wrongAnswerIdx: -1,
    rightAnswerIdx: -1,
    curUser: null,
    otherUser: {},
    curScore: 0,
    otherScore: 0,
  },

  scoreCalc(correctCnt) {
    const { quizs } = this.data;
    return (correctCnt * 100 / quizs.length).toFixed(2);
  },

  async makeDicision(event) {
    clearInterval(countDownInterval);
    countDownInterval = null;
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const optionIdx = dataset.index;
    const { answers } = this.data;
    const { quizs, progressIndex, correctCnt } = this.data;
    const currentQuestion = quizs[progressIndex];
    let correct = correctCnt;
    if (currentQuestion) {
      const { answer } = currentQuestion.quiz;
      if (answer === optionIdx) {
        // 回答正确
        correct += 1;
        answers.push(1);
        const curScore = this.scoreCalc(correct);
        this.setData({
          rightAnswerIdx: answer,
          curScore,
        });
      } else {
        // 回答错误
        answers.push(0);
        this.setData({
          wrongAnswerIdx: optionIdx,
        })
      }

      this.setData({
        correctCnt: correct,
        answers,
      });

      // 移动到下一题
      setTimeout(() => {
        this.moveToNextQuiz();
      }, 2000);
    }
  },

  async moveToNextQuiz() {
    clearInterval(countDownInterval);
    countDownInterval = null;
    this.setData({
      wrongAnswerIdx: -1,
      rightAnswerIdx: -1,
      countDown: COUNT_DOWN,
    });
    const { progressIndex, quizs, answers, correctCnt, roomid } = this.data;
    if (progressIndex === quizs.length - 1) {
      wx.showToast({
        title: '回答完毕, 正在提交结果',
        icon: 'none',
        duration: 2000,
      });
      const score = Math.floor((correctCnt / quizs.length) * 100);
      await wx.cloud.callFunction({
        name: 'game',
        data: {
          action: 'finishQuiz',
          score,
          answers,
          roomNumber: roomid,
        }
      });

      // 重新拉取数据
      setTimeout(() => {
        this.initGame();
      }, 1000);

    } else {
      this.setData({
        quizPreLoading: true,
        progressIndex: progressIndex + 1,
      });

      setTimeout(() => {
        this.setData({
          quizPreLoading: false,
        });

        countDownInterval = setInterval(() => {
          const { countDown, answers } = this.data;
          if (countDown <= 0) {
            // 超时, 算作错误
            clearInterval(countDownInterval);
            countDownInterval = null;
            wx.showToast({
              title: '答题超时',
              icon: 'none',
              duration: 2000,
            });
            answers.push(0);
            this.setData({
              answers,
              countDown: COUNT_DOWN,
            });
            setTimeout(() => {
              this.moveToNextQuiz();
            }, 2000);
          } else {
            this.setData({
              countDown: countDown - 1,
            })
          }
        }, 1000);
      }, 1000)
    }
  },

  loadGame(roomid) {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'game',
        data: {
          action: 'load',
          roomNumber: roomid,
        },
        success: res => {
          resolve(res);
        }
      })
    })
  },

  onemoreBattle() {
    wx.navigateTo({
      url: `/pages/room/room`,
    });
  },

  initScoreProgress(participates) {
    const curOpenid = app.globalData.openid;
    const curUser = participates.find(p => p.pid === curOpenid);
    const otherUser = participates.find(p => p.pid !== curOpenid);

    const correctCalc = (answers) => {
      return answers.reduce((acc, item) => acc += item, 0);
    }

    if (curUser) {
      const { answers } = curUser;
      const curCorrects = correctCalc(answers);
      const curScore = this.scoreCalc(curCorrects);

      this.setData({
        curScore,
      })
    }

    if (otherUser) {
      const { answers } = otherUser;
      const otherCorrects = correctCalc(answers);
      const otherScore = this.scoreCalc(otherCorrects);

      this.setData({
        otherScore,
      })
    }
  },

  initGame() {
    Promise.all([
      this.loadGame(this.data.roomid),
    ]).then(([gameRes]) => {
      if (gameRes && gameRes.result && gameRes.result.code === 0) {
        const game = gameRes.result.game;
        // 查看状态
        const curOpenid = app.globalData.openid;
        const curUser = game.participates.find(p => p.pid === curOpenid);
        if (curUser) {
          const { status, score, answers } = curUser;
          if (status === 'finished') {
            this.setData({
              ready: true,
              finished: true,
              quizs: game.quiz,
              curUser,
              participates: game.participates,
            });

            // 与另一个对手作比较
            const otherUser = game.participates.find(p => p.pid !== curOpenid) || {};
            const {
              status: otherStatus,
              score: otherScore,
              answers: otherAnswers = [],
            } = otherUser;
            let isWin = false;
            let otherFinished = false
            if (otherStatus === 'finished') {
              // 生成比较
              isWin = score > otherScore;
              otherFinished = true;
            }

            const resultPanel = [];
            game.quiz.forEach((item, idx) => {
              const otherAnswer = otherAnswers[idx];
              resultPanel.push({
                curResult: answers[idx],
                otherResult: otherAnswer === undefined ? -1 : otherAnswer,
                question: game.quiz[idx].word,
              });
            });
            this.setData({
              resultPanel,
              isWin,
              otherUser,
              otherFinished,
            });
            this.initScoreProgress(game.participates);
          } else {
            this.setData({
              ready: true,
              quizs: game.quiz,
              participates: game.participates,
            });
            this.moveToNextQuiz();
          }
        }
      }
    })
  },

  onLoad(options) {
    this.setData({
      roomid: options.roomid,
    })
  },


  onReady() {
    this.initGame();
  }
});
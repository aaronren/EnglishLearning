const app = getApp();

const COUNT_DOWN = 6;

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
    wrongAnswerIdx: -1,
    rightAnswerIdx: -1,
  },

  async makeDicision(event) {
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

        this.setData({
          rightAnswerIdx: answer,
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

  moveToNextQuiz() {
    this.setData({
      wrongAnswerIdx: -1,
      rightAnswerIdx: -1,
      countDown: COUNT_DOWN,
    });
    const { progressIndex, quizs } = this.data;
    if (progressIndex === quizs.length - 1) {
      // wx.showToast({
      //   title: '回答完毕, 正在提交结果',
      //   icon: 'none',
      //   duration: 2000,
      // });
      // const score = Math.floor((correct / quizs.length) * 100);
      // await wx.cloud.callFunction({
      //   name: 'game',
      //   data: {
      //     action: 'finishQuiz',
      //     score,
      //     roomNumber: roomid,
      //   }
      // });

      // const eventChannel = this.getOpenerEventChannel();
      // eventChannel.emit('quizFinishHandler');

      // wx.navigateBack({
      //   score,
      // })
    } else {
      this.setData({
        quizPreLoading: true,
        progressIndex: progressIndex + 1,
      });

      setTimeout(() => {
        this.setData({
          quizPreLoading: false,
        });

        let interval = setInterval(() => {
          const { countDown, answers } = this.data;
          if (countDown <= 0) {
            // 超时, 算作错误
            clearInterval(interval);
            interval = null;
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
      }, 2000)
    }
  },

  onLoad(options) {
    this.setData({
      roomid: options.roomid,
    })

    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'load',
        roomNumber: options.roomid,
      },
      success: res => {
        if (res && res.result && res.result.code === 0) {
          const game = res.result.game;
          this.setData({
            ready: true,
            quizs: game.quiz,
            participates: game.participates,
          });
          console.log('quizs', game.quiz);
          this.moveToNextQuiz();
        }
      }
    })
  }
});
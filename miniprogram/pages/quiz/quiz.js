const app = getApp();

Page({
  /**
   * 页面数据缓存
   */

  data: {
    quizs: [], // 考卷
    progressIndex: 0, // 进度
    correctCnt: 0, // 正确数
  },

  async makeDicision(event) {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const optionIdx = dataset.index;

    const { quizs, progressIndex, correctCnt, roomid } = this.data;
    const currentQuestion = quizs[progressIndex];
    let correct = correctCnt;
    if (currentQuestion) {
      const { answer } = currentQuestion.quiz;
      if (answer === optionIdx) {
        // 回答正确
        correct += 1;
        this.setData({
          correctCnt: correct,
        });

        // TODO 动画
      } else {
        // 回答错误
        // TODO 动画
      }

      // 移动到下一题
      if (progressIndex === quizs.length - 1) {
        wx.showToast({
          title: '回答完毕, 正在提交结果',
          icon: 'none',
          duration: 2000,
        });
        const score = Math.floor((correct / quizs.length) * 100);
        await wx.cloud.callFunction({
          name: 'game',
          data: {
            action: 'finishQuiz',
            score,
            roomNumber: roomid,
          }
        });

        const eventChannel = this.getOpenerEventChannel();
        eventChannel.emit('quizFinishHandler');

        wx.navigateBack({
          score,
        })
      } else {
        this.setData({
          progressIndex: progressIndex + 1,
        });
      }
    }
  },

  test(event) {
    console.log('event', event);
  },

  onLoad(options) {
    console.log('options', options);

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
        console.log('load game', res);
        if (res && res.result && res.result.code === 0) {
          console.log('quizs', res.result.game.quiz);
          this.setData({
            quizs: res.result.game.quiz,
          });
        }
      }
    })
  }
});
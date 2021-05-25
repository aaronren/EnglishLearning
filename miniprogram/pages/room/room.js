// miniprogram/pages/room/room.js

const app = getApp();

Page({
  data: {
    gameInfo: null,
    participates: [],
    curOpenId: '',
    button: null,
  },

  joinRoomAction() {
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'join',
        roomNumber: '1234567',
        userInfo: app.globalData.userInfo,
      },
      success: res => {
      }
    })
  },

  createRoomAction() {
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'createRoom',
        roomNumber: '1234567',
        userInfo: app.globalData.userInfo,
      },
      success: res => {
        this.initGame(res.result.data);
      }
    })
  },

  beginQuiz() {
    wx.navigateTo({
      url: `/pages/quiz/quiz?roomid=${'1234567'}`,
      events: {
        acceptDataFromOpenedPage: (data) => {
          console.log('data', data);
        }
      }
    })
  },

  initGame(gameInfo) {
    const { participates = [] } = gameInfo;
    const data = {
      participates,
    };
    const curOpenId = app.globalData.openid;
    const curUser = participates.find(p => p.pid === curOpenId);
    if (curUser) {
      data.curUser = curUser;
    } else {
      if (participates.length === 2) {
        this.setData({
          ...data,
          button: {
            disable: true,
            msg: '人数已满',
          }
        })
      } else {
        this.setData({
          ...data,
          button: {
            disable: false,
            msg: '加入',
            action: this.joinRoomAction,
          }
        })
      }
      return;
    }
    this.setData({
      ...data,
    });
  },

  finishHandler() {
    wx.showToast({
      title: '您已经参加过了比赛了~',
      icon: 'none',
      duration: 2000,
    })
  },

  onLoad() {
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'load',
        roomNumber: '1234567',
      },
      success: res => {
        console.log('load game', res);
        if (res && res.result && res.result.code === 0) {
          const game = res.result.game;
          if (!game) {
            this.createRoomAction();
          } else {
            this.initGame(game);
          }
        }
      }
    })
  }
})
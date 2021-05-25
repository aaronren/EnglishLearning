// miniprogram/pages/room/room.js

const app = getApp();

Page({
  data: {
    gameInfo: null,
    participates: [],
    quiz: [],
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

  beginGame() {
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'beginQuiz',
        roomNumber: '1234567',
      },
      success: res => {
        console.log('begin', res)
      }
    })
  },

  initGame(gameInfo) {
    const { participates = [], quiz = [] } = gameInfo;
    const data = {
      participates,
      quiz,
    };
    const curOpenId = app.globalData.openid;
    const curUser = participates.find(p => p.pid === curOpenId);
    if (curUser) {
      data.curUser = curUser;
    } else {
      console.log('init join')
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
    }
    this.setData({
      ...data,
    });
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
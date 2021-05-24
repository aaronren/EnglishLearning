// miniprogram/pages/room/room.js

const app = getApp();

Page({
  data: {

  },

  joinRoomAction() {
    console.log('join room action trigger');
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'join',
        roomNumber: '1234567',
      },
      success: res => {
        console.log('resyktLLL', res);
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

  onLoad() {
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'load',
        roomNumber: '1234567',
      },
      success: res => {
        console.log('load game', res);
      }
    })
  }

})
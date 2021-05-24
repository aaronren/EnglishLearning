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
  }
})
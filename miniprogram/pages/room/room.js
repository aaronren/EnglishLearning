// miniprogram/pages/room/room.js
const event = require('../../utils/event');

const app = getApp();

Page({
  data: {
    roomInput: [],
    inputFocus: false,
    curUser: null,
  },

  directToQuizPage() {
    const roomNumber = this.data.roomInput.join('');
    wx.navigateTo({
      url: `/pages/quiz/quiz?roomid=${roomNumber}`,
    });
  },

  joinRoomAction() {
    if (this.data.roomInput.length < 4) {
      wx.showToast({
        title: '房间号不正确, 请重新输入',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    const roomNumber = this.data.roomInput.join('');
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'join',
        roomNumber,
        userInfo: app.globalData.userInfo,
      },
      success: res => {
        if (res && res.result.code === 0) {
          wx.showToast({
            title: '加入成功',
            duration: 2000,
            icon: 'none',
            complete: () => {
              this.directToQuizPage();
            }
          });
        } else {
          // 已经在队伍中, 直接进入quiz页面
          if (res.result.code === 100) {
            this.directToQuizPage();
          } else {
            wx.showToast({
              title: '加入房间失败',
              duration: 2000,
              icon: 'none',
            });
          }
        }
      }
    })
  },

  createRoomAction() {
    wx.cloud.callFunction({
      name: 'game',
      data: {
        action: 'createRoom',
        userInfo: app.globalData.userInfo,
      },
      success: res => {
        this.setData({
          roomInput: res.result.data.roomNumber.split(''),
        });
        wx.showToast({
          title: '创建房间成功',
          duration: 2000,
        })
      }
    })
  },

  roomInputChangeHandler(event) {
    const { detail } = event;
    this.setData({
      roomInput: detail.value.split(''),
    })
  },

  focusInputHandler() {
    console.log('focusInput')
    this.setData({
      inputFocus: true,
    })
  },

  onLoad() {
    event.on('userHasLogin', this, (param) => {
      this.setData({
        curUser: param,
      });
    })
  },
})
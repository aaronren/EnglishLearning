// miniprogram/pages/room/room.js

const app = getApp();

Page({
  data: {
    gameInfo: null,
    participates: [],
    curOpenId: '',
    button: null,
    roomInput: [],
    inputFocus: false,
  },

  directToQuizPage() {
    const roomNumber = this.data.roomInput.join('');
    wx.navigateTo({
      url: `/pages/quiz/quiz?roomid=${roomNumber}`,
      events: {
        quizFinishHandler: () => {
          // this.initPage();
        }
      }
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
        roomNumber: '1234567',
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

  beginQuiz() {
    
  },

  roomInputChangeHandler(event) {
    const { detail } = event;
    this.setData({
      roomInput: detail.value.split(''),
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

  initPage() {
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
    });
  },

  finishHandler() {
    wx.showToast({
      title: '您已经参加过了比赛了~',
      icon: 'none',
      duration: 2000,
    })
  },

  focusInputHandler() {
    console.log('focusInput')
    this.setData({
      inputFocus: true,
    })
  },

  onLoad() {
    this.initPage();
  },

  onReady() {
    const querySelector = wx.createSelectorQuery().in(this);
    const inputDom = querySelector.select('#roomInput');
    const inputDom1 = querySelector.select('.hiddenInput').node((res) => {
      console.log('00000', res)
    });

    console.log('inputDom', inputDom, inputDom1);
  },
})
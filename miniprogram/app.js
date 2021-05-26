//app.js
const mta = require('./utils/mta_analysis.js')
const event = require('./utils/event.js')
const storage = require('./utils/storage.js')
const media = require('./utils/media.js')

App({

  globalData: {
    openid: '',
    userInfo: undefined,
    wordbook: 'KET',
    dailynumber: 5,
    caseWords: [], // 今次学习的单词, 字符串数组
    caseWordObjs: [], // 今次学习单词对象列表
    records: [], // 学习记录
    remindTime: 0
  },

  onLaunch: function (options) {

    mta.App.init({
      "appID":"500724250",
      "eventID":"500724254",
      "lauchOpts":options,
      "autoReport": true,
      "statParam": true,
      "statShareApp":true,
      "ignoreParams": []
    })
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: wx.cloud.DYNAMIC_CURRENT_ENV, //'online-0fkul', // 'debug-0k6dy',
        traceUser: true,
      })
    }

    // 基础设置信息
    var word_book = storage.read('WORD_BOOK')
    if (word_book) {
      this.globalData.wordbook = word_book // "KET" "PET"
    }
    var daily_number = storage.read('DAILY_NUMBER')
    if (daily_number) {
      this.globalData.dailynumber = daily_number
    }

    // 注册后可以接收到通知带来的参数
    event.on('dailyRecordSuccess', this, function(param) {
      this.gainCloudRecords()
    })
    // enroll界面登录后获得通知
    event.on('userHasLogin', this, function(param) {
      this.globalData.userInfo = param
    })

    // 获取OpenId
    this.gainGlobalOpenId()
    
    // 获取全局数据
    this.gainCloudRecords()

    // 获取用户信息
    this.gainUserInfo()
  },

  onShow: function (options) {
    // 初始化音频
    media.initAudioContext()
  },

  onHide: function () {
    // 销毁
    media.destroyAudioContext()
  },

  gainGlobalOpenId() {
    // 调用云函数登录
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        this.globalData.openid = res.result.openid
        // 使用Openid统计数据上报
        mta.Data.userInfo = {'open_id':res.result.openid}
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  gainCloudRecords() {
    wx.cloud.callFunction({
      name: 'getRecords',
      success: res => {
      },
      fail: err => {
        console.error('调用失败：', err)
        wx.reportMonitor('gainCloudRecordsError', 1)
      },
      complete: res => {
        this.globalData.records = res.result.data.reverse()
        // 发送通知
        event.emit('gainCloudRecords', this.globalData.records)
      }
    })
  },

  // 页面onload时获取用户信息
  gainUserInfo: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 发送通知
              event.emit('userHasLogin', res.userInfo);
            }
          })
        }
      }
    })
  }
})

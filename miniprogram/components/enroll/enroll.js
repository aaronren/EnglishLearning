// components/enroll/enroll.js

const mta = require('../../utils/mta_analysis.js')
const event = require('../../utils/event.js')
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 是否显示，内部自动控制
    show: false,
    // 用户信息
    avatarUrl: 'http://www.aaronview.cn/image/unlogin.png',
    userInfo: undefined
  },

  /**
   * 组件生命周期事件
   */
  lifetimes: {
    attached() {
      if (app.globalData.userInfo == undefined) {
        this.setData({
          show: true
        })
        // 注册授权监听，如果在app中成功授权，就隐藏本页
        event.on('userHasLogin', this, function(_userInfo) {
          // 在外部页面登录成功
          this.setData({
            show: false
          })
        })
      }
    },
    detached() {
      event.remove('userHasLogin',this)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 用户按了允许授权按钮
    bindGetUserInfo: function (res) {
      if (res.detail.userInfo) {
        //授权成功后
        this.setData({
          avatarUrl: res.detail.userInfo.avatarUrl,
          userInfo: res.detail.userInfo
        })
        // 发送通知
        event.emit('userHasLogin', res.detail.userInfo)
        // 授权事件上报
        mta.Event.stat('enroll_login',
        {'gender':res.detail.userInfo.gender,
        'city':res.detail.userInfo.city,
        'province':res.detail.userInfo.province
        })
      }
    }
  }
})

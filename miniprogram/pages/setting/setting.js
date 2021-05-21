// pages/setting/setting.js
const storage = require('../../utils/storage.js')
const event = require('../../utils/event.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookIndex: 0,
    bookPicker: [
      'KET',
      'PET'
    ],
    // once
    dailyIndex: 0,
    dailyPicker: [
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50
    ],

    // preIndex
    bookPreIndex: 0,
    dailyPreIndex: 0,

    saveEnable: false
  },

  bookPickerChange(e) {
    console.log(e);
    this.setData({
      bookIndex: e.detail.value,
      saveEnable: true
    })
  },

  dailyPickerChange(e) {
    console.log(e);
    this.setData({
      dailyIndex: e.detail.value,
      saveEnable: true
    })
  },

  // 上传用户设置
  setUserCloudData() {
    // wx.cloud.callFunction({
    //   name: 'userSetting',
    //   data: {
    //     currentBook: this.data.bookPicker[this.data.bookIndex],
    //     ketDailyNumber: this.data.bookIndex==0 ? this.data.dailyPicker[this.data.dailyIndex] : this.data.petNumber[this.data.petIndex],
    //     operateTime: timing.timestamp(),
    //     action: 'add'
    //   },
    //   success: res => {
    //     //event.emit('userSettingSuccess','')
    //   },
    //   fail: err => {
    //     console.error('设置调用失败：', err)
    //   }
    // })
  },

  toSave: function(e) {
    // 按钮重置
    this.setData({
      saveEnable: false
    })
    // 目前云端操作仅做类似上报的作用，并没有从云端读取配置
    storage.save('WORD_BOOK', this.data.bookPicker[this.data.bookIndex])
    app.globalData.wordbook = this.data.bookPicker[this.data.bookIndex]
    // 基础设置信息
    storage.save('DAILY_NUMBER', this.data.dailyPicker[this.data.dailyIndex])
    app.globalData.dailynumber = this.data.dailyPicker[this.data.dailyIndex]
    // 存储在线
    this.setUserCloudData()
    // 发送通知
    event.emit('settingChanged', '')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //
    var word_book = storage.read('WORD_BOOK')
    if (word_book && word_book == 'PET') {
      this.setData({
        bookIndex: this.data.bookPicker.indexOf(word_book),
        bookPreIndex: this.data.bookIndex
      })
    }
    var daily_number = storage.read('DAILY_NUMBER')
    if (daily_number) {
      this.setData({
        dailyIndex: this.data.dailyPicker.indexOf(daily_number),
        dailyPreIndex: this.data.dailyIndex
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('setting page unload.')
  }
})
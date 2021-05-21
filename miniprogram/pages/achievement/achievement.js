// miniprogram/pages/achievement/achievement.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 
    var wordObjs = []
    var words = options.words.split(',')
    var scores = options.scores.split(',')
    for (var idx in words) {
      var item = {}
      item['word'] = words[idx]
      item['star'] = scores[idx]
      wordObjs.push(item)
    }
    this.setData({
      wordsList: wordObjs
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
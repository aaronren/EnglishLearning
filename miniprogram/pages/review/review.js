// miniprogram/pages/review/review.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsList: [],
    selectedIndex: ["0", "1", "2", "3", "4"]
  },

  checkboxChange: function(e) {
    console.log('用户选中checkbox值为：', e.detail.value)
    console.log("长度:" + e.detail.value.length)
    if (e.detail.value.length > 30) {
      wx.showToast({
        title: '复习不要超过30个吧，注意质量',
        icon: 'none',
        duration: 2000
      })
    }
    // 30个仅做提示，实际还可以，避免与选择上不一致
    this.data.selectedIndex = e.detail.value
  },

  toReviewSelectWords: function(e) {
    if (this.data.selectedIndex.length < 5) {
      wx.showToast({
        title: '至少选择5个单词',
        icon: 'none',
        duration: 2000
      })
    } else {
      var select_words = []
      for (var idx in this.data.selectedIndex) {
        var sel_idx = this.data.selectedIndex[idx]
        if (sel_idx < this.data.wordsList.length) {
          select_words.push(this.data.wordsList[sel_idx].word)
        }
      }
      app.globalData.caseWords = select_words
      console.log("选择的单词:" + app.globalData.caseWords)
      this.toDailyWords()
    }
  },

  // 点击天数跳转
  toDailyWords: function() {
    wx.redirectTo({ // 新开
      url: '/pages/dailyWords/dailyWords'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //
    console.log("options: "+options)
    if (options && 'words' in options) {
      var wordObjs = []
      var words = decodeURIComponent(options.words).split(',')
      var scores = decodeURIComponent(options.scores).split(',')
      for (var idx in words) {
        var item = {}
        item['word'] = words[idx]
        item['star'] = scores[idx]
        wordObjs.push(item)
      }
      this.setData({
        wordsList: wordObjs
      })
    } else {
      // 上报异常
    }
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

  }
})
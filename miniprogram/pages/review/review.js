// miniprogram/pages/review/review.js
const request = require('../../utils/request.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsList: [],
  },

  toReviewSelectWords: function(e) {
    if (this.data.selectedIndex.length < 5) {
      wx.showToast({
        title: '满5个错题单词可开始，请再继续学习',
        icon: 'none',
        duration: 2000
      })
    } else {
      this.toDailyWords()
    }
  },

  // 点击天数跳转
  toDailyWords: function() {
    wx.redirectTo({ // 新开
      url: '/pages/dailyWords/dailyWords'
    })
  },

  parseDetailToGetExample: function(word) {
    var senseList = word['sense']
    // 找出其中的第一个例句
    var example = {}
    for (var idx in senseList) {
      var item = senseList[idx]
      var item = senseList[idx]
      if ('eg' in item) {
        var eglist = item['eg']
        for (var egidx in eglist) {
          var egitem = eglist[egidx]
          if ('en' in egitem && 'cn' in egitem) {
            example['en'] = egitem['en']
            example['cn'] = egitem['cn']
            return example
          }
        }
      }
    }
    return example
  },

  readyWordsStruct: function(words, scores, wordsDetail) {
    var wordObjs = []
    for (var idx in words) {
      var item = {}
      item['word'] = words[idx]
      item['star'] = scores[idx]
      var detail = wordsDetail[idx]
      var example = this.parseDetailToGetExample(detail)
      item['example'] = example
      wordObjs.push(item)
    }
    this.setData({
      wordsList: wordObjs
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //
    console.log("options: "+options)
    if (options && 'words' in options) {
      // 每次仅取前n个单词展示
      var words = decodeURIComponent(options.words).split(',').slice(0, app.globalData.dailynumber)
      var scores = decodeURIComponent(options.scores).split(',').slice(0, app.globalData.dailynumber)
      // 获取单词详细数据
      request.getWords(words, data => {
        if (data.length === app.globalData.dailynumber) {
          this.readyWordsStruct(words, scores, data)
        }
      })
    } else {
      // 上报异常
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
})
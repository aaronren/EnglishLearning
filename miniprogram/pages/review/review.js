// miniprogram/pages/review/review.js
const request = require('../../utils/request.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 单词数据结构 用于展示
    wordsList: [],
    // 用于开始学习
    words: [],
    wordsDetail: []
  },

  toReviewSelectWords: function(e) {
    if (this.data.wordsList.length < 5) {
      wx.showToast({
        title: '满5个错题单词可开始，请至主页学习',
        icon: 'none',
        duration: 2000
      })
    } else {
      this.toDailyWords()
    }
  },

  // 跳转开始学习
  toDailyWords: function() {
    app.globalData.caseWords = this.data.words
    app.globalData.caseWordObjs = this.data.wordsDetail
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
    // 如果没有例句，用释义兜底
    if (!example['en']) {
      example['en'] = word['word']
      example['cn'] = word['trans']
    }
    return example
  },

  /**
   * 后台返回详细数据的顺序可能不一致，需要取match的
   */
  findMatchWord: function(word, wordsDetail) {
    var matchedDetail = {}
    for (var idx in wordsDetail) {
      var detail = wordsDetail[idx]
      if (word === detail['word']) {
        matchedDetail = detail
        break;
      }
    }
    return matchedDetail
  },

  readyWordsStruct: function(words, scores, wordsDetail) {
    var wordObjs = []
    for (var idx in words) {
      var item = {}
      item['word'] = words[idx]
      item['star'] = scores[idx]
      var detail = this.findMatchWord(words[idx], wordsDetail)
      var example = this.parseDetailToGetExample(detail)
      item['example'] = example
      wordObjs.push(item)
    }
    this.setData({
      wordsList: wordObjs
    })
    if (words.length === app.globalData.dailynumber) {
      this.data.words = words
      this.data.wordsDetail = wordsDetail
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options: "+options)
    if (options && 'words' in options) {
      var words = decodeURIComponent(options.words).split(',')
      var scores = decodeURIComponent(options.scores).split(',')
      // 每次仅取前n个单词展示
      var len_n = words.length > app.globalData.dailynumber ? app.globalData.dailynumber : words.length
      words = words.slice(0, len_n)
      scores = scores.slice(0, len_n)
      // 获取单词详细数据
      request.getWords(words, data => {
        if (data.length === len_n) {
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
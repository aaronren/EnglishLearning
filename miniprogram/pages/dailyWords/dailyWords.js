// miniprogram/pages/dailyWords.js
const timing = require('../../utils/timing.js')
const event = require('../../utils/event.js')
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    startTimestamp: 0,
    isLoading: false,
    // 本次训练词汇表
    wordList: [],
    wordCount: 0,
    wordIndex: 0,
    // learn单词记忆的‘下一个’
    nextBtnEnable: true
  },

  // 加载当次学习数据，当前的随机方法可能会重复选中单词
  getStudyWords() {
    var tstart = timing.timestamp()
    this.setData({
      isLoading: true
    })
    // 需要学习的单词
    // if (app.globalData.caseWords.length <= 0) {
    //   console.error('app.globalData.caseWords.length <= 0')
    //   wx.reportMonitor('caseWordsEmpty', 1)
    //   event.emit('gainCloudRecords', app.globalData.records)
    // }
    const word_list = app.globalData.caseWords // ['chair'] //
    wx.cloud.callFunction({
      name: 'getWords',
      data: {
        words: word_list
      },
      success: res => {
        timing.dTimeLog(tstart, 'dailyWords - getStudyWords')
        this.data.wordList = res.result.data
        app.globalData.caseWordObjs = res.result.data
        this.setData({
          wordCount: this.data.wordList.length,
          wordIndex: 0
        })
        // 获取第一个单词
        this.loadCurrentWord(0, true)
        this.setData({
          isLoading: false
        })
      },
      fail: err => {
        console.error('dailyWords - getWords调用失败：', err)
        wx.reportMonitor('getCloudStudyWordsFail', 1)
      }
    })
  },

  //-----------------------------------------------------------------------------------------

  loadCurrentWord: function(index,autoplay) {
    if (index < this.data.wordCount) {
      this.setData({
        wordIndex: index
      })
      var curWord = this.data.wordList[index]
      const word_detail_component = this.selectComponent('.scroll-view') //获取WordDetail组件
      word_detail_component.prepareData(curWord, false, 0)
      if (autoplay) {
        word_detail_component.playWord()
      }
    } else { // 超出范围则显示双按钮
      this.setData({
        wordIndex: index
      })
    }
  },

  toRepeatLearn: function() { //显示释义
    //
    this.loadCurrentWord(0,true)
  },

  toNextLearn: function() {
    //
    this.setData({
      nextBtnEnable: false
    })
    this.loadCurrentWord(this.data.wordIndex+1,true)
    // 1.0s后才能切换下个单词
    var that = this
    setTimeout(function() {
      that.setData({
        nextBtnEnable: true
      })
    }, 1000)
  },

  toPracticePage: function() {
    // 通知学习完毕，更新单词组
    event.emit('dailyLearned', '')
    // 关闭当前页并新开
    wx.redirectTo({
      url: '/pages/practice/practice'
    })
  },

  //-----------------------------------------------------------------------------------------
  //生命周期
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //
    if (app.globalData.caseWords.length <= 0) {
      app.globalData.caseWords = ["travel","chair","across","indoors","add"]
      console.error('app.globalData.caseWords.length <= 0')
      wx.reportMonitor('caseWordsEmpty', 1)
    }
    //
    console.log('dailyWords onLoad')
    // 请求单词列表 并初始化第一个单词
    this.getStudyWords()
    this.data.startTimestamp = timing.timestamp()
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
    console.log('daliyWords hide.')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('daliyWords unload.')
  }
})
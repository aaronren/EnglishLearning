// miniprogram/pages/oneWord/oneWord.js
const timing = require('../../utils/timing.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    startTimestamp: 0,
    isLoading: false,
    showError: false // 显示无单词错误界面
  },

  // 加载搜索单词
  getSearchWord(the_word) {
    var tstart = timing.timestamp()
    this.setData({
      isLoading: true,
      showError: false
    })
    // 用户输入单词，以及全小写，确保能搜出首字母大写，或全小写的单词
    var word_list = [the_word, the_word.toLowerCase()] // ['chair']
    wx.cloud.callFunction({
      name: 'getWords',
      data: {
        words: word_list
      },
      success: res => {
        timing.dTimeLog(tstart, 'dailyWords - getStudyWords')
        var wordList = res.result.data
        // 获取单词
        if (wordList.length > 0) {
          var curWord = wordList[0]
          const word_detail_component = this.selectComponent('.scroll-view') //获取WordDetail组件
          word_detail_component.prepareData(curWord, false, 0)
          word_detail_component.playWord()
        } else {
          // 没有返回结果
          this.setData({
            showError: true
          })
        }
        this.setData({
          isLoading: false
        })
      },
      fail: err => {
        console.error('oneWord - getWords调用失败：', err)
        wx.reportMonitor('getCloudStudyWordsFail', 1)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 请求单词列表 并初始化第一个单词
    this.getSearchWord(options.word)
    this.data.startTimestamp = timing.timestamp()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
})
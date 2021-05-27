// miniprogram/pages/index/index.js
const storage = require('../../utils/storage.js')
const event = require('../../utils/event.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    avatarUrl: 'http://www.aaronview.cn/image/unlogin.png',
    userInfo: undefined,

    // 学习数据
    learnedData: [[0, '-'], [0, '-'], [0, '-']],

    // 学习记录
    wordsList: [],
    scoreList: [],

    // 可用模块
    elements: [{
        name: 'battle',
        title: '单词对战',
        subtitle: '对战成绩比拼',
        color: '#FEF5F7',
        nav: 'room/room'
      },
      {
        name: 'review',
        title: '错题集',
        subtitle: '错题加强练习',
        color: '#E6FFF4',
        nav: 'review/review'
      },
      {
        name: 'setting',
        title: '学习设置',
        subtitle: '个人偏好设置',
        color: '#ECFEFF',
        nav: 'setting/setting'
      },
      {
        name: 'record',
        title: '学习记录',
        subtitle: '学习进阶详情',
        color: '#FFFDEB',
        nav: 'timeRecord/timeRecord'
      },
    ],
    curWordBook: 'KET',
    leftWordsNumber: 0
  },

  //授权成功后
  setUserInfo: function(_userInfo) {
    if (_userInfo != undefined) {
      this.setData({
        avatarUrl: _userInfo.avatarUrl,
        userInfo: _userInfo
      })
    }
  },

  // 用户按了允许授权按钮
  bindGetUserInfo: function (res) {
    if (this.data.userInfo==undefined && res.detail.userInfo) {
      // 授权成功后发通知，app.js也能获取userInfo
      event.emit('userHasLogin', res.detail.userInfo)
    }
  },

  // 拼接错题记录
  spliceReviewData() {
    var reviewWords = []
    var reviewScore = []
    var wlist = this.data.wordsList
    var slist = this.data.scoreList
    for (var widx in wlist) {
      if (slist[widx]<3) {
        reviewWords.push(wlist[widx])
        reviewScore.push(slist[widx])
      }
    }
    var temp_url = 'review/review?words=' + encodeURIComponent(reviewWords) + 
                    '&scores=' + encodeURIComponent(reviewScore)
    this.data.elements[1].nav = temp_url
    this.setData({
      elements: this.data.elements
    })
    console.log(this.data.elements[1].nav)
  },

  /**
   * 点击事件处理
   */

  toStudy() {
    wx.navigateTo({
      url: '/pages/dailyWords/dailyWords',
    })
  },

  toNavigatePage(e) {
    var idx = e.currentTarget.dataset.index
    if (idx === 2) {
      this.selectComponent('#setting').settingModalShow()
    } else {
      wx.navigateTo({ // 新开
        url: '/pages/' + this.data.elements[idx].nav
      })
    }
  },

  // 点击天数跳转
  toTimeRecord(e) {
    wx.navigateTo({ // 新开
      url: '/pages/timeRecord/timeRecord'
    })
  },

  // 点击已学单词和得分的跳转
  toAchievement(e) {
    wx.navigateTo({ // 新开
      url: '/pages/achievement/achievement?words=' + this.data.wordsList + '&scores=' + this.data.scoreList
    })
  },

  toSearch(e) {
    wx.navigateTo({ // 新开
      url: '/pages/search/search'
    })
  },

  toAbout(e) {
    wx.navigateTo({ // 新开
      url: '/pages/about/about'
    })
  },

  // 从历史记录里统计词汇总量、天数、已学单词、平均得分
  updateBasedata(records) {
    console.log("updateBasedata")
    // 统计不重复单词数量
    var words = {}
    // 统计不重复天数
    var days = {}
    // 单词最高得分
    var avgscore = 0
    // 循环统计
    for (var recordIdx in records) {
      // 单词列表
      var wlist = records[recordIdx].wordslist
      // 得分
      var slist = records[recordIdx].scorelist
      // 
      for (var wordIdx in wlist) {
        var word = wlist[wordIdx]
        if (wordIdx < slist.length) {
          if (words[word]) {
            if (slist[wordIdx] > words[word]) {
              words[word] =  slist[wordIdx]
            }
          } else {
            words[word] = slist[wordIdx]
          }
        }
      }
      if (slist && slist.length>0) {
        var eachAvg = 0
        for (var scoreIdx in slist) {
          eachAvg = eachAvg + slist[scoreIdx]
        }
        avgscore = avgscore + eachAvg / slist.length
      }
      // 时间
      var date = records[recordIdx].starttime
      var dateStr = new Date(date).toDateString()
      if (days[dateStr]) {
        days[dateStr] = days[dateStr] + 1
      } else {
        days[dateStr] = 1
      }
    }
    const key_wordlist = Object.keys(words)
    const key_daylist = Object.keys(days)
    const avg_scorelist = records.length>0 ? (avgscore / records.length) : 0
    this.data.wordsList = key_wordlist
    this.data.scoreList = Object.values(words)

    var insisDays = [key_daylist.length, '坚持天数']
    var learnedWords = [key_wordlist.length, '已学单词']
    var averageSore = [avg_scorelist.toPrecision(2)+'/3', '平均得分']
    this.setData({
      learnedData: [insisDays, learnedWords, averageSore]
    })

    // 更新单词本和剩余单词信息显示
    this.updateBookInfo()

    // 筛选所有需要学习单词
    this.filteNeedLearnWords()

    // 拼接错题记录
    this.spliceReviewData()
  },

  // 筛选出需学单词
  filteNeedLearnWords() {
    // 当前单词本的单词列表
    var whole_list = app.globalData.bookWords
    //
    var studied_list = this.data.wordsList
    var score_list = this.data.scoreList
    //
    var dailyNumber = app.globalData.dailynumber
    var new_list = []
    var idx_in_whole = Math.floor(Math.random() * whole_list.length) // 起始查找的单词数，随机一个开始点
    var traversal_count = 0 // 已经遍历过的单词数，等于whole_list.length就停止
    while (new_list.length<dailyNumber) { // 本次学习单词未满
      if (traversal_count>=whole_list.length) {
        break // 全都遍历过了则退出
      }
      if (idx_in_whole<whole_list.length) { // 遍历游标未超出整个单词数组长度
        var the_word = whole_list[idx_in_whole]
        var the_studied_idx = studied_list.indexOf(the_word)
        if (the_studied_idx < 0) { // 未练习完成过
          new_list.push(the_word)
        } else {
          // 不满3星的继续学
          if (the_studied_idx<score_list.length && score_list[the_studied_idx]<3) {
            new_list.push(the_word)
          }
        }
        idx_in_whole++
      } else { // 如果已经超出整个单词数组长度
        idx_in_whole = 0 // 从第一个开始找未学过的
      }
      traversal_count++
    }
    if (new_list.length <= 0) {
      // 上报异常
      console.error('list blank')
      wx.reportMonitor('caseWordsEmpty', 1)
    }
    app.globalData.caseWords = new_list
    this.getStudyWords()
  },

  // 加载当次学习数据，当前的随机方法可能会重复选中单词
  getStudyWords() {
    const word_list = app.globalData.caseWords // ['chair'] //
    wx.cloud.callFunction({
      name: 'getWords',
      data: {
        words: word_list
      },
      success: res => {
        app.globalData.caseWordObjs = res.result.data
      },
      fail: err => {
        console.error('index - getWords调用失败：', err)
        wx.reportMonitor('getCloudStudyWordsFail', 1)
      }
    })
  },

  updateBookInfo() {
    var book = storage.read('WORD_BOOK') || 'KET'
    var leftNumber = app.globalData.bookWordList[book].length - this.data.learnedData[1][0]
    if (leftNumber < 0) {
      leftNumber = 0
    }
    this.setData({
      curWordBook: book,
      leftWordsNumber: leftNumber
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    this.setUserInfo(app.globalData.userInfo)
    // 注册授权监听，如果在本页或登录页授权，就更新本页头像
    event.on('userHasLogin', this, function(_userInfo) {
      // 在外部页面登录成功
      this.setUserInfo(_userInfo)
    })
    // 注册后可以接收到通知带来的参数，学习完成后返回会调用此处来刷新
    event.on('gainCloudRecords', this, function(records) {
      this.updateBasedata(records)
    })
    // 重新初始化单词列表
    event.on('bookWordsChanged', this, function() {
      this.updateBookInfo()
      this.filteNeedLearnWords()
    })
    // 更新单词组
    event.on('dailyLearned', this, function() {
      this.filteNeedLearnWords()
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    event.remove('userHasLogin',this)
    event.remove('gainCloudRecords',this)
    event.remove('bookWordsChanged',this)
    event.remove('dailyLearned',this)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
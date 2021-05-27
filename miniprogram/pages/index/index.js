// miniprogram/pages/index/index.js
const ketlist = require('../../data/ketWords.js')
const petlist = require('../../data/petWords.js')
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
    insistDays: 0,
    learnedWords: 0,
    averageSore: 0,

    // 学习记录
    wordsList: [],
    scoreList: [],

    // 可用模块
    elements: [{
        title: '开始学习',
        name: 'Start',
        color: 'blue',
        icon: 'newsfill',
        nav: 'dailyWords/dailyWords'
      },
      {
        title: '学习记录',
        name: 'Record',
        color: 'purple',
        icon: 'timefill',
        nav: 'timeRecord/timeRecord'
      },
      {
        title: '错题集',
        name: 'Review',
        color: 'orange',
        icon: 'edit',
        nav: 'review/review'
      },
      {
        title: '学习设置',
        name: 'Setting',
        color: 'grey',
        icon: 'settingsfill',
        nav: 'setting/setting'
      },
    ],
    settingModalShow: false,
    settingBookOptions: {
      name: ['单词本'],
      books: [
        'KET',
        'PET'
      ],
      words: ['750词'],
      value: [0, 0, 0],
    },
    settingDailyOptions: {
      name: ['每次词汇量'],
      number: [
        5, 10, 15, 20, 25, 30, 35, 40, 45, 50
      ],
      unit: ['词'],
      value: [0, 0, 0],
    },
    settingBookValue: 'KET',
    settingDailyValue: 5,
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

  beginStudy() {
    wx.navigateTo({
      url: '/pages/dailyWords/dailyWords',
    })
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
    this.data.elements[2].nav = temp_url
    this.setData({
      elements: this.data.elements
    })
    console.log(this.data.elements[2].nav)
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
      // url: '/pages/achievement/achievement'
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
    this.setData({
      learnedWords: key_wordlist.length,
      insistDays: key_daylist.length,
      averageSore: avg_scorelist.toPrecision(2)
    })

    // 筛选所有需要学习单词
    this.filteNeedLearnWords()

    // 拼接错题记录
    this.spliceReviewData()
  },

  // 筛选出需学单词
  filteNeedLearnWords() {
    // 所有单词
    var whole_list = [];
    if (app.globalData.wordbook == "KET") {
      whole_list = ketlist.wordList
    } else if (app.globalData.wordbook == "PET") {
      whole_list = petlist.wordList
    } else {
      whole_list = ketlist.wordList
    }
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

  settingBookChange(event) {
    const { detail } = event;
    this.setData({
      settingBookValue: this.data.settingBookOptions.books[detail.value[1]]
    });
  },

  settingDailyChange(event) {
    const { detail } = event;
    this.setData({
      settingDailyValue: this.data.settingDailyOptions.number[detail.value[1]]
    });
  },

  /**
   * 学习设置保存函数
   */
  settingSaveActon() {
    const { settingBookValue, settingDailyValue } = this.data;

    // 目前云端操作仅做类似上报的作用，并没有从云端读取配置
    storage.save('WORD_BOOK', settingBookValue)
    app.globalData.wordbook = settingBookValue
    // 基础设置信息
    storage.save('DAILY_NUMBER', settingDailyValue)
    app.globalData.dailynumber = settingDailyValue

    // 发送通知
    event.emit('settingChanged', '');

    this.settingModalHide();

    wx.showToast({
      title: '设置保存成功',
      duration: 2000,
      icon: 'none',
    });
  },

  settingModalHide() {
    this.setData({
      settingModalShow: false,
    })
  },

  settingModalShow() {
    const { settingBookOptions, settingDailyOptions } = this.data;
    // read storage
    const wordBook = storage.read('WORD_BOOK') || 'KET'
    const dailyNumber = storage.read('DAILY_NUMBER') || 5
    
    this.setData({
      settingBookOptions: {
        ...settingBookOptions,
        value: [0, settingBookOptions.books.indexOf(wordBook) || 0, 0],
      },
      settingDailyOptions: {
        ...settingDailyOptions,
        value: [0, settingDailyOptions.number.indexOf(dailyNumber) || 0, 0],
      },
      settingModalShow: true,
    });
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
    event.on('settingChanged', this, function() {
      this.filteNeedLearnWords()
    })
    // 更新单词组
    event.on('dailyLearned', this, function() {
      this.filteNeedLearnWords()
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    event.remove('userHasLogin',this)
    event.remove('gainCloudRecords',this)
    event.remove('settingChanged',this)
    event.remove('dailyLearned',this)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
// miniprogram/pages/practice/practice.js
const timing = require('../../utils/timing.js')
const event = require('../../utils/event.js')
const media = require('../../utils/media.js')
const utils = require('../../utils/utils.js')
const app = getApp()
const pushId = 'LmksV0w7m6py37BcSMOMArEEB9UxInLEh9xydqmFbJs'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 练习步骤
    stepIndex: -1,
    stepCount: 3,
    // 进度
    progress: '0%',

    showFirstTip: false,
    startTimestamp: 0,

    // 本次训练词汇表
    wordList: [],
    wordCount: 0,

    // 3步骤对错状态
    scoreState: {}, // 只记录对错

    // Test words
    randomWordList: [], // 乱序后的，供练习用
    wordIndex: 0,

    // Current显示单词
    currentWord: {},

    // mean the word
    randomFourWord: [],
    wrongSelectIndex: -1,
    rightSelectIndex: -1,

    // spell
    spellWord: '',
    spellDisabled: false,
    spellShowRemind: false,

    // 学习提醒时间
    remindTime: '19:00'
  },

  // 上传学习结果
  recordCloudData(word_list, score_list, finish_step) {
    wx.cloud.callFunction({
      name: 'dailyRecord',
      data: {
        wordslist: word_list,
        starttime: this.data.startTimestamp,
        endtime: timing.timestamp(),
        scorelist: score_list,
        finishstep: finish_step
      },
      success: res => {
        event.emit('dailyRecordSuccess','')
      },
      fail: err => {
        console.error('调用失败：', err)
        wx.reportMonitor('uploadCloudRecordFail', 1)
      }
    })
  },

  // 初始化Scores
  prepareScores(word_list) {
    var len = word_list.length
    for (var idx=0;idx<len;idx++) {
      var key_word = word_list[idx]
      var word_str = key_word['word']
      this.data.scoreState[word_str] = [1,1,1] // 1 初始标识为‘正确’
    }
  },

  // 步骤设置
  nextSteps() {
    this.setData({
      // index设置
      stepIndex: this.data.stepIndex == this.data.stepCount ? 0 : this.data.stepIndex + 1,
      // 数据乱序
      randomWordList: utils.disorder(this.data.wordList),
      //
      wordIndex: 0,
      //
      progress: this.data.stepIndex==(this.data.stepCount-1)?'100%':this.data.progress,
      // 完成时间
      remindTime: timing.subscribeTime()
    })
    //
    switch (this.data.stepIndex) {
      case 0: //选词义
        this.loadCurrentMean(0)
        break
      case 1: //选单词
        this.loadCurrentMean(0)
        break
      case 2: //拼写
        this.loadCurrentWord(0,true)
        // 注册拼写的通知回调
        event.on('spellSuccess', this, function(param) {
          var that = this
          setTimeout(function() {
            that.setData({
              spellDisabled: false
            })
            if (that.data.wordIndex >= that.data.wordCount-1) {
              that.nextSteps()
            } else {
              that.loadCurrentWord(that.data.wordIndex+1,true)
            }
          }, 1000) // 1s后切换单词
          
        })
        break
    }
  },

  // 更新score数组。score初始值都是'1'，只有出错时才更新为0
  updateScoreStateWhenFail() {
    switch (this.data.stepIndex) {
      case 0:
        this.data.scoreState[this.data.currentWord.word][0] = 0
        break
      case 1:
        this.data.scoreState[this.data.currentWord.word][1] = 0
        break
      case 2:
        this.data.scoreState[this.data.currentWord.word][2] = 0
        break
    }
  },

  // 更新成绩得分
  updateAchievement() {
    var learnResult = {}
    // 如果已经学习了一半退出则记录，否则不记录
    if (this.data.stepIndex>1) {
      var wlist = []
      var slist = []
      var word_list = this.data.wordList
      var score_state = this.data.scoreState
      for (var ij=0;ij<word_list.length;ij++) {
        var word = word_list[ij].word
        wlist[ij] = word
        slist[ij] = 0
        // 只累加到完成的那一步
        for (var kk=0;kk<this.data.stepIndex;kk++) {
          slist[ij] = slist[ij] + score_state[word][kk]
        }
      }
      learnResult['words'] = wlist
      learnResult['scores'] = slist
    }
    return learnResult
  },

  // 单词发音
  toPlayWord: function() {
    console.log('this.data', this.data.currentWord)
    media.playWordAudio(this.data.currentWord.uk_audio)
  },

  // 发出对或错的提示音
  toPlayTipAudio: function(is_right) {
    media.playTipAudio(is_right)
  },

  // 首次学习弹窗提示隐藏
  toHideModal(e) {
    this.setData({
      showFirstTip: false
    })
  },

  // 学习结束的完成按钮，查看学习结果
  toCheckAchievement(e) {
    var result = this.updateAchievement()
    wx.redirectTo({ // 关闭当前页并新开
      url: '/pages/achievement/achievement?words=' + result['words'] + '&scores=' + result['scores']
    })
  },

  /**
   * 设置提醒
   */
  // 请求订阅
  toAddSubscribeMessage(e) {
    const self = this
    wx.requestSubscribeMessage({
      tmplIds: [pushId],
      success(res) {
        console.log(res)
        if (res.errMsg === 'requestSubscribeMessage:ok' && res[pushId] == 'accept') {
        self.subscribeMessageSend()
        }
      },
      complete(res) {
        console.log(res)
      }
    })
  },

  // 下发订阅消息
  subscribeMessageSend() {
    const self = this
    wx.cloud.callFunction({
      name: 'subscribeRemind',
      data: {
        type: "1"
      },
      success: res => {
        wx.showModal({
          title: '已添加提醒',
          content: '明天继续努力哦～',
          showCancel: false,
          success: function (res) {
            console.log('showModel res: '+res)
            if (res.confirm) {
              self.toCheckAchievement()
            }
          }
        })
      }
    })
  },

  //-----------------------------------------------------------------------------------------
 
  loadCurrentWord: function(index,autoplay) {
    if (index < this.data.wordCount) {
      var curWord = this.wordPracticeInfoGen(this.data.randomWordList[index]);
      this.setData({
        wordIndex: index,
        currentWord: curWord,
        progress: (this.data.stepIndex*this.data.wordCount+index)/(this.data.stepCount*this.data.wordCount)*100 + '%'
      })
      if (autoplay) {
        this.toPlayWord()
      }
    } else { // 超出范围则显示双按钮
      this.nextSteps()
    }
  },

  //-----------------------------------------------------------------------------------------
  //词义练习：听词选义，看义选词...

  /*
  指定当前word，currentWord，并生成随机四个单词
  index是当次练习的词组中的current单词的索引
  */
  loadCurrentMean: function(index) {
    var autoplay = true
    if (this.data.stepIndex==1) {
      autoplay = false
    }
    this.loadCurrentWord(index,autoplay) // 加载当前单词
    this.randomFourWordWithIndex()
  },

  wordPracticeInfoGen(word) {
    const tmpWord = {...word};
    // 处理例句
    const { sense = [] } = tmpWord;
    for (let i = 0; i < sense.length; i++) {
      const s = sense[i];
      const { eg } = s;
      if (eg && eg.length > 0) {
        tmpWord.sentense = eg[0];
        break;
      }
    }
    console.log('word', tmpWord);
    return tmpWord;
  },

  /*
  随机四个单词，含当前currentWord单词
  */
  randomFourWordWithIndex() {
    //打乱顺序后，就取前4个
    var tempRandList = utils.disorder(this.data.randomWordList)
    var tempFourWord = tempRandList.slice(0,4).map(word => this.wordPracticeInfoGen(word));
    //判断4个中有没有指定的单词
    var word = this.data.currentWord.word
    var excludeCurrentWord = true
    for (var ij=0;ij<4;ij++) {
      if (tempFourWord[ij].word == word) {
        //前4个中已包含 OK 返回
        excludeCurrentWord = false
        break
      }
    }
    //未包含 则赋值
    if (excludeCurrentWord) {
      var idx = Math.floor(Math.random() * 3.9)
      if (idx>3) {
        console.log("no")
      }
      tempFourWord[idx] = this.data.currentWord
    }
    this.setData({
      randomFourWord: tempFourWord
    })
  },

  toSelectMean: function(e) {
    if (this.data.wrongSelectIndex!=-1 || this.data.rightSelectIndex!=-1) {
      return
    }
    var touchIndex = e.currentTarget.dataset['index']
    var that = this
    if (this.data.randomFourWord[touchIndex].word == this.data.currentWord.word) {
      // 选择正确
      this.toPlayTipAudio(true) //提示音
      that.setData({
        rightSelectIndex: touchIndex,
        wrongSelectIndex: -1,
      })
      setTimeout(function() {
        // 1s后切换
        that.setData({
          rightSelectIndex: -1
        })
        that.loadCurrentMean(that.data.wordIndex+1)
      }, 1000)
    } else {
      // 选择错误
      this.toPlayTipAudio(false)
      // 更新得分状态
      this.updateScoreStateWhenFail()
      // 以下实现选错时的震动动画
      that.setData({
        wrongSelectIndex: touchIndex
      })
      setTimeout(function() {
        that.setData({
          wrongSelectIndex: -1
        })
      }, 1000)
    }
  },

  toReSelect: function() { //本次练习重头开始
    this.loadCurrentMean(0)
  },

  //-----------------------------------------------------------------------------------------
  //拼写练习

  toShowRemind: function() {
    // 更新得分状态
    this.updateScoreStateWhenFail()
    this.setData({
      spellShowRemind: true
    })
    var that = this
    setTimeout(function() {
      that.setData({
        spellShowRemind: false
      })
    }, 1000) // 1s后切换
  },

  //-----------------------------------------------------------------------------------------
  //生命周期
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //
    console.log('dailyWords onLoad')
    // 加载单词内容
    this.data.wordList = app.globalData.caseWordObjs
    // 初始化scores
    this.prepareScores(this.data.wordList)
    // 乱序
    var init_random_list = utils.disorder(this.data.wordList)
    // 展示
    this.setData({
      randomWordList: init_random_list,
      wordCount: init_random_list.length,
      wordIndex: 0,
      startTimestamp: timing.timestamp()
    })
    this.nextSteps()
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
    // 首次进入有提示！！
    var records = app.globalData.records
    if (records.length <= 0) {
      var that = this
      setTimeout(function() {
        that.setData({
          showFirstTip: true
        })
      }, 1000)
    }
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
    // 如果已经学习了一半退出则记录，否则不记录
    if (this.data.stepIndex>1) {
      var result = this.updateAchievement()
      this.recordCloudData(result['words'], result['scores'], this.data.stepIndex)
    }
  }
})
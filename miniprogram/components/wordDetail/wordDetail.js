// components/wordDetail/wordDetail.js

const timing = require('../../utils/timing.js')
const media = require('../../utils/media.js')

Component({
  /**
   * 使用app.wxss全局样式
   */
  options: {
    styleIsolation: 'apply-shared' //isolated(默认), apply-shared, shared
  },

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    // Current显示单词
    currentWord: {},
    scrollTopOffset: 0,
    // 反馈内容列表
    feedbackList: ['发音问题', '解释有误', '例句有误', '短语有误', '音标错误']
  },

  /**
   * 组件生命周期事件
   */
  lifetimes: {
    attached() {
    },
    detached() {
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    prepareData: function(the_word, topOffset) {
      var new_word = this.reshapeWord(the_word)
      this.setData({
        currentWord: new_word,
        scrollTopOffset: topOffset
      })
    },

    // 单词发音
    playWord: function() {
      media.playWordAudio(this.data.currentWord.uk_audio)
    },

    // 点击后发音
    toPlayWord: function() {
      this.playWord()
      this.selectComponent("#tipbar").showTip()
    },

    //-----------------------------------------------------------------------------------------
    //单词记忆

    // 字符串s中的v子串，替换成带标签带富文本
    heightLight: function (s, v) {
      var reg = new RegExp(v, "gi")
      s = s.replace(reg, function (r) {
        return "<span class=\"text-red\">" + r + "</span>"
      })
      return s
    },

    // 重新组织单词
    reshapeWord: function(theWord) {
      var tstart = timing.timestamp()
      if (theWord) {
        var newWord = {}
        Object.assign(newWord, theWord) //深拷贝
        // if ('trans' in newWord) {
        //   // if ("\\n" in newWord['trans']) {
        //     console.log(newWord['trans'])
        //   // }
        // }
        // var senseList = newWord['sense']
        // // 特殊处理 1.例句能够高亮显示单词
        // for (var idx in senseList) {
        //   var item = senseList[idx]
        //   if ('eg' in item) { // 英文例句拆成数组，其中单词是数组中一个单独item，可以高亮显示
        //     var eglist = item['eg']
        //     for (var egidx in eglist) {
        //       var egitem = eglist[egidx]
        //       if ('en' in egitem) {
        //         var en_eg = egitem['en']
        //         egitem['en'] = this.heightLight(en_eg, theWord['word'])
        //       }
        //     }
        //   }
        // } 
        // 截取固定长度显示
        var trans = theWord['trans']
        if (trans.length > 30) {
          trans = theWord['trans'].slice(0, 30) + '...'
          newWord['trans'] = trans
        }
        // 特殊处理完毕
        timing.dTimeLog(tstart, 'dailyWords - reshapeWord')
        return newWord
      }
      return {}
    },

    //-----------------------------------------------------------------------------------------
    // 用户反馈
    toShowFeedback(e) {
      var that = this
      wx.showActionSheet({
        itemList: that.data.feedbackList,
        success (res) {
          console.log(that.data.feedbackList[res.tapIndex])
          wx.reportAnalytics('feedback', {
            word: that.data.currentWord.word,
            feed: that.data.feedbackList[res.tapIndex]
          })
        },
        fail (res) {
          console.log(res.errMsg)
        }
      })
    }
  }
})

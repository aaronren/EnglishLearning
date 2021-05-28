const string = require('../../utils/string.js')
const utils = require('../../utils/utils.js')
const media = require('../../utils/media.js')
const event = require('../../utils/event.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    word: {
      type: Object,
      value: {},
      /**
       * 属性的监听
       */
      observer: function(newValue, oldValue, changePath) {
        // 监听word的变化，并执行初始化工作
        var the_word = newValue.word
        var spell_array = this.prepareSpellKeyboard(the_word)
        var spell_answer_str = this.prepareSpellAnswer(the_word.length)
        this.setData({
          keyboardItems: spell_array,
          spellAnswer: spell_answer_str,
          spellDisabled: false,
          spellResult: 0
        })
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    keyboardItems: [],
    spellAnswer: '',
    spellDisabled: false,
    spellResult: 0 // 0 spelling, 1 true, 2 false
  },

  /**
   * 组件生命周期事件
   */
  lifetimes: {
    ready() {
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //初始化键盘model数组
    prepareSpellKeyboard(the_word) {
      var len = the_word.length
      var keyitem_num = 10
      if (len > 20) {
        keyitem_num = 25
      } else if (len > 15) {
        keyitem_num = 20
      } else if (len > 10) {
        keyitem_num = 15
      }
      var compose_str = the_word + string.randomString(keyitem_num-len)
      var str_arr = compose_str.split('')
      var disorder_arr = utils.disorder(str_arr)
      // 生成带选中标志的键盘数据
      var keyboardArray = []
      for (var i=0; i<disorder_arr.length; i++) {
        var oneKey = {'char': disorder_arr[i], 'state': 0}
        keyboardArray.push(oneKey)
      }
      return keyboardArray
    },

    //初始化占位格字符串
    prepareSpellAnswer(word_len) {
      var total_len = word_len
      var answer_str = ''
      for (var i=0; i<total_len; i++) {
        answer_str += '_'
      }
      return answer_str
    },

    //点击键盘拼写单词
    toSpellWord: function(e) {
      if (this.data.spellDisabled) {
        return
      }
      // 已输满不允许再输入
      if (this.data.spellAnswer.indexOf('_') === -1) {
        return
      }
      var touchIndex = e.currentTarget.dataset.index
      var character = this.data.keyboardItems[touchIndex]
      if (character.state === 1) { // 已选中的键不允许再输入
        return
      }
      character.state = 1 // 修改选中状态
      // 修改Answer
      var new_str = this.data.spellAnswer
      new_str = new_str.replace('_', character.char)
      this.setData({
        spellAnswer: new_str,
        keyboardItems: this.data.keyboardItems
      })
      this.spellWordChange(new_str, 1)
    },

    //从末尾删除拼写单词
    toDeleteWord: function(e) {
      if (this.data.spellDisabled) {
        return
      }
      var new_str = this.data.spellAnswer
      var idx = new_str.indexOf('_')
      var the_char = ''
      // 修改Answer
      if (idx > 0) {
        the_char = new_str[idx-1]
        new_str = string.replaceChar(new_str, idx-1, '_')
      }
      if (idx === -1) {
        the_char = new_str[new_str.length-1]
        new_str = string.replaceChar(new_str, new_str.length-1, '_')
      }
      // 反选按钮状态
      for (var i=0; i<this.data.keyboardItems.length; i++) {
        var character = this.data.keyboardItems[i]
        if (character.char === the_char && character.state === 1) {
          character.state = 0
          break
        }
      }
      this.setData({
        spellAnswer: new_str,
        spellResult: 0,
        keyboardItems: this.data.keyboardItems
      })
    },

    //拼写成功检查
    spellWordChange: function(the_word,sleep_seconds) {
      if (the_word === undefined) {
        return
      }
      if (the_word[the_word.length-1] === '_') {
        return
      }
      //拼写正确，则跳转下一个单词
      if (the_word === this.properties.word.word) {
        this.setData({ // 先立马禁止输入，防止判断正确了但用户继续输入为错误词
          spellDisabled: true,
          spellResult: 1
        })
        media.playTipAudio(true) //提示音
        // 发送通知
        event.emit('spellSuccess', null)
      } else {
        // 拼写错误，红色提示
        this.setData({
          spellResult: 2
        })
        media.playTipAudio(false) //提示音
      }
    },
  }
})

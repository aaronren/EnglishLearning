// components/setting/setting.js
const storage = require('../../utils/storage.js')
const event = require('../../utils/event.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
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

  /**
   * 组件的方法列表
   */
  methods: {
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
    }
  }
})

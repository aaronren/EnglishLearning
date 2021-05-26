// miniprogram/pages/search/search.js
const string = require('../../utils/string.js')
const timing = require('../../utils/timing.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: "",
    inputFocus: false, // 设置输入框获取焦点
  },

  getInputValue: function(e){
    this.setData({
      inputValue: e.detail.value
    })
  },

  onInputClear: function(e) {
    if (this.data.inputFocus) {
      this.setData({
        inputValue: ""
      })
    }
  },

  /**
   * 点击右侧的“搜索”或者键盘的完成按钮触发doSearch
   */
  doSearch: function (e) {
    if (this.data.inputValue.length > 0) {
      // 关闭当前页并新开
      wx.navigateTo({
        url: '/pages/oneWord/oneWord?word=' + string.trim(this.data.inputValue)
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      inputFocus: true,
      inputValue: ""
    })
  },

  onHide: function () {
    this.setData({
      inputFocus: false
    })
  }
})
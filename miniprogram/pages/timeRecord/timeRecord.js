// miniprogram/pages/timeRecord/timeRecord.js

const event = require('../../utils/event.js')
const timing = require('../../utils/timing.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasRecord: true,
    records: []
  },

  updateRecords(records_source) {
    if (!records_source || records_source.length <= 0) {
      this.setData({
        hasRecord: false
      })
      return
    }
    // There are datas
    var record_ui_list = []
    for (var idx in records_source) {
      var item = records_source[idx]
      var new_item = {}
      new_item['recordDate'] = timing.formatDate(item.starttime)
      new_item['recordTime'] = timing.formatTime(item.starttime)
      new_item['finishStep'] = item.finishstep
      new_item['wordsCount'] = item.wordslist.length
      new_item['spendTime'] = Math.ceil((item.endtime - item.starttime) / 60000)
      if (item.finishstep >= 3) {
        if (item.scorelist && item.scorelist.length>0) {
          var avg = 0
          for (var scoreIdx in item.scorelist) {
            avg = avg + item.scorelist[scoreIdx]
          }
          avg = avg / item.scorelist.length
          new_item['averageScore'] = avg
        }
      }
      record_ui_list.push(new_item)
    }
    this.setData({
      records: record_ui_list
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 注册后可以接收到通知带来的参数
    event.on('gainCloudRecords', function(records) {
      this.updateRecords(records)
    })
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
    this.updateRecords(app.globalData.records)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    event.remove('gainCloudRecords',this)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
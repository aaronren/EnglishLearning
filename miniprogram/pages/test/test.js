// miniprogram/pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    word: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      // word: {word:'achievement',
      //        trans:'藕色加入了撒娇啦放假啦阿里将范德雷克撒娇分开了时间诶人情味i家里撒娇大幅拉升就拉萨快解放啦解放啦数据发了快递撒娇反馈啦数据',
      //        uk_pron:'/li^sen.sklfk/'}
      word: {"word": "accompany", "version": "1.2", "sense": [{"type": "verb"}, {"sense_line": "Go with (v.)"}, {"defn": "to go with someone or to be provided or exist at the same time as something", "trans": "陪同，陪伴；伴随，和…一起发生（或存在）", "eg": [{"en": "The course books are accompanied by four CDs.", "cn": "这些课本配有4张光盘。"}, {"en": "Depression is almost always accompanied by insomnia.", "cn": "抑郁症几乎总是伴有失眠。"}, {"en": "The salmon was accompanied by (= served with) a fresh green salad.", "cn": "那道三文鱼菜佐以新鲜的蔬菜色拉。"}]}, {"defn": "to show someone how to get to somewhere", "trans": "陪送，陪同前往", "eg": [{"en": "Would you like me to accompany you to your room?", "cn": "我送你到房间去，好吗？"}]}, {"defn": "to go with someone to a social event or to an entertainment", "trans": "陪同，陪伴（某人参加社交或文娱活动）", "eg": [{"en": "\"May I accompany you to the ball?\" he asked her.", "cn": "“我可以陪您去参加舞会吗？”他问她。"}, {"en": "I have two tickets for the theatre on Saturday evening - would you like to accompany me?", "cn": "“我有两张周六晚上的戏票，你愿意陪我一起去吗？”"}]}, {"sense_line": "Play music (v.)"}, {"defn": "to sing or play an instrument with another musician or singer", "trans": "为…伴唱或伴奏", "eg": [{"en": "Miss Jessop accompanied Mr Bentley on the piano.", "cn": "杰索普小姐为本特利先生钢琴伴奏。"}]}], "uk_audio": "ukacces017.mp3", "uk_pron": "/əˈkʌm.pə.ni/", "trans": "v. 陪同，陪伴；伴随，和…一起发生（或存在）"}
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
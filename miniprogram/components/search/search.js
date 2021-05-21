// components/search/search.js
const string = require('../../utils/string.js')

Component({
  /**
   * 组件使用全局样式app.wxss
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
    // __keysColor: [],
    // __mindKeys: []
    inputValue: "",
    inputFocus: false, // 设置输入框获取焦点
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onBarTap: function(e) {
      if (!this.data.inputFocus) {
        this.setData({
          inputFocus: true
        })
      }
    },

    onMaskTap: function(e) {
      if (this.data.inputFocus) {
        this.setData({
          inputFocus: false
        })
      }
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
      this.onMaskTap()
      if (this.data.inputValue.length > 0) {
        // 关闭当前页并新开
        wx.navigateTo({
          url: '/pages/oneWord/oneWord?word=' + string.trim(this.data.inputValue)
        })
      }
    },

  //   initColors: function (colors) {
  //     __keysColor = colors;
  //   },
    
  //   initMindKeys: function (keys) {
  //     __mindKeys = keys;
  //   },
    
  //   init: function (that, barHeight, keys, isShowKey, isShowHis, callBack) {
  //       var temData = {};
  //       var view = {
  //           barHeight: barHeight,
  //           isShow: false
  //       }
  //       if(typeof(isShowKey) == 'undefined') {
  //           view.isShowSearchKey = true;
  //       }else{
  //           view.isShowSearchKey = isShowKey;
  //       }
  //       if(typeof(isShowHis) == 'undefined') {
  //           view.isShowSearchHistory = true;
  //       }else{
  //           view.isShowSearchHistory = isShowHis;
  //       }
  //       temData.keys = keys;
  //       wx.getSystemInfo({
  //           success: function(res) {
  //               var wHeight = res.windowHeight;
  //               view.seachHeight = wHeight-barHeight;
  //               temData.view = view;
  //               that.setData({
  //                   wxSearchData: temData
  //               });
  //           }
  //       })
  //       if (typeof (callBack) == "function") {
  //           callBack();
  //       }
  //       getHisKeys(that);
  //   },
    
  //   wxSearchInput: function (e, that, callBack) {
  //       var temData = that.data.wxSearchData;
  //       var text = e.detail.value;
  //       var mindKeys = [];
  //       if(typeof(text) == "undefined" || text.length == 0) { 
  //       } else {
  //           for(var i = 0; i < __mindKeys.length; i++) {
  //               var mindKey = __mindKeys[i];
  //               if(mindKey.indexOf(text) > -1) {
  //                   mindKeys.push(mindKey);
  //               }
  //           }
  //       }
  //       temData.value = text;
  //       temData.mindKeys = mindKeys;
  //       that.setData({
  //           wxSearchData: temData
  //       });
  //   },
    
  //   wxSearchFocus: function (e, that, callBack) {
  //       var temData = that.data.wxSearchData;
  //       temData.view.isShow = true;
  //       that.setData({
  //           wxSearchData: temData
  //       });
  //       //回调
  //       if (typeof (callBack) == "function") {
  //           callBack();
  //       }
  //   },

  //   wxSearchBlur: function (e, that, callBack) {
  //       var temData = that.data.wxSearchData;
  //       temData.value = e.detail.value;
  //       that.setData({
  //           wxSearchData: temData
  //       });
  //       if (typeof (callBack) == "function") {
  //           callBack();
  //       }
  //   },
    
  //   wxSearchHiddenPancel: function (that) {
  //       var temData = that.data.wxSearchData;
  //       temData.view.isShow = false;
  //       that.setData({
  //           wxSearchData: temData
  //       });
  //   },
    
  //   wxSearchKeyTap: function (e, that, callBack) {
  //       //回调
  //       var temData = that.data.wxSearchData;
  //       temData.value = e.target.dataset.key;
  //       that.setData({
  //           wxSearchData: temData
  //       });
  //       if (typeof (callBack) == "function") {
  //           callBack();
  //       }
  //   },

  //   getHisKeys: function (that) {
  //       var value = [];
  //       try {
  //           value = wx.getStorageSync('wxSearchHisKeys')
  //           if (value) {
  //               // Do something with return value
  //               var temData = that.data.wxSearchData;
  //               temData.his = value;
  //               that.setData({
  //                   wxSearchData: temData
  //               });
  //           }
  //       } catch (e) {
  //           // Do something when catch error
  //       }
  //   },

  //   wxSearchAddHisKey: function (that) {
  //       wxSearchHiddenPancel(that);
  //       var text = that.data.wxSearchData.value;
  //       if(typeof(text) == "undefined" || text.length == 0) {return;}
  //       var value = wx.getStorageSync('wxSearchHisKeys');
  //       if(value) {
  //           if(value.indexOf(text) < 0) {
  //               value.unshift(text);
  //           }
  //           wx.setStorage({
  //               key:"wxSearchHisKeys",
  //               data:value,
  //               success: function() {
  //                   getHisKeys(that);
  //               }
  //           })
  //       }else{
  //           value = [];
  //           value.push(text);
  //           wx.setStorage({
  //               key:"wxSearchHisKeys",
  //               data:value,
  //               success: function() {
  //                   getHisKeys(that);
  //               }
  //           })
  //       }
  //   },

  //   wxSearchDeleteKey: function (e,that) {
  //       var text = e.target.dataset.key;
  //       var value = wx.getStorageSync('wxSearchHisKeys');
  //       value.splice(value.indexOf(text),1);
  //       wx.setStorage({
  //           key:"wxSearchHisKeys",
  //           data:value,
  //           success: function() {
  //               getHisKeys(that);
  //           }
  //       })
  //   },

  //   wxSearchDeleteAll: function (that) {
  //       wx.removeStorage({
  //           key: 'wxSearchHisKeys',
  //           success: function(res) {
  //               var value = [];
  //               var temData = that.data.wxSearchData;
  //               temData.his = value;
  //               that.setData({
  //                   wxSearchData: temData
  //               });
  //           } 
  //       })
  //   }
  }
})

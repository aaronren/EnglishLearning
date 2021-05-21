
// 设置：
// 异步：wx.setStorage 
// 同步：wx.setStorageSync

// 获取：
// 异步：wx.getStorage
// 同步：wx.getStorageSync

// 移除：
// 异步：wx.removeStorage
// 同步：wx.removeStorageSync

// 清除所有：
// 异步：wx.clearStorage
// 同步：wx.clearStorageSync

function saveLocalData(key_, value_) {
  // 异步写入接口
  wx.setStorage({
    key: key_,
    data: value_,
    success: function() {
      console.log('写入'+key_+'成功')
    },
    fail: function() {
      console.log('写入'+key_+'发生错误')
    }
  })
  // try{
  //   // 同步接口立即写入
  //   wx.setStorageSync('key', 'value2')
  //   console.log('写入value2成功')
  // } catch (e) {
  //   console.log('写入value2发生错误')
  // }
}

function readLocalData(key_) {
  // 同步读取接口
  try {
    var value = wx.getStorageSync(key_)
    if (value) {
      return value
    }
  } catch (e) {}
  return ''
}

exports.read = readLocalData
exports.save = saveLocalData
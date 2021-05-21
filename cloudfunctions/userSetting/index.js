// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  if (event.action=='get') {
    if (event.unfinish) {
      return await db.collection('userSetting').where({
        _openid: wxContext.OPENID,
        endtime: 0
        }).get({
          success: res => {
            console.log(res.data)
          }
      })
    }
  }
  if (event.action=='update') {
    return await db.collection('userSetting').where({
      _openid: wxContext.OPENID
    }).update({
      data: {
        currentBook: event.currentBook,
        ketDailyNumber: event.ketDailyNumber,
        updateDate: event.updateDate
      },
      fail: e => {
        console.error(e)
      }
    })
  }
  if (event.action=='add') {
    return await db.collection('userSetting').add({
      data: {
        _openid: wxContext.OPENID,
        currentBook: event.currentBook,
        ketDailyNumber: event.ketDailyNumber,
        setDate: event.setDate
      },
      success: res => {
      },
      complete: res => {
        console.log('callFunction userSetting result: ', res)
      }
    })
  }
}
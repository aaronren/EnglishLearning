// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'debug-0k6dy', // 'debug-0k6dy', // 
  traceUser: true,
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  if (event.update) {
    return await db.collection('dailyRecord').where({
      _openid: wxContext.OPENID,
      starttime: event.starttime
    }).update({
      data: {
        endtime: event.endtime, // timestamp
        scorelist: event.scorelist
      },
      fail: e => {
        console.error(e)
      }
    })
  } else {
    return await db.collection('dailyRecord').add({
      data: {
        _openid: wxContext.OPENID,
        wordslist: event.wordslist,
        starttime: event.starttime,
        endtime: event.endtime,
        scorelist: event.scorelist,
        finishstep: event.finishstep // 1-3
      },
      success: res => {
      },
      complete: res => {
        console.log('callFunction dailyRecord result: ', res)
      }
    })
  }
  // else { // if (event.remove)
  //   db.collection('dailyRecord').where({
  //     _openid: wxContext.OPENID
  //   }).remove()
  // }

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}
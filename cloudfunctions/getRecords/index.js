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

  if (event.unfinish) {
    return await db.collection('dailyRecord').where({
      _openid: wxContext.OPENID,
      endtime: 0
      }).get({
        success: res => {
          console.log(res.data)
        }
    })
  } else {
    return await db.collection('dailyRecord').where({
      _openid: wxContext.OPENID
      }).get({
        success: res => {
          console.log(res.data)
        }
    })
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
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
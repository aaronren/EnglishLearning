// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const dbcmd = db.command

  return await db.collection('wordsList').where({
    word: dbcmd.in(event.words)
    })
    .limit(100)
    .get({
      success: res => {
        //console.log(res.data)
      }
  })
}
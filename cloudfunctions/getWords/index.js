// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

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
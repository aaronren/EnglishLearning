// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

//new Date(Date.parse(whole_str.replace(/-/g, "/")))

/**
 * 提醒放入数据库，先查询是否已存在同时间提醒，如无则添加
 * @param {*} event 
 */
async function subscribeMessage(event) {
  try {
    const wxContext = cloud.getWXContext()
    const _ = db.command
    var _remind_time = new Date().getTime() + 24*60*60*1000-60*10*1000 // 第二天同一时间提前10分钟
    // console.log("> " + _remind_time)
    await db.collection('remindRecord').where({
      _openid: wxContext.OPENID,
      // _unionid: wxContext.UNIONID,
      remind_time: _.gt(_remind_time-3600*1000), // 一小时范围不重复插入
      remind_type: event.type
    }).get().then(async res => {
      // console.log(">>>get " + res.data.length)
      if (res.data.length <= 0) {
        await db.collection('remindRecord').add({
          data: {
            _openid: wxContext.OPENID,
            _unionid: wxContext.UNIONID,
            remind_time: _remind_time,
            remind_type: event.type,
            timestamp: new Date().getTime()
          }
        })
      }
    })
    return "success"
  } catch (err) {
    return err
  }
}

/**
 * 从数据库获取目前需要发送的消息数组
 */
async function checkMessage(event) {
  try {
    const _ = db.command
    var current_time = new Date().getTime()
    // BUG：针对相同的openid，可能存在一次给同一用户有多条符合条件的推送的情况
    // 该bug的解决依靠插入时，发现同一小时内已经存在记录则不再插入
    return await db.collection('remindRecord')
    .where({
        remind_time: _.lte(current_time),
        remind_type: "1"
    })
    .get()
  } catch (err) {
    return err
  }
}

/**
 * 取出待发送的用户列表后，逐个发送
 */
function sendMessage(event) {
  var checkResult = checkMessage(event)
  // promise数据结构的解析
  checkResult.then(async function(data) {
    var sendList = data.data
    for (var idx = 0; idx < sendList.length; idx++) {
      var open_id = sendList[idx]._openid
      // var time_str = formatTime(sendList[idx].remind_time)
      // console.log('time_str? > ' + time_str)
      const result = await cloud.openapi.subscribeMessage.send({
        touser: open_id,
        page: '/pages/index/index',
        lang: 'zh_CN',
        data: {
          thing1: {
            value: '每天单词学习计划😊'
          },
          thing4: {
            value: '您预定的学习时间到啦，赶紧学习吧～'
          }
        },
        templateId: ''
      })
      // console.log('send result? > ' + result.errCode + ', ' + result.errMsg)
      // result success
      if (result.errCode == 0) {
        var recordid = sendList[idx]._id
        // remove
        db.collection('remindRecord').where({
          _id: recordid
        }).remove()
      }
    }
  }).catch(function(error) {
    console.error('>> ' + error)
  })
  return "triggered"
}

exports.main = async (event, context) => {
  var res = ""
  switch (event.type) {
    case '1': {
      res = subscribeMessage(event)
      // res = sendMessage(event)
      break
    }
    default: {
      res = sendMessage(event)
      break
    }
  }
  return res
}
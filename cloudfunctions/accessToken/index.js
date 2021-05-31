// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const request = require('request')

var access_token = ''
var expires_in = 7200
var last_time = 0

// 云函数入口函数
exports.main = async (event, context) => {
  var current_time = new Date().getTime()
  var time_span = (current_time - last_time) / 1000
  if (time_span > expires_in) {
    request({
      url: ''
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // {"access_token":"ACCESS_TOKEN","expires_in":7200}
        // {"errcode":40013,"errmsg":"invalid appid"}
        var jsonObj = JSON.parse(body)
        access_token = jsonObj["access_token"]
        expires_in = jsonObj["expires_in"]
        last_time = new Date().getTime()
      }
    })
    // 直接return，首次会是空
    return access_token
  } else {
    // 时间范围内，直接return
    return access_token
  }
}
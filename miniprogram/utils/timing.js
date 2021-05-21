const formatDatetime = timestamp => {
  var date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = timestamp => {
  var date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatTime = timestamp => {
  var date = new Date(timestamp)
  const hour = date.getHours()
  const minute = date.getMinutes()
  //const second = date.getSeconds()

  return [hour, minute/*, second*/].map(formatNumber).join(':')
}

const subscribeTime = () => {
  var date = new Date()
  const hour = date.getHours()
  var minute = date.getMinutes()
  minute = minute < 30 ? 0 : 30
  return [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 上报的时间拉取下来 转换为显示
function timestamp() {
  return new Date().getTime()
}

function spendTime(starttime, endtime) {
  var seconds = (endtime - starttime) / 1000
  var minutes = seconds / 60
  // 
  var hours = Math.floor(minutes/60)
  if (hours>0) {
    return (hours + "小时" + Math.round(minutes%60) + "分种" )
  }
  return (Math.ceil(minutes%60) + "分种" )
}

function dTimeLog(starttime, info) {
  var endtime = new Date().getTime()
  var minisecond = endtime-starttime
  console.log('[' + info + '] ' + minisecond + 'ms')
}

module.exports = {
  formatDate: formatDate,
  formatTime: formatTime, // 直接用来显示
  formatDatetime: formatDatetime,
  timestamp: timestamp,
  spendTime: spendTime,
  subscribeTime: subscribeTime,
  dTimeLog: dTimeLog
}

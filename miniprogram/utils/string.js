function trim(str) { //删除左右两端的空格
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

function ltrim(str) { //删除左边的空格
  return str.replace(/(^\s*)/g,"");
}

function rtrim(str) { //删除右边的空格
  return str.replace(/(\s*$)/g,"");
}

// 生成指定长度的随机字符串
function randomString(len) {
  var $chars = 'abcdefghijklmnopqrstuvwxyz';
  var maxPos = $chars.length;
  var randStr = '';
  for (var i = 0; i < len; i++) {
    randStr += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return randStr;
}

// 替换指定位置的字符
function replaceChar(str, index, char) {
  return str.substring(0, index) + char + str.substring(index + 1);
}

module.exports = {
  trim: trim,
  ltrim: ltrim,
  rtrim: rtrim,
  randomString: randomString,
  replaceChar: replaceChar
}
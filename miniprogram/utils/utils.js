
// 数组乱序
function disorder(arr_list) {
  var array = [];
  Object.assign(array, arr_list) //深拷贝
  var m = array.length,
      t, i;
  while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
  }
  return array;
}

module.exports = {
  disorder: disorder
}
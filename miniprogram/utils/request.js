
// 加载当次学习单词详细数据，释义、例句、发音等
function getWordsDetail(caseWords, success) {
  const word_list = caseWords
  wx.cloud.callFunction({
    name: 'getWords',
    data: {
      words: word_list
    },
    success: res => {
      if (success) {
        success(res.result.data)
      }
    },
    fail: err => {
      console.error('index - getWords调用失败：', err)
      wx.reportMonitor('getCloudStudyWordsFail', 1)
    }
  })
}

exports.getWords = getWordsDetail
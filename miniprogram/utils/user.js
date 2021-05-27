const calcDailyUserData = (records) => {
  // 统计不重复单词数量
  const words = {}
  // 统计不重复天数
  const days = {}
  // 单词最高得分
  let avgscore = 0
  // 循环统计
  for (const recordIdx in records) {
    // 单词列表
    const wlist = records[recordIdx].wordslist
    // 得分
    const slist = records[recordIdx].scorelist
    // 
    for (const wordIdx in wlist) {
      const word = wlist[wordIdx]
      if (wordIdx < slist.length) {
        if (words[word]) {
          if (slist[wordIdx] > words[word]) {
            words[word] =  slist[wordIdx]
          }
        } else {
          words[word] = slist[wordIdx]
        }
      }
    }
    if (slist && slist.length>0) {
      let eachAvg = 0
      for (var scoreIdx in slist) {
        eachAvg = eachAvg + slist[scoreIdx]
      }
      avgscore = avgscore + eachAvg / slist.length
    }
    // 时间
    const date = records[recordIdx].starttime
    const dateStr = new Date(date).toDateString()
    if (days[dateStr]) {
      days[dateStr] = days[dateStr] + 1
    } else {
      days[dateStr] = 1
    }
  }
  const key_wordlist = Object.keys(words)
  const key_daylist = Object.keys(days)
  const avg_scorelist = records.length>0 ? (avgscore / records.length) : 0
  const scoreList = Object.values(words)

  const insisDays = [key_daylist.length, '坚持天数']
  const learnedWords = [key_wordlist.length, '已学单词']
  const averageSore = [avg_scorelist.toPrecision(2)+'/3', '平均得分']

  return {
    insisDays,
    learnedWords,
    averageSore,
    key_wordlist,
    scoreList
  }
};

module.exports = {
  calcDailyUserData,
}
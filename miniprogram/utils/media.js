var innerAudioContext = null

// 注意在page的onLoad中调用
function initAudioContext() {
  innerAudioContext = wx.createInnerAudioContext()
  // innerAudioContext.autoplay = true
  innerAudioContext.onPlay(() => {
  })
  innerAudioContext.onPause(() => {
  })
  innerAudioContext.onStop(() => {
  })
  innerAudioContext.onSeeked(() => {
  })
  innerAudioContext.onEnded(() => {
  })
  innerAudioContext.onError((res) => {
    console.log("playAudio onError: " + res)
  })
}

// 注意在page的onUnload中调用
function destroyAudioContext() {
  if (innerAudioContext !== null) {
    innerAudioContext.destroy()
  }
}

// 单词发音
function playWordAudio(audio_str) {
  innerAudioContext.src = 'http://www.aaronview.cn/audio/' + 'uk/' + audio_str
  innerAudioContext.play()
}

// 发出对或错的提示音
function playTipAudio(is_right) {
  innerAudioContext.src = is_right ? '/audio/right.mp3' : '/audio/wrong.mp3'
  innerAudioContext.play()
}

module.exports = {
  initAudioContext: initAudioContext,
  destroyAudioContext: destroyAudioContext,
  playWordAudio: playWordAudio,
  playTipAudio: playTipAudio
}
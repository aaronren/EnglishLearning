// 云函数入口文件 // mark: xxx
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'debug-0k6dy', // 'debug-0k6dy', // 
  traceUser: true,
})
const db = cloud.database();

const generatePaper = async () => {
  const words = await db.collection('wordsList')
  .aggregate()
  .sample({ size: 10 })
  .end()
  .then(res => {
    return res && res.list || [];
  });

  const getWrongAnswer = (wordlist, word, idx) => {
    const copy = [...wordlist];
    copy.splice(idx, 1);

    const shuffled = copy.slice(0);
    let i = copy.length;
    const min = i - 3;
    while(i-- < min) {
      const index = Math.floor((i + 1) * Math.random());
      const temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  };

  words.forEach((word, index) => {
    const wrongAnswer = getWrongAnswer(words, word, index).map(w => w.trans);
    const rightIndex = Math.floor(4 * Math.random());
    const questions = [...wrongAnswer.slice(0, rightIndex), word.trans, ...wrongAnswer.slice(rightIndex, wrongAnswer.length)];
    word.quiz = {
      answer: rightIndex,
      questions,
    };
  });

  return words;
}

const promisify = (res) => {
  return new Promise((resolve) => {
    resolve(res);
  })
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 加入一个比赛, 不存在则创建
  const {
    roomNumber,
    score,
  } = event;

  const gameIns = await db.collection('game').where({
    roomNumber,
  }).get();

  if (event.action === 'load') {
    return promisify({
      code: 0,
      game: gameIns.data[0],
    });
  }

  if (event.action === 'join') {
    // 创建一个比赛
    if (gameIns.data.length < 1) {
      const paper = await generatePaper();
      await db.collection('game').add({
        data: {
          roomNumber,
          owner: wxContext.OPENID,
          quiz: paper,
          status: 'open',
          participates: [{
            pid: wxContext.OPENID,
            status: 'pending',
            score: 0,
          }],
        }
      })
      // 创建成功
      return promisify({
        code: 0,
        user: [{
          status: 'pending',
          score: 0,
        }],
      })
      // 加入一个比赛
    } else {
      const game = gameIns.data[0];
      const { participates = [] } = game;
      if (participates.length > 2) {
        return promisify({
          code: -1,
          errMsg: '队伍已经大于2人, 请重新创建比赛~',
        })
      }
      const isMe = !!participates.find(p => p.pid === wxContext.OPENID);

      if (!isMe) {
        // 加入队伍
        participates.push({
          pid: wxContext.OPENID,
          status: 'pending',
          score: 0,
        });
        await db.collection('game').where({
          roomNumber,
        }).update({
          data: {
            participates,
          },
        });
        return promisify({
          code: 0,
          msg: '加入成功',
          users: participates,
        })
      } else {
        return promisify({
          code: 0,
          msg: '比赛加载成功',
          data: game,
          users: participates,
        })
      }
    }
  }

  if (event.action === 'beginQuiz') {
    if (gameIns.data.length > 0) {
      const game = gameIns.data[0];
      const { participates = [] } = game;

      const me = participates.find(p => p.pid === wxContext.OPENID);
      if (me) {
        me.status = 'starting';
        await db.collection('game').where({
          roomNumber,
        }).update({
          data: {
            participates,
          },
        });
        return promisify({
          code: 0,
          msg: '比赛开始',
          users: participates,
        })
      }
    }
  }

  if (event.action === 'finishQuiz') {
    if (gameIns.data.length > 0) {
      const game = gameIns.data[0];
      const { participates = [] } = game;
      const me = participates.find(p => p.pid === wxContext.OPENID);
      if (me) {
        me.status = 'finished';
        me.score = score;
        await db.collection('game').where({
          roomNumber,
        }).update({
          data: {
            participates,
          },
        });
        return promisify({
          code: 0,
          msg: '完成比赛',
          users: participates,
        })
      }
    }

  }

  // 关闭比赛
  if (event.action === 'closeGame') {
    if (gameIns.data.length > 0) {
      const game = gameIns.data[0];
      const { owner } = game;
      if (owner === wxContext.OPENID) {
        await db.collection('game').where({
          roomNumber,
        }).update({
          data: {
            status: 'close',
          },
        });
        return promisify({
          code: 0,
          msg: '比赛已关闭',
        })
      } else {
        return promisify({
          code: -1,
          msg: '您无法关闭改比赛'
        })
      }
    }
  }
}
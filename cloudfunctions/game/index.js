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

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 加入一个比赛, 不存在则创建
  if (event.action === 'join') {
    const {
      roomNumber,
    } = event;

    const gameIns = await db.collection('game').where({
      roomNumber,
    }).get();

    console.log('gameIns', gameIns, roomNumber);

    // 创建一个比赛
    if (gameIns.data.length < 1) {
      const paper = await generatePaper();
      await db.collection('game').add({
        data: {
          roomNumber,
          owner: wxContext.OPENID,
          quiz: paper,
          participates: [{
            pid: wxContext.OPENID,
            status: 'pending',
            score: 0,
          }],
        }
      })
      // 创建成功
      return {
        code: 0,
      }
      // 加入一个比赛
    } else {
      const game = gameIns.data[0];
      const { participates = [] } = game;
      if (participates.length > 2) {
        return {
          code: -1,
          errMsg: '队伍已经大于2人, 请重新创建比赛~',
        }
      }
      const isMe = !!participates.find(p => p.pid === wxContext.OPENID);

      console.log('isMe', isMe);
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
        return {
          code: 0,
          msg: '加入成功',
        }
      } else {
        return {
          code: 0,
          msg: '比赛加载成功',
          data: game,
        }
      }
    }
  }

  // 更新玩家状态, 如参加中, 或者为已结束, 展示结果
  if (event.action === 'update') {
    // TODO 检查是否在比赛列表中
  }

  // 关闭比赛
  if (event.action === 'close') {
    // TODO 检查是否存在比赛, 检查操作者是否为创建者
  }
}
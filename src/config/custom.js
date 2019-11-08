let custom = {}

custom.greeting = function (vm) {
  if (!sessionStorage.getItem('hasGreet')) {
    sessionStorage.setItem('hasGreet', 1)
    let hour = (new Date()).getHours()
    let greetingWord = []
    if (hour >= 5 && hour < 9) {
      greetingWord = ['早上好~ ','开启全新一天~']
    } else if (hour >= 9 && hour < 12) {
      greetingWord = ['上午好~ ','努力干活哎~']
    } else if (hour >= 12 && hour < 14) {
      greetingWord = ['中午好~ ','小憩一下吧~']
    } else if (hour >= 14 && hour < 19) {
      greetingWord = ['下午好~ ','下午也要活力满满哦~']
    } else if (hour >= 19 && hour < 23) {
      greetingWord = ['晚上好~ ','下班ing~']
    } else {
      greetingWord = ['深夜好~ ','夜已深，注意休息哦~']
    }
    vm.$Notice.info({
      title: greetingWord[0] + sessionStorage.getItem('user'),
      desc: greetingWord[1],
      duration: 4,
      name: 'greeting'
    })
  }
}

export default custom
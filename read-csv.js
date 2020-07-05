const parse = require("csv-parse");
const fs = require('fs')

const input = fs.readFileSync('a.csv').toString() // '#Welcome\n"1","2","3","4"\n"a","b","c","d"'
parse(input, {
  comment: '#'
}, (err, output) => {
  if (err) {
    throw err
  }

  process(output)

})

function process(output) { 
  const data = output.slice(1).map(row => row.slice(0, 3))
  console.log('data=\n' + JSON.stringify(data, null, 2))


  function toArr(s) {
    return s.replace(/,/g, '\n').split('\n').map(t => t.trim()).filter(x => Boolean(x))
  }

  const services = data.map(row => {
    const name = row[0]
    const producing = toArr(row[1])
    const consuming = toArr(row[2])
    return {name, producing, consuming}
  })
  console.log('services=\n' + JSON.stringify(services, null, 2))

  const edges = services.map(s => {
    return {from: s.name, to: services.filter(curr => curr != s && isConsumerOf(curr, s.producing)).map(curr => curr.name)}
  })

  edges.forEach(curr => {
    const arr = [curr.from, ...curr.to]
    if (arr.length > 1) {
      console.log(JSON.stringify(arr))
    }
  })

  // console.log('edges=\n' + JSON.stringify(edges, null, 2))
  
  // console.log(consumersOf('vcsUpdated'))

  function isConsumerOf(service, topics) {
    return topics.filter(t => service.consuming.includes(t)).length > 0
  }
}


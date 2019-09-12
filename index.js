const redis = require('redis')
const client = redis.createClient('redis://localhost:6379/1')
const fs = require('fs')
const { promisify } = require('util')

const evalAsync = promisify(client.eval).bind(client)

const luaScript = fs.readFileSync('./example.lua')

const TX_EXPIRE_TIME = 3600

async function updateTransaction(hash, args) {
  const redisKey = `tx:${hash}`
  return new Promise((resolve, reject) => {
    client
      .multi()
      .eval(luaScript, 1, redisKey, ...args)
      .expire(redisKey, TX_EXPIRE_TIME)
      .exec((err, replies) => {
        if (err) {
          logError(`[REDIS] ${txid} failed to set ${msg} transaction`)
          console.log(`MULTI got ${replies.length} replies`)
          replies.forEach((reply, index) => {
            console.log(`Reply ${index}: ${reply.toString()}`)
          })
          reject(err)
        }
        console.log({ replies });
        resolve(hash)
      })
  })
}

async function main() {
  const hash = '0x001'
  const newStatus = 'pending'

  const args = ['status', newStatus, 'blockchain', 'ethereum']
  const res = await updateTransaction(hash, args)
  console.log({ res })
  process.exit(0)
}

main()

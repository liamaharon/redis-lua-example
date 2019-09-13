const redis = require('redis')
const client = redis.createClient('redis://localhost:6379/1')
const fs = require('fs')
const { promisify } = require('util')

const luaScript = fs.readFileSync('./example.lua')

const evalAsync = promisify(client.eval).bind(client)

async function main() {
  const hash = '0x001'
  const newStatus = 'aag'

  const args = ['status', newStatus, 'blockchain', 'ethereum']
  const redisKey = `tx:${hash}`
  const res = await evalAsync(luaScript, 1, redisKey, ...args)
  console.log({ res })
  process.exit(0)
}

main()

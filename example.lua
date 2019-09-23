local TX_EXPIRE_TIME = 60 * 60

-- Get the current status in redis and new status in call
local curStatus = redis.call('hget', KEYS[1], 'status')
local newStatus = ARGV[2]


local differentStatus = not (curStatus == newStatus)
local unseenHash = curStatus == false

-- If hash not yet in redis OR it's a different status that ISN'T pending, we should set it
local shouldSet = unseenHash or (differentStatus and not (newStatus == 'pending'))

local hmsetRes
if (shouldSet) then
  print('setting')
  hmsetRes = redis.call('hmset', KEYS[1], unpack(ARGV))
  if (hmsetRes['err']) then return redis.error_reply(hmsetRes['err']) end
end

-- Reset the expiry on this hash
local expireRes = redis.call('expire', KEYS[1], TX_EXPIRE_TIME)
if (not (expireRes == 1)) then return redis.error_reply(expireRes) end

return 1

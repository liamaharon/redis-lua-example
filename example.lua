-- KEYS is an array of redis keys passed into the Lua call
-- ARGV is an array of params that came after the redis keys 
-- In Lua, first item in array is at index 1, not 0

-- Get the current status in redis and new status in call
local curStatus = redis.call('hget', KEYS[1], 'status')
local newStatus = ARGV[2]

-- If curStatus is already newStatus, return
if (curStatus == newStatus) then return 1 end

-- If key doesn't exist yet in redis 
-- OR newStatus is something other than pending, update
if (curStatus == false or not (newStatus == 'pending')) then
  print('Calling hmset')
  redis.call('hmset', KEYS[1], unpack(ARGV))
end

return 1

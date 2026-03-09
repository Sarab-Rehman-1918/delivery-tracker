// server/src/config/redis.js

const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  console.log('✅ Redis Connected!');
});

redisClient.on('error', (err) => {
  console.log('❌ Redis Error:', err.message);
});

redisClient.connect();

module.exports = redisClient;
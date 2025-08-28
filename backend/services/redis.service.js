import Redis from 'ioredis';


const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

console.log("REDIS_URL:", process.env.REDIS_HOST);

redisClient.on('connect', () => {
    console.log('Redis connected');
})

export default redisClient;
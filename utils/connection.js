const config = require("config");

module.exports = {
  connection: {
    port:
      parseInt(config.get("redis.port")) || parseInt(process.env.REDIS_PORT),
    host: config.get("redis.host") || process.env.REDIS_HOST,
    password: config.get("redis.password") || process.env.REDIS_PASSWORD,
  },
};

const Redis = require("ioredis");
const { Queue } = require("bullmq");
const { connection } = require("./connection");

const excelQueue = new Queue("excelQueue", {
  connection: new Redis(connection),
});

const QueueOptions = {
  removeOnComplete: {
    age: 600, // keep up to 10 mins
    count: 100, // keep up to 100 jobs
  },
  removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours 24 * 3600
  },
  // Add a job that will be delayed by at least 5 seconds.
  // delay: 5000,
  // Backoff function with a 1-second delay as a seed value,
  // so it will retry at most 3 times spaced after 1 second, 2 seconds, and 4 seconds respectively
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 30000,
  },
};

const addExcelToQueue = async (payload) => {
  excelQueue.add("excelParser", payload, QueueOptions);
};

module.exports = { addExcelToQueue };

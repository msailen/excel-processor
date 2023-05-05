const Redis = require("ioredis");
const { Job, Queue, QueueEvents, Worker } = require("bullmq");
const { connection } = require("../utils/connection");
const { parseCountryAndYear } = require("../utils");
const { processFile } = require("../utils/parser");

const queueEvents = new QueueEvents("excelQueue");

const excelWorker = new Worker(
  "excelQueue",
  async (job) => {
    try {
      const { file, path } = job.data;
      const extraData = parseCountryAndYear(file);
      return processFile({ ...extraData, path });
    } catch (err) {
      throw err;
    }
  },
  {
    connection: new Redis(connection),
  }
);

queueEvents.on("completed", async ({ jobId }) => {
  console.log({ "Request Sent to ": jobId });
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  console.error("error", { jobId, failedReason });
});

module.exports = excelWorker;

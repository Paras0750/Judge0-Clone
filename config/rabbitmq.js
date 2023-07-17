const { v4: uuidv4 } = require("uuid");
const amqp = require("amqplib");
const { executeUserCodeInContainer } = require("./sandbox");

// Connect to rabbit mq
async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  return { connection, channel };
}

async function startRcpServerAsWorker() {
  //connect to rabbitmq
  const { connection, channel } = await connectRabbitMQ();

  // declare rcpcodeexecutionqueue
  channel.prefetch(1); // limit the no. of unack msg, fetch only one msg
  channel.assertQueue(codeExecutionQueue);

  // consumer for rcpCodeExecutionQueue
  channel.consume(codeExecutionQueue, async (msg) => {
    const { code, submissionId, language  } = JSON.parse(msg.content.toString());

    try {
      // process the rcp request / execute code inside container
      const executionResult = await executeUserCodeInContainer(
        code,
        submissionId,
        language,
      );

      // publish the result to the response queue
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(executionResult)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      // acknowledge the message (dqueue)
      channel.ack(msg);
    } catch (err) {
      console.log("Error processing RCP request for execution: ", err);
      process.exit(1); // terminate
    }
  });
}

const codeExecutionQueue = "rpcCodeExecutionQueue";

// Publish message to queue
async function publishMessageToCodeExecutionQueue(
  connection,
  channel,
  code,
  submissionId,
  language,
  res
) {
  // set up responsequeue (temp)
  const responseQueue = await channel.assertQueue("", { exclusive: true });
  const responseQueueName = responseQueue.queue;

  const correlationId = uuidv4();

  // consumer for the response queue
  channel.consume(
    responseQueueName,
    (msg) => {
      if (msg.properties.correlationId == correlationId) {
        const result = JSON.parse(msg.content.toString());
        res.status(200).json(result);
        channel.close();
        connection.close();
      }
    },
    { noAck: true }
  );

  // publish msg(code) to rcpcodeExecutionQueue / send rcp request
  channel.sendToQueue(
    codeExecutionQueue,
    Buffer.from(JSON.stringify({ code, language, submissionId })),
    {
      correlationId,
      replyTo: responseQueueName,
    }
  );
}

module.exports = {
  startRcpServerAsWorker,
  publishMessageToCodeExecutionQueue,
  connectRabbitMQ,
};

import { Handler } from '@netlify/functions'
import axios from 'axios';

interface Log {
    level: string;
    message: string;
    resourceId: string;
    timestamp: string;
    traceId: string;
    spanId: string;
    commit: string;
    metadata: {
      parentResourceId: string;
    };
  }

const BATCH_SIZE = 50;

const enqueueLogs = async (logs: Log[]) => {
  // Divide logs into batches
  for (let i = 0; i < logs.length; i += BATCH_SIZE) {
    const batch = logs.slice(i, i + BATCH_SIZE);
    await enqueueBatch(batch);
  }
};

const enqueueBatch = async (batch: Log[]) => {
  // Push log batches to Zeplo queue with 3 retries and 1 second delay
  // for it to be inserted into the database
  // https://zeplo.io/docs/queue
  await axios.post(`https://zeplo.to/${process.env.DB_LAYER_URL}/insert?_token=${process.env.ZEPLO_TOKEN}&_retry=3&_delay=1`, batch);
};

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  const { body } = event;
  const data: any = JSON.parse(body || '{}');
  let logs = data
  if (!Array.isArray(body)) {
    logs = [body]
  }

  try {
    await enqueueLogs(logs);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    }
  }

  return {
    statusCode: 200,
    body: 'OK',
  }
}

export { handler };

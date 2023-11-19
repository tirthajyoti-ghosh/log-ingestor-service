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
  await axios.get('http://localhost:4747/http://localhost:3000/insert', {
    params: {
      body: batch,
    },
  });
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

  enqueueLogs(logs);

  return {
    statusCode: 200,
    body: 'OK',
  }
}

export { handler };

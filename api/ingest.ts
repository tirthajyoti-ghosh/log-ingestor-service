import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default function handler(
    request: VercelRequest,
    response: VercelResponse,
  ) {
    if (request.method !== 'POST') {
      response.status(405);
      return;
    }

    const { body } = request;
    const logs: Log[] = body;

    enqueueLogs(logs);

    response.status(200);
  }
  
import { Handler } from "@netlify/functions";
import axios from "axios";

const handler : Handler = async (event, context) => {
    const query = event.queryStringParameters?.q ? event.queryStringParameters?.q : '';
    const filters = event.queryStringParameters?.filters ? JSON.parse(event.queryStringParameters?.filters) : {};
    const startDate = event.queryStringParameters?.startDate ? new Date(event.queryStringParameters?.startDate) : undefined;
    const endDate = event.queryStringParameters?.endDate ? new Date(event.queryStringParameters?.endDate) : undefined;
  
    // Build filter conditions dynamically
    const filterConditions: Record<string, any> = {
      $or: [
        { level: { $regex: query, $options: 'i' } },
        { message: { $regex: query, $options: 'i' } },
        { resourceId: { $regex: query, $options: 'i' } },
        { traceId: { $regex: query, $options: 'i' } },
        { spanId: { $regex: query, $options: 'i' } },
        { commit: { $regex: query, $options: 'i' } },
        { 'metadata.parentResourceId': { $regex: query, $options: 'i' } },
      ],
    };
  
    if (startDate && endDate) {
      filterConditions.timestamp = { $gte: startDate, $lte: endDate };
    }
  
    // Add filters based on provided query parameters
    Object.keys(filters).forEach(key => {
      if (key !== 'q' && key !== 'startDate' && key !== 'endDate') {
        filterConditions[key] = { $regex: filters[key], $options: 'i' };
      }
    });

    // Query database
    const logs = await axios.post(`${process.env.DB_LAYER_URL}/find`, {
        queryFilter: filterConditions,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.ZEPLO_TOKEN}`,
        },
    });

    return {
        statusCode: 200,
        body: JSON.stringify(logs),
    };
}

export { handler };

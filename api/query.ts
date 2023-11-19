import { Handler } from "@netlify/functions";
import axios from "axios";
import { filterBuilder } from "../lib/filter-builder";

const handler: Handler = async (event, context) => {
    const filters = filterBuilder(event.queryStringParameters || {});

    // Query database
    const { data: logs } = await axios.post(`${process.env.DB_LAYER_URL}/find`, {
        queryFilter: filters,
    }, {
        headers: {
            Authorization: process.env.SECRET_KEY,
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify(logs),
    };
}

export { handler };

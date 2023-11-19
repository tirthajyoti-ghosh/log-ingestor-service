import { Handler } from "@netlify/functions";
import axios from "axios";
import { filterBuilder } from "../lib/filter-builder";
import { SearchRequest } from "../shared/types";

const handler: Handler = async (event, context) => {
    const requestBody: SearchRequest = JSON.parse(event.body || '{}');
    const filters = filterBuilder(requestBody);

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

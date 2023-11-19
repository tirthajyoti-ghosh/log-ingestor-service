import { Handler } from "@netlify/functions";
import axios from "axios";
import { filterBuilder } from "../lib/filter-builder";
import { SearchRequest } from "../shared/types";

const handler: Handler = async (event, context) => {
    if (event.httpMethod == "OPTIONS") {
        console.log("IF OPTIONS");

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTION",
            },
        };
    }
    
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
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(logs),
    };
}

export { handler };

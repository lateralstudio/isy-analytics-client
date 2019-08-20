const http = require("http");
const https = require("https");

const logOptions = {
    path: "/log",
    method: "PUT"
};

const getAggregationsOptions = {
    path: "/getAggregations",
    method: "PUT"
};

const getHttp = ({ useHttp }) => {
    if (useHttp) {
        return http;
    }
    return https;
};

function makeClient(params) {
    return {
        log(event) {
            const log = {
                writeKey: params.writeKey,
                event: {
                    ...event,
                    appKey: params.appKey
                }
            };
            const req = getHttp(params).request({
                host: params.host,
                port: params.port,
                ...logOptions
            });
            req.on("error", err => {
                console.log(`Request error: ${err.message}`);
            });
            req.write(JSON.stringify(log));
            req.end();
        },

        getAggregations(query, callback) {
            const req = getHttp(params).request(
                {
                    host: params.host,
                    port: params.port,
                    ...getAggregationsOptions
                },
                res => {
                    let responseString = "";
                    res.on("data", data => {
                        responseString += data;
                    });
                    res.on("end", () => {
                        callback(JSON.parse(responseString));
                    });
                }
            );
            req.on("error", err => {
                console.log(`Request error: ${err.message}`);
            });
            const data = {
                readKey: params.readKey,
                appKey: params.appKey,
                ...query
            };
            req.write(JSON.stringify(data));
            req.end();
        }
    };
}

class IsyAnalyticsClient {
    constructor(params) {
        const client = makeClient(params);
        this.log = client.log;
        this.getAggregations = client.getAggregations;
    }
}

module.exports = IsyAnalyticsClient;

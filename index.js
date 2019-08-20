const http = require("http");

const logOptions = {
    host: "192.168.99.80",
    port: 1337,
    path: "/log",
    method: "PUT"
}

const getAggregationsOptions = {
    host: "192.168.99.80",
    port: 1337,
    path: "/getAggregations",
    method: "PUT"
}

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
            const req = http.request(logOptions);
            req.on("error", (err) => {
                console.log(`Request error: ${err.message}`);
            });
            req.write(JSON.stringify(log));
            req.end();
        },

        getAggregations(query, callback) {
            const req = http.request(getAggregationsOptions, (res) => {
                let responseString = "";
                res.on("data", data => {
                    responseString += data;
                });
                res.on("end", () => {
                    callback(JSON.parse(responseString));
                });
            });
            req.on("error", (err) => {
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
    }
}

class IsyAnalyticsClient {
    constructor(params) {
        this.client = makeClient(params);
    }

    log(event) {
        this.client.log(event);
    }

    getAggregations(query, callback) {
        this.client.getAggregations(query, callback);
    }
}

module.exports = IsyAnalyticsClient;
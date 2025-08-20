import {
  CloudWatchLogsClient,
  StartQueryCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const cloudwatchClient = new CloudWatchLogsClient({ region: "ap-southeast-1" });

const handleGetCustomTimeFrame = (timeFrame) => {
  let startTime = Math.floor((Date.now() - 60 * 60 * 1000) / 1000); // 1 hour ago;

  try {
    const value = timeFrame?.value;
    const unit = timeFrame?.unit;

    // unit can be DAY, WEEK & default of HOUR
    if (unit === "DAY") {
      startTime = Math.floor((Date.now() - value * 24 * 60 * 60 * 1000) / 1000); // x day ago
    } else if (unit === "WEEK") {
      startTime = Math.floor((Date.now() - value * 7 * 24 * 60 * 1000) / 1000); // x week ago
    } else {
      const maxValue = value && value > 0 && value <= 60 ? value : 60;
      startTime = Math.floor((Date.now() - maxValue * 60 * 1000) / 1000); // x hour ago
    }
  } catch (error) {
    console.log("Error getting custom timeframe.");
  }
  return startTime;
};

export const getLambdaInsightHandler = async (event) => {
  // Parse lambdaGroup from query string or JSON body
  let lambdaGroup;
  let lambdaQuery;
  let timeFrame;

  // parse lambdaGroup
  if (event.queryStringParameters?.lambdaGroup) {
    lambdaGroup = event.queryStringParameters.lambdaGroup;
  } else if (event.body) {
    const body = JSON.parse(event.body);
    lambdaGroup = body.lambdaGroup;
  }

  // parse lambdaQuery
  if (event.queryStringParameters?.lambdaQuery) {
    lambdaQuery = event.queryStringParameters.lambdaQuery;
  } else if (event.body) {
    const body = JSON.parse(event.body);
    lambdaQuery = body.lambdaQuery;
  }

  // parse timeFrame
  if (event.queryStringParameters?.timeFrame) {
    timeFrame = event.queryStringParameters.timeFrame;
  } else if (event.body) {
    const body = JSON.parse(event.body);
    timeFrame = body.timeFrame;
  }

  if (!lambdaGroup) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No lambdaGroup query provided" }),
    };
  }

  try {
    const logGroupName = lambdaGroup;
    const queryString =
      lambdaQuery ||
      `
fields @timestamp, @message, @logStream, @log
| stats count() as coldStarts, avg(record.metrics.durationMs) as avgInitMs, max(record.metrics.durationMs) as maxInitMs, min(record.metrics.durationMs) as minInitMs
| sort @timestamp desc
| limit 10000
  `;

    // Time range for the query (last 1 hour)
    const startTime = handleGetCustomTimeFrame(timeFrame);
    const endTime = Math.floor(Date.now() / 1000);

    // 1️⃣ Start the CloudWatch Logs Insights query
    const startQuery = await cloudwatchClient.send(
      new StartQueryCommand({
        logGroupName,
        startTime,
        endTime,
        queryString,
        limit: 100,
      })
    );

    const queryId = startQuery.queryId;

    // 2️⃣ Poll until the query completes
    let queryStatus = "Running";
    let results;
    while (queryStatus === "Running" || queryStatus === "Scheduled") {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await cloudwatchClient.send(
        new GetQueryResultsCommand({ queryId })
      );
      queryStatus = res.status;
      results = res.results;
    }

    // 3️⃣ Convert results into JSON
    const formatted = results.map((row) => {
      const obj = {};
      row.forEach((col) => {
        obj[col.field] = col.value;
      });
      return obj;
    });

    // console.log("Cold Start Stats:", formatted);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Log insights query completed.`,
        result: formatted,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

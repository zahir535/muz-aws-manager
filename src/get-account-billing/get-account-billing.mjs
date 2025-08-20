import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

const client = new CostExplorerClient({ region: "ap-southeast-1" });

export const getAccountBillingHandler = async (event) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const end = today.toISOString().split("T")[0];

    // ---- TOTAL COST ----
    const totalCmd = new GetCostAndUsageCommand({
      TimePeriod: { Start: start, End: end },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
    });
    const totalResponse = await client.send(totalCmd);

    const totalAmount = parseFloat(
      totalResponse.ResultsByTime[0].Total.UnblendedCost.Amount
    );
    const currency = totalResponse.ResultsByTime[0].Total.UnblendedCost.Unit;

    // ---- SERVICE BREAKDOWN ----
    const serviceCmd = new GetCostAndUsageCommand({
      TimePeriod: { Start: start, End: end },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
    });
    const serviceResponse = await client.send(serviceCmd);

    const breakdown = serviceResponse.ResultsByTime[0].Groups.map((g) => ({
      service: g.Keys[0],
      amount: parseFloat(g.Metrics.UnblendedCost.Amount),
      currency,
    }));

    const moreDetails = event?.queryStringParameters?.inDetails
      ? {
          totalResponse: totalResponse,
          serviceResponse: serviceResponse,
        }
      : {};

    const data = {
      billingTotal: totalAmount,
      currency,
      periodStart: start,
      periodEnd: end,
      serviceBreakdown: breakdown,
      ...moreDetails,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Cost breakdown query completed.`,
        data: data,
      }),
    };
  } catch (error) {
    console.log("Error getting cost breakdown.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

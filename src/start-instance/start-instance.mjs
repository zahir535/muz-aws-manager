// File: src/start-instance/start-instance.js
import { EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";

export const startInstanceHandler = async (event) => {
  const ec2 = new EC2Client({ region: "ap-southeast-1" });

  try {
    // Parse instanceId from query string or JSON body
    let instanceId;
    if (event.queryStringParameters?.instanceId) {
      instanceId = event.queryStringParameters.instanceId;
    } else if (event.body) {
      const body = JSON.parse(event.body);
      instanceId = body.instanceId;
    }

    if (!instanceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'instanceId' parameter" }),
      };
    }

    // Start the instance
    const startCmd = new StartInstancesCommand({
      InstanceIds: [instanceId],
    });

    const startResult = await ec2.send(startCmd);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Starting instance ${instanceId}`,
        result: startResult,
      }),
    };
  } catch (error) {
    console.error("Error starting instance:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

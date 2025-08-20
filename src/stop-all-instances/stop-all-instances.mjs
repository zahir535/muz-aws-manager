// File: src/stop-all-instances/stop-all-instances.js
import {
  EC2Client,
  DescribeInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";

export const stopAllInstancesHandler = async () => {
  const ec2 = new EC2Client({ region: "ap-southeast-1" });

  try {
    // 1. Get all running instances
    const describeCmd = new DescribeInstancesCommand({
      Filters: [
        {
          Name: "instance-state-name",
          Values: ["running"],
        },
      ],
    });

    const describeResult = await ec2.send(describeCmd);

    // Extract instance IDs
    const instanceIds = [];
    describeResult.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        instanceIds.push(instance.InstanceId);
      });
    });

    if (instanceIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No running instances found." }),
      };
    }

    // 2. Stop all running instances
    const stopCmd = new StopInstancesCommand({
      InstanceIds: instanceIds,
    });

    const stopResult = await ec2.send(stopCmd);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Stopping instances...",
        instances: instanceIds,
        result: stopResult,
      }),
    };
  } catch (error) {
    console.error("Error stopping instances:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

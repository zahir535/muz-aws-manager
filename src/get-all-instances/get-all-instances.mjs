// File: src/get-all-instances/get-all-instances.js
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export const getAllInstancesHandler = async () => {
  const ec2 = new EC2Client({ region: 'ap-southeast-1' });

  try {
    // 1. Get all running instances
    const describeCmd = new DescribeInstancesCommand({});

    const describeResult = await ec2.send(describeCmd);

    // Extract instance IDs
    const instanceLists = [];
    describeResult.Reservations?.forEach(reservation => {
      reservation.Instances?.forEach(instance => {
        instanceLists.push(instance);
      });
    });

    if (instanceLists.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No instances found." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "All instances",
        instances: instanceLists,
      })
    };

  } catch (error) {
    console.error("Error stopping instances:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

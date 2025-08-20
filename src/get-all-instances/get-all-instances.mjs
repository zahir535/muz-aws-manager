// File: src/get-all-instances/get-all-instances.js
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({ region: "ap-southeast-1" });

export const getAllInstancesHandler = async (event) => {
  try {
    // 1. Get all running instances
    const describeCmd = new DescribeInstancesCommand({});

    const describeResult = await ec2.send(describeCmd);

    // Extract instance IDs
    const instanceLists = [];
    describeResult.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        if (event?.queryStringParameters?.inDetails) {
          instanceLists.push(instance);
        } else {
          instanceLists.push({
            instanceId: instance.InstanceId,
            Tags: instance.Tags,
            State: instance.State,
            PublicDnsName: instance.PublicDnsName,
          });
        }
      });
    });

    if (instanceLists.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No instances found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "All instances",
        instances: instanceLists,
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

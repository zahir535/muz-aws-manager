# Lambda Directories

Available lambda available in the repo. Technically, all resources or lambda can be discerned from the template.yaml directly. This doc will be a redundant documentation of available lambda's from the repo.

All lambdas will be accessible from url:

```
https://<API_GATEWAY_URL>/Prod
```

### EC2

##### | stopAllInstancesHandler

Lambda to stop all running instances of the account.

```
https://<API_GATEWAY_URL>/Prod/stop-all-instances
```

##### | getAllInstancesHandler

Lambda to get details of all instances of the account. Can pass some query to get instances in full detail or simple details only.

```
// returns simplified & critical details of all instances
https://<API_GATEWAY_URL>/Prod/get-all-instances

// return all details of all instances
https://<API_GATEWAY_URL>/Prod/get-all-instances?inDetails=true
```

##### | startInstancesHandler

Lambda to start specific instance in the account, based on instanceId passed.

```
https://<API_GATEWAY_URL>/Prod/start-instance?instanceId=<INSTANCE_ID>
```

### Cloudwatch

##### | getLambdaInsightHandler - WIP

Lambda to get insights on some of the lambda group. Technically can pass custom queries.

### Account & Billing

##### | getAccountBillingHandler

Lambda to get current billing details of the account. Can pass some query to get the billing info in full detail or simple details only.

```
// returns simplified & critical details of the billing
https://<API_GATEWAY_URL>/Prod/get-billing

// return all details of the billing
https://<API_GATEWAY_URL>/Prod/get-billing?inDetails=true
```

## Pending

- `Use the AWS SAM CLI to build and test locally` - This part is not yet tested properly. As of now, any changes is directly uploaded using cloudformation & testing online.

## Use the AWS SAM CLI to build and test locally

Build your application by using the `sam build` command.

```bash
my-application$ sam build
```

The AWS SAM CLI installs dependencies that are defined in `package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
my-application$ sam local invoke helloFromLambdaFunction --no-event
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
sam delete --stack-name muz-aws-manager
```

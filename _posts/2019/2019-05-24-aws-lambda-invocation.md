---
layout: post
title: "AWS Lambda Functions and Invocations Types"
date:  2019-5-24 05:00
category: development
tags: notes
---

# AWS Lambda Functions and Invocations Types

Lessons learned using `serverless invoke` with long running AWS Lambda functions (2+ minutes).

## Synchronous `sls invoke --type RequestResponse`

The `aws-sdk` will fire the lambda function, and stay connected... waiting to know what the result of the lambda run is.

The impmortant part is what happens if the lambda continues to run, but the `aws-sdk` looses track of what is happening.

Most of the time (in my case) the lambda fired a 2nd time... due to the `aws-sdk` logic to try and fire it again.

This is the behaviour that was supprising. Essentially it resulted in multiple invocations with a single run of `serverless invoke`. I saw 4 at least 4 fires from one invoke call.

### `aws-sdk` & `AWS_CLIENT_TIMEOUT`

If you need to wait for a responce, then you have some options. The tools that use `aws-sdk` will let you set the client timeout. There are multiple ways to do this, and it may differ by tool. I won't go into detail beyond an example that worked for me.

When using `serverless` via the CLI, we can use the standard AWS environment variables. The lambda I was working on had a timeout set to the max, 15 minutes.

If we wanted the CLI to wait for the lambda (and we do) we could call Serverless with the following env var...

`AWS_CLIENT_TIMEOUT=900000 serverless invoke -f someFunction`

The client timeout here is set in miliseconds, so 15 minuts. Now the invoke will try to wait for the lambda to finish before falling back to multiple invocations.

## Asynchronous `sls invoke --type Event`

A lambda could be fired asynchronously probably more often than synchronously.

Event base invocations don't wait for the lambda function to finish, thus the client won't know the result of the lambda run. It only knows that AWS was asked to run the function.

If using CloudWatch Events (`AWS::Events::Rule` in CloudFormation terms) this will be the type of invocation used.

Meaning this method should not be affected by the socket timeout.

# Proof of Concept

In this example we can see a basic lambda script written in Node.js. The invocation happens via `serverless invoke`.

Serverless uses `aws-sdk` behind the scenes, and follows the default SDK socket timeout.

Remember, this socket timeout is not the lambda timeout. Rather, it's how long the `aws-sdk` waits for the invocation to finish.

This applies only to Synchronous methods (`--type RequestResponse`) since when using Asynchronous methods the `aws-sdk` will not wait for the lambda to finish.

---

<asciinema-player
    theme="solarized-dark"
    idle-time-limit="0.25"
    start-at="57"
    speed="1"
    cols="204" rows="46"
    src="{{site.baseurl}}/assets/posts/2019/aws-lambda-invocation-1.cast"
></asciinema-player>

---

## References

[serverless invoke](https://serverless.com/framework/docs/providers/aws/cli-reference/invoke/)

[AWS SDK: API Invoke](https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html)

[AWS SDK: Invocation duplication issues](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-retry-timeout-sdk/)
---
layout: post
title: "Lambda Functions: What persists between invocations?"
date:  2019-5-25 05:00
category: development
tags: notes
---

# Lambda Functions: What persists between invocations?

AWS Lambdas Functins are great because they let you create online services and processes without the complexity of a web server. It's simple to create issolated functions that are self contained.

However, even though the complexity is abstracted away there are still some important concepts to understand regarding what goes on behind the scenes.

One such behaviour is that though it's not obvious, there is some persistance between separate invocations of the same Lambda function.

## Lifecycle of a Lambda Invocacion

What exactly happens when a function runs? Per the [AWS Docs](https://docs.aws.amazon.com/lambda/latest/dg/running-lambda-code.html)...

> Any declarations in your Lambda function code (outside the handler code, see Programming Model) remains initialized, providing additional optimization when the function is invoked again. For example, if your Lambda function establishes a database connection, instead of reestablishing the connection, the original connection is used in subsequent invocations. We suggest adding logic in your code to check if a connection exists before creating one.

> Each execution context provides 512 MB of additional disk space in the /tmp directory. The directory content remains when the execution context is frozen, providing transient cache that can be used for multiple invocations. You can add extra code to check if the cache has the data that you stored. For information on deployment limits, see AWS Lambda Limits.

> Background processes or callbacks initiated by your Lambda function that did not complete when the function ended resume if AWS Lambda chooses to reuse the execution context. You should make sure any background processes or callbacks (in case of Node.js) in your code are complete before the code exits.

## TL;DR; What does this mean?

To me this says...

> Only the handler function is guaranteed to run each time.

> Make sure the handler functions contains all the preflight & initialization logic.

## Demo

Consider the example below. There are two handlers, both using the [Knex.js](http://knexjs.org) library to connect to a Postgres database.

Both handlers leverage `knex.destroy()` to close the database connection after finishing the database query.

`checkDatabaseConnection ` trusts the first few lines to initialize the connection. It's standard to see the `knex` object initialized this way in applications.

`checkDatabaseConnectionProper` does not, and instead manually verifies the database connection is created. This is done via `knex.initialize()`.

---

```

// results in a database pool that will be used to connect
const config = require('../config/knexfile')
const knex = require('knex')(config)

//
// This handler will fist try and use the connection
//
// It (incorrectly) assumes the lines above run each time this handler
// is invoked, resulting in failed runs if the invocation happens in a
// container that previouslly destroyed the database connection
//
const checkDatabaseConnection = () => {
  console.log('Invoked: checkDatabaseConnection')
  // test the connection, and manually close the connection to the database
  return queryPostgres().finally(() => knex.destroy())
}

//
// This handler will first open a connection if one does not exist
// and then try and test the connection
//
// It correctly believes it's unable to trust that the connection persisted
// from the previous invocations.
//
const checkDatabaseConnectionProper = async () => {
  console.log('Invoked: checkDatabaseConnectionProper')

  console.log('Re-init the database connection (if required)')
  knex.initialize()
  
  return queryPostgres().finally(() => knex.destroy())
}

//
// returns a promise that will try and query the database
//
const queryPostgres = () => {
  return knex
    .raw('SELECT 1 as one')
    .then((resp) => {
      const command = resp.command
      console.log('>>> Postgres: success...', command)
      return 'Postgres: connection test success'
    })
    .catch((e) => {
      const message = e.message
      console.error('>>> Postgres: error...', message)
      return 'Postgres: connection test fail'
    })
}

module.exports = {
  checkDatabaseConnection,
  checkDatabaseConnectionProper
}
```

## Walk through

<asciinema-player
    theme="solarized-dark"
    src="{{site.baseurl}}/assets/posts/2019/lambda-lifecycles.cast"
></asciinema-player>

## References

[Docs: AWS Lambda Execution Context](https://docs.aws.amazon.com/lambda/latest/dg/running-lambda-code.html)
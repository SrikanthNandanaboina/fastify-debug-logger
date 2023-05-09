# Fastify-debug-logger

# Introduction
This document describes the implementation details of a DebugLogger module that can be used with a Fastify server to log request and response details in a more detailed manner. The module is built on top of the winston logging library and provides additional functionality to log request and response details such as request and response headers, request and response payload, request and response timings, etc.

# Usage

To use the DebugLogger module, you need to add it to your Fastify server application as a plugin. To do this, you first need to install the debug-logger package using NPM or Yarn. You can then import the DebugLogger plugin and register it with your Fastify server application.

```ruby
// Import the DebugLogger plugin
import { DebugLogger } from "debug-logger";

// Create a new Fastify server instance
const server = require("fastify")();

// Register the DebugLogger plugin with the server
server.register(DebugLogger, {
  timezone: "America/New_York", // Set the timezone for the logger
  transports: [
    // Define the transports to use for logging (e.g. Console, File)
    new transports.Console({
      level: "debug",
      format: format.combine(
        format.colorize(),
        format.simple(),
      ),
    }),
  ],
});
```
Once the plugin is registered, you can access the DebugLogger instance from the Fastify instance and use its logging methods to log request and response details. For example, you can log request headers and payload in the onRequest hook and log response payload in the onSend hook.

```ruby
// Add onRequest hook to log request details
server.addHook("onRequest", (req, res, done) => {
  const { DebugLogger } = server;
  
  // Set the request ID for the logger
  DebugLogger.setRequestId(uuid());

  // Log the request details
  DebugLogger.info(`Request received ${req.raw.method} - ${req.raw.url}`);
  DebugLogger.info(`Request headers - ${JSON.stringify(req.headers)}`);

  if (!_isEmpty(req.body)) {
    DebugLogger.info(`Request body - ${JSON.stringify(req.body)}`);
  }

  if (!_isEmpty(req.query)) {
    DebugLogger.info(`Request query - ${JSON.stringify(req.query)}`);
  }

  done();
});

// Add onSend hook to log response details
server.addHook("onSend", (req, res, payload, done) => {
  const { DebugLogger } = server;

  // Log the response details
  DebugLogger.info(`Response Payload - ${payload}`);

  done();
});
```
# DebugLogger Functionality
The DebugLogger module provides the following functionality to log request and response details:

## setRequestId(requestId: string): DebugLogger
Sets the request ID for the logger. This should be called at the beginning of each request to ensure that all log messages related to the request are tagged with the correct request ID.

## getRequestId(): string
Returns the current request ID for the logger.

## fatal(msg: any): void
Logs a message with level fatal. This method should be used to log critical errors that cause the application to crash or become unusable.

## error(msg: any): void
Logs a message with level error. This method should be used to log non-critical errors that do not cause the application to crash but may impact its functionality.

## warn(msg: any): void
Logs a message with level warn. This method should be used to log warnings that do not cause errors but may indicate potential issues.

## info(msg: any): void
Logs a message with level `info

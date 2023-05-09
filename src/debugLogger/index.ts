import { createLogger, transports, format } from "winston";
import { v4 as uuid } from "uuid";
import * as Transport from "winston-transport";
import moment from "moment-timezone";
import path from "path";
import { default as _isEmpty } from "lodash/isEmpty";
import fp from "fastify-plugin";

interface WinstonOptions {
  timestamp: string;
  timezone: string;
  transports: Transport[];
}

const DEFAULTS = {
  timezone: "Asia/Kolkata",
  timestamp: "MMM-DD-YYYY HH:mm:ss",
  transports: [new transports.Console()],
};

const getConfig = ({ timezone, timestamp, transports }) => ({
  transports: [...transports, ...DEFAULTS.transports],
  format: format.combine(
    format((info) => {
      info.level = info.level.toUpperCase();
      info.timestamp = moment().tz(timezone).format(timestamp);

      return info;
    })(),
    format.printf((info) => {
      const requestId = info.reqId ? `${info.reqId} ` : "";
      const file = info.file || "unknown";
      const line = info.line || "unknown";
      const message =
        typeof info.message === "object"
          ? JSON.stringify(info.message)
          : info.message;
      return `${info.level}   ${info.timestamp}    ${file}:${line}     ${requestId}     ${message}`;
    }),
    format.colorize({
      all: true,
    })
  ),
});

class WinstonLogger {
  #requestId;
  logger;

  constructor(options: WinstonOptions) {
    const logConfiguration = getConfig({
      timestamp: options.timestamp,
      timezone: options.timezone,
      transports: options.transports,
    });

    this.logger = createLogger(logConfiguration);
  }

  setRequestId(requestId) {
    this.#requestId = requestId;
    return this;
  }

  getRequestId() {
    return this.#requestId;
  }

  fatal(msg) {
    const stackTrace = new Error().stack.split("\n")[2].trim();
    const file = path.basename(stackTrace.split(":")[0]);
    const line = stackTrace.split(":")[1];

    this.logger
      .child({
        reqId: this.#requestId,
        file,
        line,
      })
      .info(msg);
  }

  info(msg) {
    const stackTrace = new Error().stack.split("\n")[2].trim();
    const file = path.basename(stackTrace.split(":")[0]);
    const line = stackTrace.split(":")[1];

    this.logger
      .child({
        reqId: this.#requestId,
        file,
        line,
      })
      .info(msg);
  }

  error(msg) {
    const stackTrace = new Error().stack.split("\n")[2].trim();
    const file = path.basename(stackTrace.split(":")[0]);
    const line = stackTrace.split(":")[1];

    this.logger
      .child({
        reqId: this.#requestId,
        file,
        line,
      })
      .error(msg);
  }

  debug(msg) {
    const stackTrace = new Error().stack.split("\n")[2].trim();
    const file = path.basename(stackTrace.split(":")[0]);
    const line = stackTrace.split(":")[1];

    this.logger
      .child({
        reqId: this.#requestId,
        file,
        line,
      })
      .debug(msg);
  }

  warn(msg) {
    const stackTrace = new Error().stack.split("\n")[2].trim();
    const file = path.basename(stackTrace.split(":")[0]);
    const line = stackTrace.split(":")[1];

    this.logger
      .child({
        reqId: this.#requestId,
        file,
        line,
      })
      .warn(msg);
  }
}

function debugLogger(fastify, options, next) {
  const logger = new WinstonLogger({
    timestamp: options.timestamp || DEFAULTS.timestamp,
    timezone: options.timezone || DEFAULTS.timezone,
    transports: options.transports || [],
  });

  fastify.decorate("DebugLogger", logger);

  fastify.addHook("onRequest", (req, res, done) => {
    const { DebugLogger } = fastify;

    DebugLogger.setRequestId(uuid());
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

  fastify.addHook("onSend", (req, res, payload: string, done) => {
    const { DebugLogger } = fastify;

    DebugLogger.info(`Response Payload - ${payload}`);

    done();
  });

  next();
}

export const DebugLogger = fp(debugLogger);

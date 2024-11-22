import fs from "fs";
import pino from "pino";
import pinoPretty from "pino-pretty";

import config from "@/config";

const REDACT_PATHS = [
  "email",
  "*.email",
  "[*].email",
  "[*].*.email",

  "password",
  "*.password",
  "[*].password",
  "[*].*.password",
];

class Logger {
  private readonly logger: pino.Logger;

  constructor(nodeEnv: typeof config.NODE_ENV) {
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs");
    }

    const streams = [
      {
        level: "info",
        stream:
          nodeEnv === "development"
            ? pinoPretty({ colorize: true, ignore: "pid,hostname" })
            : process.stdout,
      },
      {
        level: "info",
        stream: fs.createWriteStream("./logs/all.log", { flags: "a" }),
      },
      {
        level: "error",
        stream: fs.createWriteStream("./logs/error.log", { flags: "a" }),
      },
    ];

    this.logger = pino(
      {
        level: nodeEnv === "test" ? "silent" : "info",
        timestamp: pino.stdTimeFunctions.isoTime,
        nestedKey: "payload",
        redact: {
          paths: nodeEnv === "production" ? REDACT_PATHS : [],
          remove: true,
        },
      },
      pino.multistream(streams),
    );
  }

  public info(message: string, payload: Record<string, any> = {}): void {
    this.logger.info(payload, message);
  }

  public warn(message: string, payload: Record<string, any> = {}): void {
    this.logger.warn(payload, message);
  }

  public error(message: string, payload: Record<string, any> = {}): void {
    this.logger.error(payload, message);
  }

  public fatal(message: string, payload: Record<string, any> = {}): void {
    this.logger.fatal(payload, message);
  }
}

export default new Logger(config.NODE_ENV);

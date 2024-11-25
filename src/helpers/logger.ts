import fs from "fs";
import pino, { type LoggerOptions } from "pino";
import pinoPretty from "pino-pretty";

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
  private readonly logger: pino.Logger<"http">;

  constructor(nodeEnv: string) {
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

    const pinoOptions: LoggerOptions<"http"> = {
      level: nodeEnv === "test" ? "silent" : "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      nestedKey: "payload",
      redact: {
        paths: nodeEnv === "production" ? REDACT_PATHS : [],
        remove: true,
      },
      customLevels: {
        http: 35,
      },
    };

    this.logger = pino(pinoOptions, pino.multistream(streams));
  }

  public http(message: string, payload: Record<string, any> = {}): void {
    this.logger.http(payload, message);
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

const nodeEnv = Bun.env.NODE_ENV;
if (!nodeEnv) {
  console.error("NODE_ENV missing");
  process.exit(1);
}

export default new Logger(nodeEnv);

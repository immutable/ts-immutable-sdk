import winston, { transport, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import serverConfig from "./config";
import { environment } from "./config";

const transportsArray: transport[] = [
  new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf((info) => {
        // If info.message is an object, pretty print it. Otherwise, leave it as is.
        const message = typeof info.message === "object" ? JSON.stringify(info.message, null, 2) : info.message;
        return `[${info.timestamp}][${info.level}]${message}`;
      })
    ),
  }),
  // ... other code
];

//If logging to file is enabled in config.ts, let's output to file, we also want to use a file per day, datePattern dictates the frequency
if (serverConfig[environment].enableFileLogging) {
  transportsArray.push(
    new DailyRotateFile({
      filename: "logs/minting-api-backend-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.printf((info) => `${JSON.stringify({ timestamp: info.timestamp, level: info.level, message: info.message })}`)
      ),
    })
  );
}

const logger = winston.createLogger({
  level: serverConfig[environment].logLevel,
  transports: transportsArray,
});

export default logger;

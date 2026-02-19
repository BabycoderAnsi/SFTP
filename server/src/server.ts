import https from "https";
import fs from "fs";
import app from './app';
import dotenv from "dotenv";
import { log } from './logging/logging';

dotenv.config();

const cert = fs.readFileSync("./certs/cert.pem");
const pem = fs.readFileSync("./certs/key.pem");

const PORT: number = parseInt(process.env.SFTP_SERVER_PORT || "8443", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

const options: https.ServerOptions = {
  cert: cert,
  key: pem,
};

https.createServer(options, app).listen(PORT, () => {
  log("info", "server_started", {
    port: PORT,
    environment: NODE_ENV,
    protocol: "https",
  });
});

process.on("SIGTERM", () => {
  log("info", "server_shutdown", { signal: "SIGTERM" });
  process.exit(0);
});

process.on("SIGINT", () => {
  log("info", "server_shutdown", { signal: "SIGINT" });
  process.exit(0);
});

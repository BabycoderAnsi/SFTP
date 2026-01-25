import https from "https";
import fs from "fs";
import app from "./app.ts";
import dotenv from "dotenv";

dotenv.config();

const cert = fs.readFileSync("./certs/cert.pem");
const pem = fs.readFileSync("./certs/key.pem");

const PORT: number = parseInt(process.env.SFTP_SERVER_PORT || "8443", 10);

const options: https.ServerOptions = {
  cert: cert,
  key: pem,
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`SFTP server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("Termination signal received");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Interrupt signal received");
  process.exit(0);
});

import SftpClient from "ssh2-sftp-client";
import { retry } from "../resilience/retry.js";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES: number = parseInt(process.env.MAX_RETRIES || "3", 10);

export async function withSftpClient<T>(
  fn: (sftp: SftpClient) => Promise<T>
): Promise<T> {
  return await retry(async () => {
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: process.env.SFTP_HOST || "localhost",
        port: parseInt(process.env.SFTP_PORT || "2222", 10),
        username: process.env.SFTP_USER || "sftpuser",
        password: process.env.SFTP_PASSWORD || "password",
      });

      return await fn(sftp);
    } finally {
      await sftp.end();
    }
  }, MAX_RETRIES);
}

export async function uploadFile(
  sftp: SftpClient,
  remotePath: string,
  buffer: Buffer
): Promise<string> {
  try {
    return await sftp.put(buffer, remotePath);
  } catch (err) {
    throw err;
  }
}

export async function createFolder(
  sftp: SftpClient,
  remotePath: string
): Promise<string> {
  try {
    return await sftp.mkdir(remotePath);
  } catch (err) {
    throw err;
  }
}

import SftpClient from "ssh2-sftp-client";
import { retry } from '../resilience/retry';
import { log } from '../logging/logging';
import { createReadStream } from 'fs';
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES: number = parseInt(process.env.MAX_RETRIES || "3", 10);
const SFTP_HOST = process.env.SFTP_HOST || "localhost";
const SFTP_PORT = parseInt(process.env.SFTP_PORT || "2222", 10);

export async function withSftpClient<T>(
  fn: (sftp: SftpClient) => Promise<T>
): Promise<T> {
  return await retry(async () => {
    const sftp = new SftpClient();
    try {
      log("debug", "sftp_connecting", { host: SFTP_HOST, port: SFTP_PORT });

      await sftp.connect({
        host: SFTP_HOST,
        port: SFTP_PORT,
        username: process.env.SFTP_USER || "sftpuser",
        password: process.env.SFTP_PASSWORD || "password",
      });

      log("debug", "sftp_connected", { host: SFTP_HOST, port: SFTP_PORT });

      const result = await fn(sftp);
      return result;
    } catch (err) {
      log("error", "sftp_error", {
        host: SFTP_HOST,
        port: SFTP_PORT,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    } finally {
      await sftp.end();
      log("debug", "sftp_disconnected", { host: SFTP_HOST, port: SFTP_PORT });
    }
  }, MAX_RETRIES);
}

export async function uploadFileStream(
  sftp: SftpClient,
  remotePath: string,
  localPath: string
): Promise<void> {
  try {
    log("debug", "sftp_upload_start", { remotePath, localPath });
    
    const readStream = createReadStream(localPath);
    await sftp.put(readStream, remotePath);
    
    log("debug", "sftp_upload_success", { remotePath });
  } catch (err) {
    log("error", "sftp_upload_failed", {
      remotePath,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function createFolder(
  sftp: SftpClient,
  remotePath: string
): Promise<string> {
  try {
    log("debug", "sftp_mkdir_start", { remotePath });
    const result = await sftp.mkdir(remotePath);
    log("debug", "sftp_mkdir_success", { remotePath });
    return result;
  } catch (err) {
    log("error", "sftp_mkdir_failed", {
      remotePath,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

import SftpClient from 'ssh2-sftp-client';
import { retry } from '../resilience/retry.js';
import dotenv from "dotenv";
dotenv.config();

const MAX_RETRIES = process.env.MAX_RETRIES;

export async function withSftpClient(fn) {
  return await retry(async () => {
    const sftp = new SftpClient;
    try {
      await sftp.connect({
        host: process.env.SFTP_HOST || 'localhost',
        port: process.env.SFTP_PORT || 2222,
        username: process.env.SFTP_USER || 'sftpuser',
        password: process.env.SFTP_PASSWORD || 'password',
      });

      return await fn(sftp);
    }
    finally {
      await sftp.end();
    }
  }, MAX_RETRIES)
}

export async function uploadFile(sftp, remotePath, buffer) {
  try {
    return await sftp.put(buffer, remotePath, {
      flags: 'wx',
    });
  } catch (err) {
    throw err;
  }
}

export async function createFolder(sftp, remotePath) {
  try {
    return await sftp.mkdir(remotePath);
  } catch (err) {
    throw err;
  }
}

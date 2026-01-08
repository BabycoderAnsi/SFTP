import SftpClient from 'ssh2-sftp-client';

export async function withSftpClient(fn) {
  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host: process.env.SFTP_HOST || 'localhost',
      port: process.env.SFTP_PORT || 2222,
      username: process.env.SFTP_USER || 'sftpuser',
      password: process.env.SFTP_PASSWORD || 'password',
    });

    return await fn(sftp);
  } finally {
    await sftp.end();
  }
}

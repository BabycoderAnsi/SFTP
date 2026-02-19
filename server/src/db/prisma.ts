import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { log } from '../logging/logging';
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const caCertPath = path.join(__dirname, '../../../certs/ca.pem');
const hasCaCert = fs.existsSync(caCertPath);

const rawDatabaseUrl = process.env.DATABASE_URL || '';
const databaseUrl = rawDatabaseUrl.replace(/[?&]sslmode=[^&]*/gi, '');

let sslConfig: { ca?: string; rejectUnauthorized: boolean };

if (hasCaCert) {
  sslConfig = {
    ca: fs.readFileSync(caCertPath).toString(),
    rejectUnauthorized: true,
  };
} else {
  sslConfig = {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  };
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslConfig,
});

const adapter = new PrismaPg(pool);

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

log("info", "db_connected", {
  database: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"),
  sslMode: hasCaCert ? "verify-ca" : "no-verify",
});

export default prisma;

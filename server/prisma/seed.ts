import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Role, UserStatus } from '../src/generated/prisma';

const { Pool } = pg;

const caCertPath = path.join(__dirname, '../certs/ca.pem');
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
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    console.log(`Admin user "${adminUsername}" already exists`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Admin user created: ${admin.username} (${admin.email})`);
  console.log(`Role: ${admin.role}, Status: ${admin.status}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

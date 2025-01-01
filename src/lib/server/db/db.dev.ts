import pg from 'pg';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';

const { Pool } = pg;
const PORT = 5432;

export const localPool = new Pool({
	user: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	host: env.POSTGRES_HOST,
	port: PORT,
	database: env.POSTGRES_DB,
});

export const db = drizzle(localPool);

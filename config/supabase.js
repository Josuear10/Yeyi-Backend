import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres({
  host: process.env.SUPABASE_HOST,
  port: process.env.SUPABASE_PORT ? parseInt(process.env.SUPABASE_PORT) : 5432,
  database: process.env.SUPABASE_DB,
  username: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASS,
  ssl: "require",
});

export default sql;

const { Pool } = require("pg");

const isProduction = Boolean(process.env.DATABASE_URL);

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
      }
);

pool.on("connect", () => {
  console.log(
    isProduction
      ? "Connected to Neon PostgreSQL"
      : "Connected to local PostgreSQL"
  );
});

pool.on("error", (error) => {
  console.error(" PostgreSQL error:", error);
});

module.exports = pool;
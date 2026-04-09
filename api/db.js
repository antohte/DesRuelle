import mysql from 'mysql2/promise'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL

const configStr = {
  waitForConnections: true,
  connectionLimit: 10,
}

const configObj = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'desruelle',
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
}

const pool = connectionString
  ? mysql.createPool(connectionString)
  : mysql.createPool(configObj)

export default pool

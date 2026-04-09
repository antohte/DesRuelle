import mysql from 'mysql2/promise'

const pool = mysql.createPool('mysql://root:RkUOVbLKGaENGeUawAJnAvmUOemqgwQY@mainline.proxy.rlwy.net:24326/railway')

export default pool

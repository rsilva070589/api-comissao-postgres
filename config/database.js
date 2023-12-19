require('dotenv').config()
  
const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: '34.134.142.37',// '172.17.0.1',
    database: 'postgres',
    password: 'BancoPro@123',
    port: '5432',
  })
 

  module.exports = {
    pool      
  }

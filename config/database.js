require('dotenv').config()
  
const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: 'agiltecsistemas.com.br',// '172.17.0.1',
    database: 'postgres',
    password: 'BancoPro@123',
    port: '5432',
  })
 

  module.exports = {
    pool      
  }

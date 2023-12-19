const database = require('../../config/database.js') 

require('dotenv').config()
let schemaUsuario =  process.env.DB_DATABASE_SCHEMA

const getFuncoes = (request, response) => {  
    const id = request.params.id
  

    database.pool.query('SELECT * FROM "' +schemaUsuario+'".funcoes ', (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error)   
      response.status(200).json(results.rows)
    })
  }

module.exports = {
    getFuncoes 
  }
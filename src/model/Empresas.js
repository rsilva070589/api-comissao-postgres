const database = require('../../config/database.js') 

require('dotenv').config()
let schemaUsuario =  process.env.DB_DATABASE_SCHEMA

const getEmpresas = (request, response) => {

  const empresas = []
    const id = request.params.id
   

    database.pool.query('SELECT * FROM "' +schemaUsuario+'".empresas  order by cod_empresa', (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error)  
      results.rows.map(x=> {
        const data = {
          COD_EMPRESA: x.cod_empresa,
          NOME: x.nome
        }
        empresas.push(data)

      })
      response.status(200).json(empresas)
    })
  }

module.exports = {
    getEmpresas
  }
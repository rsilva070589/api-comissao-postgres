const database = require('../../config/database.js') 

require('dotenv').config()
let schemaUsuario =  process.env.DB_DATABASE_SCHEMA

const getRegras = (request, response) => {

  const regras = []
    const id = request.params.id


    database.pool.query('SELECT * FROM "' +schemaUsuario+'".comissoes_faixa ', (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error)  
      results.rows.map(x=> {
        const data = {
          COD_EMPRESA: x.cod_empresa,
          NOME: x.nome
        }
        regras.push(data)

      })
      response.status(200).json(results.rows)
    })
  }

module.exports = {
  getRegras
  }
const database = require('../../config/database.js') 

const valorLogado = 'MGARCAS'
const getLogin = (request, response) => {
    const id = request.params.id
    console.log('Base de dados do '+id)

    database.pool.query('SELECT * FROM comissao.acesso WHERE usuario = $1', [id],(error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error)  
      response.status(200).json(results.rows)
    })
  }

module.exports = {
    getLogin,
    valorLogado
  }
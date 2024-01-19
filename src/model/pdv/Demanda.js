const database = require('../../../config/database.js') 


const get = (request, response) => {
  database.pool.query('SELECT * FROM mercearia.vw_compras', (error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error)
    response.status(200).json(results.rows)
  })
}
  

module.exports = {
  get
}
const database = require('../../config/database.js') 
 
const getLogin = (request, response) => {
    const id = request.body.email.toUpperCase()
    database.pool.query('SELECT * FROM agiltec.empresas WHERE username = $1', [id],(error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error)       }
      if (!error)  
      if (results.rows[0]?.senha == request.body.senha){
        console.log('login Sucesso: '+request.body.email)
        const dadosLogin = [ 
          {
            nomefantasia: results.rows[0].nomefantasia,
            nome:         results.rows[0].nome,
            cod_cliente:  results.rows[0].cod_cliente,
            schema:       results.rows[0].schema,
            username:     results.rows[0].username,
            login:        true
          }        
         ]


        response.status(200).json(dadosLogin)
      }else{
        console.log('login nao confere')
        response.status(200).json({login: false})
      }
      
    })
  }

module.exports = {
    getLogin
  }
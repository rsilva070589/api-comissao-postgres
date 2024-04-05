const database = require('../../config/database.js') 

 
 
const getLogin = async (request, response) => {    

    const usuario = request.body.USUARIO
    const schema  = request.body.SCHEMA
    const senha   = request.body.SENHA
  var acessos_usuario = []

     queryLogin = `
            select 
              e.nomefantasia,
              e.cod_cliente,
              e.schema,
              eu.username,
              eu.senha,
              eu.cod_funcao,
              eu.nome,
              fc.funcao
          from agiltec.empresas e ,agiltec.empresa_usuarios eu, agiltec.empresa_funcoes fc
          where e."schema" = eu."schema"
          and   eu.cod_funcao = fc.cod_funcao
          and   eu.username = $1
          and   e.schema = $2
  `
    // buscando acessos
     
    queryAcesso = `
              select cod_acesso
              from agiltec.usuario_acesso
              where schema = $1
              and  username    = $2
                `
  
      database.pool.query(queryAcesso, [schema,usuario],(error, results) => {
        console.log('ACESSOS DO USUARIO: '+usuario)
        if (error) {
          console.log(error) 
        }
       
        if (!error){      
          console.log(results.rows)
          acessos_usuario = results.rows
        } 
      })
    

 // BUSCANDO login

    database.pool.query(queryLogin, [usuario,schema],(error, results) => {
    
      if (error) {
        response.status(500).send(`Ocorreu um ` + error)    
      }
        

      if (results.rows.length < 1 && !error){
        response.status(200).json({login: 'usuario nao existe'})
      }



      if (results.rows[0]?.senha == senha && !error){
        console.log('login Sucesso: '+usuario+' - '+schema)
 
        const dadosLogin = [ 
          {
            nomefantasia: results.rows[0].nomefantasia,
            nome:         results.rows[0].nome,
            cod_cliente:  results.rows[0].cod_cliente,
            schema:       results.rows[0].schema,
            username:     results.rows[0].username,
            funcao:       results.rows[0].funcao,
            login:        true,
            acessos:      acessos_usuario
 
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
 
const database = require('../../config/database.js') 
require('dotenv').config()

let schemaUsuario =  process.env.DB_DATABASE_SCHEMA

console.log(process.env.DB_DATABASE_SCHEMA)

const getLogin = async (usuario,response) => {
  const id = usuario


  database.pool.query('SELECT * FROM comissao.acesso WHERE usuario = $1', [id],(error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error) 
    schemaUsuario = results.rows 
  })
} 

const getUsers = async (request, response) => {
  
  const mes = request.params.id
  console.log(mes)
  const arrayUsuarios = []

  let query = null
    if (!request.params.id){
      query = 'SELECT * FROM "' +schemaUsuario+'".usuarios  ORDER BY "NOME" ASC'
    }else{
      query = 'SELECT * FROM "' +schemaUsuario+'".usuarios where "MES" = $1 ORDER BY "NOME" ASC'
    }

  if (schemaUsuario && query != null){ 
    
    if(request.params.id){
      database.pool.query(query,[mes.replace('-','/')], (error, results) => {
        if (error) {
          response.status(500).send(`Ocorreu um ` + error) 
        }
        if (!error){  
        response.status(200).json(results.rows)     
        }
      } )
   }else{
    database.pool.query(query, (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error){
        response.status(200).json(results.rows)
        }})}
    
  
    
  }else{
    response.status(500).send(`nao tem schema `) 
  }
  
} 

const createUser = (request, response) => {
  const { COD_EMPRESA, NOME_EMPRESA,COD_FUNCAO,FUNCAO,MES,NOME,NOME_COMPLETO,DPTO,GESTOR,MARCA,DIRETORIA,ANULAR,FERIAS,PERIODO_INI,PERIODO_FIM } = request.body

  database.pool.query('INSERT INTO  "' +schemaUsuario+'".usuarios ( "COD_EMPRESA", "NOME_EMPRESA","COD_FUNCAO","FUNCAO","MES","NOME","NOME_COMPLETO","DPTO","GESTOR","MARCA","DIRETORIA","ANULAR","FERIAS","PERIODO_INI","PERIODO_FIM")  VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *', 
                [COD_EMPRESA, NOME_EMPRESA,COD_FUNCAO,FUNCAO,MES,NOME,NOME_COMPLETO,DPTO,GESTOR,MARCA,DIRETORIA,ANULAR,FERIAS,PERIODO_INI,PERIODO_FIM],
                 (error, results) => {
    if (error) {             
      console.log(error) 
    }
    if (!error){
      response.status(201).send(`Usuario cadastrado `)
    }
    
  })
}

const updateUser = (request, response) => {
   
  const { COD_EMPRESA, NOME_EMPRESA,COD_FUNCAO,FUNCAO,NOME_COMPLETO,DPTO,GESTOR,MARCA,DIRETORIA,ANULAR,FERIAS,PERIODO_INI,PERIODO_FIM,NOME,MES } = request.body

  database.pool.query(
    'UPDATE "' +schemaUsuario+'".usuarios SET "COD_EMPRESA" = $1, "NOME_EMPRESA" = $2,"COD_FUNCAO" = $3,"FUNCAO" = $4,"NOME_COMPLETO" = $5,"DPTO" = $6,"GESTOR" = $7,"MARCA" = $8,"DIRETORIA" = $9,"ANULAR"= $10,"FERIAS"= $11,"PERIODO_INI"= $12,"PERIODO_FIM"= $13 WHERE "NOME" = $14 and "MES" = $15',
    [COD_EMPRESA, NOME_EMPRESA,COD_FUNCAO,FUNCAO,NOME_COMPLETO,DPTO,GESTOR,MARCA,DIRETORIA,ANULAR,FERIAS,PERIODO_INI,PERIODO_FIM,NOME,MES],
    (error, results) => {
      if (error) {
        response.status(400).send(`Ocorreu um erro ao Atualizar o USUARIO`)
        throw error
      }
      if (!error){
        response.status(200).send(`User modified Sucesso`)
      } 
      
    }
  )
}

const deleteUser = (request, response) => {
  const { NOME, MES} = request.body

  database.pool.query('DELETE FROM  "' +schemaUsuario+'".usuarios WHERE "NOME" = $1 AND   "MES" = $2', [NOME, MES], (error, results) => {
    if (error) {
      throw error
    }
    if (!error){
      response.status(200).send(`DELETADO USUARIO ID: ${NOME}`)
    }     
  })
}

module.exports = {
  getUsers, 
  createUser,
  updateUser,
  deleteUser,
}
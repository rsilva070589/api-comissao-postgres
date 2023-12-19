 
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
    schemaUsuario = results.rows[0]?.schema 
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
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query('INSERT INTO  "' +schemaUsuario+'".usuarios (CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE)  VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', 
                [CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE],
                 (error, results) => {
    if (error) {             
      console.log('produto nao cadastrado'+ NOME)
    }
    if (!error){
      response.status(201).send(`Produto cadastrado: ${results.rows[0].CODIGO_BARRAS}`)
    }
    
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)  
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query(
    'UPDATE mercearia.produtos SET CATEGORIA = $1, CODIGO_BARRAS = $2,DESCRICAO = $3,FOTO = $4,NOME = $5,SITUACAO = $6,VALOR = $7,VALOR_CUSTO = $8,QTDE_ESTOQUE = $9 WHERE id = $10',
    [CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE,id],
    (error, results) => {
      if (error) {
        response.status(400).send(`Ocorreu um erro ao Atualizar o ID: ${id}`)
        throw error
      }
      if (!error){
        response.status(200).send(`User modified with ID: ${id}`)
      } 
      
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  database.pool.query('DELETE FROM  "' +schemaUsuario+'".usuarios WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if (!error){
      response.status(200).send(`User modified with ID: ${id}`)
    }     
  })
}

module.exports = {
  getUsers, 
  createUser,
  updateUser,
  deleteUser,
}
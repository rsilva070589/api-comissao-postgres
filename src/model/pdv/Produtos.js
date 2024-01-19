const database = require('../../../config/database.js') 
require('dotenv').config()



const getAll = (request, response) => {
  let schemaUsuario =  request.body.SCHEMA
  queryProdutos = 'SELECT c.descricao AS categoria,  c.id AS id_categoria,  p.codigo_barras,  p.descricao,  p.foto,  p.nome,  p.situacao,  p.valor,  p.valor_custo,  p.qtde_estoque,  p.id FROM "' +schemaUsuario+'".produtos p,  "' +schemaUsuario+'".categorias c WHERE p.categoria = c.id;'
  database.pool.query(queryProdutos, (error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error)
    response.status(200).json(results.rows)
  })
}

const getId = (request, response) => {
  const id = parseInt(request.params.id)

  database.pool.query('SELECT * FROM "' +schemaUsuario+'".vwprodutos WHERE id = $1', [id], (error, results) => {
    if (error) {
      response.status(400).send(`Ocorreu um erro ao buscar Registros`)
      throw error
    }
    if (!error){
      response.status(200).json(results.rows)
    }
    
  })
}

const create = (request, response) => {
  let schemaUsuario =  request.body.SCHEMA
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query('INSERT INTO "' +schemaUsuario+'".produtos (CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE)  VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', 
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

const update = (request, response) => {
  let schemaUsuario =  request.body.SCHEMA
  const id = parseInt(request.body.ID)  
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query(
    'UPDATE "' +schemaUsuario+'".produtos SET CATEGORIA = $1, CODIGO_BARRAS = $2,DESCRICAO = $3,FOTO = $4,NOME = $5,SITUACAO = $6,VALOR = $7,VALOR_CUSTO = $8,QTDE_ESTOQUE = $9 WHERE id = $10',
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

const deleteId = (request, response) => {
  let schemaUsuario =  request.body.SCHEMA
  const id = parseInt(request.body.id)

  database.pool.query('DELETE FROM "' +schemaUsuario+'".produtos WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if (!error){
      response.status(200).send(`User modified with ID: ${id}`)
    }     
  })
}

module.exports = {
  getAll,
  getId,
  create,
  update,
  deleteId,
}
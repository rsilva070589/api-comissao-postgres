const database = require('../../config/database.js') 

const valorLogado = require('./Acesso.js') 

let schemaUsuario = null

const getLogin = async (usuario,response) => {
  const id = usuario
  console.log('Base de dados do '+id)

  database.pool.query('SELECT * FROM comissao.acesso WHERE usuario = $1', [id],(error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error)
    console.log(valorLogado)
    schemaUsuario = results.rows[0]?.schema 
  })
}


 

const getUsers = async (request, response) => {
  const username = request.params.username
  await getLogin(username)
  console.log(username)
  

  if (schemaUsuario){
    let query = 'SELECT * FROM "' +schemaUsuario+'".usuarios ORDER BY NOME ASC'
    console.log(query)
  
    database.pool.query(query, (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error)
      response.status(200).json(results.rows)
    })
  }else{
    response.status(500).send(`nao tem schema `) 
  }
  
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  database.pool.query('SELECT * FROM mercearia.vwprodutos WHERE id = $1', [id], (error, results) => {
    if (error) {
      response.status(400).send(`Ocorreu um erro ao buscar Registros`)
      throw error
    }
    if (!error){
      response.status(200).json(results.rows)
    }
    
  })
}

const createUser = (request, response) => {
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query('INSERT INTO mercearia.produtos (CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE)  VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', 
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

  database.pool.query('DELETE FROM mercearia.produtos WHERE id = $1', [id], (error, results) => {
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
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}
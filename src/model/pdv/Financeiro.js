const { query } = require('express')
const database = require('../../../config/database.js') 


const get = (request, response) => {
  database.pool.query(`SELECT "`+schemaUsuario+`".vw_fluxo_financeiro ORDER BY id desc`, (error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error)
    response.status(200).json(results.rows) 
 
  })
}

const getById = (request, response) => {
    const query = `SELECT * FROM "`+schemaUsuario+`".vw_fluxo_financeiro  x
                    WHERE x.DATA >= to_date($1,'dd/mm/yyyy') 
                      and x.DATA <= to_date($2,'dd/mm/yyyy') 
                      order by x.ID`
    const context = {} 
    context.dataIni = (request.body.DATAINI)
    context.dataFim = (request.body.DATAFIM)


    console.log(request.body)

  database.pool.query( query, [context.dataIni,context.dataFim], (error, results) => {
    if (error) {
      response.status(400).send(`Ocorreu um erro ao buscar Registros`)
      throw error
    }
    if (!error){
      response.status(200).json(results.rows)  }
  })?.then(x => x)
}

const create = async (request, response) => {
 
  let seqVenda = 0
  const SqlSeqVenda= ` select nextval('mercearia.seq_fluxo_financeiro')   `  
  await database.pool.query(SqlSeqVenda).then(x => {seqVenda=x.rows[0].nextval})


 
    console.log(`Registrando a venda:  ${seqVenda}`)
    
    const { DATA, CONTA,ORIGEM,FINALIDADE,OBS,VALOR } = request.body

    const sqlInsertVenda = `INSERT INTO mercearia.fluxo_financeiro
    (id, data, conta, origem, finalidade, obs, valor)
    VALUES($1,$2,$3,$4,$5,$6,$7)`
    const parmVenda = [seqVenda,DATA, CONTA,ORIGEM,FINALIDADE,OBS,VALOR]                          


    database.pool.query(sqlInsertVenda,parmVenda,(error, results) => {
    if (error) {      
    throw error
    }
    if (!error){        
    response.status(201).send(`Item ID: ${seqVenda} cadastrada com sucesso` ) 
    }   
    })  
   
}

const update = (request, response) => {
  const id = parseInt(request.params.id)  
  const { DATA, CONTA,ORIGEM,FINALIDADE,OBS,VALOR } = request.body


  database.pool.query(
    `UPDATE mercearia.fluxo_financeiro SET DATA = to_date($1,'dd/mm/yyyy'), CONTA = $2,ORIGEM = $3,FINALIDADE = $4,OBS = $5,VALOR = $6  WHERE id = $7`,
    [DATA, CONTA,ORIGEM,FINALIDADE,OBS,VALOR,id],
    (error, results) => {
      if (error) {
        response.status(400).send(`Ocorreu um erro ao Atualizar o ID: ${id}`)
        throw error
      }
      if (!error){
        response.status(200).send(`Vendas modified with ID: ${id}`)
      } 
      
    }
  )
}

const deleteId = (request, response) => {
  const id = parseInt(request.params.id)

  database.pool.query('DELETE FROM mercearia.fluxo_financeiro WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if (!error){
      response.status(200).send(`Vendas modified with ID: ${id}`)
    }     
  })
}

module.exports = {
  get,
  getById,
  create,
  update,
  deleteId
}
const database = require('../../config/database.js') 

const integraMeta = (request, response) => {
    const { TIPO,COD_EMPRESA_VENDEDORA,MARCA,DATA_VENDA,MES_VENDA,VENDEDOR,TOTAL_VENDA,QTDE,SCHEMA} = request.body
 
    if(SCHEMA){
    
      let query = 'DELETE FROM "' +SCHEMA+'"."META_VENDAS_FECHADA" WHERE "MES_VENDA" = $1 and "COD_EMPRESA_VENDEDORA" = $2 and "TIPO" = $3 and "VENDEDOR" = $4'
      console.log(query)
    
      database.pool.query(query,[MES_VENDA,COD_EMPRESA_VENDEDORA,TIPO,VENDEDOR], (
        error, results) => {
        if (error) {
        throw error
        }
          if (!error){
          console.log(`Deletado Metas: : ${TIPO}`+` Vendedor: ${VENDEDOR}` +` Mes: ${MES_VENDA}` )
          database.pool.query('INSERT INTO "' +SCHEMA+'"."META_VENDAS_FECHADA" ("TIPO","COD_EMPRESA_VENDEDORA","MARCA","DATA_VENDA","MES_VENDA","VENDEDOR","TOTAL_VENDA","QTDE")  VALUES ($1, $2,$3,$4,$5,$6,$7,$8) RETURNING *', 
                    [TIPO,COD_EMPRESA_VENDEDORA,MARCA,DATA_VENDA,MES_VENDA,VENDEDOR,TOTAL_VENDA,QTDE],
              (error, results) => {
              if (error) {             
              console.log('Meta Nao foi atualizada - '+ TIPO)
              response.status(404).send(`Meta Nao cadastrada: ${TIPO}`+` Vendedor: ${TIPO}`+` Mes: ${`Mes: ${MES_VENDA}`}` + ' MOTIVO: '+error)
              }
              if (!error){
              console.log(`SUCESSO-ATUALIZADO: ${TIPO}`+` Vendedor: ${TIPO}`+` Mes: ${`Mes: ${MES_VENDA}`}`)
              response.status(201).send(`SUCESSO-ATUALIZADO: ${TIPO}`+` Vendedor: ${TIPO}`+` Mes: ${`Mes: ${MES_VENDA}`}`)
              }      
          })
          }     
        })  
    }else{
      response.status(404).send(`SCHEMA nao informado`)
    }

      
  }

  module.exports = {
    integraMeta
  }
    
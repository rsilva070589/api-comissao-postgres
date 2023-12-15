const database = require('../../config/database.js') 

const integraVenda = (request, response) => {
    const { SCHEMA,MES_VENDA, ARRAYVENDAS
          }  = request.body
 
    if(SCHEMA && MES_VENDA){
    
      let queryDel = 'DELETE FROM "' +SCHEMA+'"."comissao_encerrada" WHERE "MES_VENDA" = $1'  
            database.pool.query(queryDel,[MES_VENDA], (error, results) => {
            if (error) {
            throw error
            }
              if (!error){
              console.log('Deletado Vendas Mes: '+MES_VENDA ) 
              ARRAYVENDAS.map( x => {      
                gravaVenda(SCHEMA,x.TIPO,x.COD_EMPRESA,x.COD_EMPRESA_VENDEDORA,x.MARCA,x.DATA_VENDA,x.MES_VENDA,x.COD_CLIENTE,x.NOME_CLIENTE,x.CHASSI,x.NOVO_USADO,x.DESCRICAO_MODELO,x.ANO_MODELO,x.COD_PROPOSTA,x.VENDEDOR,x.TOTAL_VENDA,x.QTDE,x.MARGEM_VENDA,x.DESPESAS,x.GANHOS)                
              } )
              response.status(201).send('SUCESSO-VENDA-CADASTRADA')
              }
            
            })
          }     
          
     else{
      response.status(404).send(`SCHEMA ou MES_VENDA nao informado`)
    }     

    
    
    function gravaVenda(SCHEMA,TIPO,COD_EMPRESA,COD_EMPRESA_VENDEDORA,MARCA,DATA_VENDA,MES_VENDA,COD_CLIENTE,NOME_CLIENTE,CHASSI,NOVO_USADO,DESCRICAO_MODELO,ANO_MODELO,COD_PROPOSTA,VENDEDOR,TOTAL_VENDA,QTDE,MARGEM_VENDA,DESPESAS,GANHOS)  {
    
      let queryVendas = 'INSERT INTO "' +SCHEMA+'"."comissao_encerrada" ("TIPO","COD_EMPRESA","COD_EMPRESA_VENDEDORA","MARCA","DATA_VENDA","MES_VENDA","COD_CLIENTE","NOME_CLIENTE","CHASSI","NOVO_USADO","DESCRICAO_MODELO","ANO_MODELO","COD_PROPOSTA","VENDEDOR","TOTAL_VENDA","QTDE","MARGEM_VENDA","DESPESAS","GANHOS")  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *'
 
      database.pool.query(queryVendas,[TIPO,COD_EMPRESA,COD_EMPRESA_VENDEDORA,MARCA,DATA_VENDA,MES_VENDA,COD_CLIENTE,NOME_CLIENTE,CHASSI,NOVO_USADO,DESCRICAO_MODELO,ANO_MODELO,COD_PROPOSTA,VENDEDOR,TOTAL_VENDA,QTDE,MARGEM_VENDA,DESPESAS,GANHOS],
        (error, results) => {
        if (error) {             
        console.log('VENDA Nao foi atualizada - '+ TIPO+ ' REGISTRO '+COD_PROPOSTA)
        response.status(404).send('venda nao cadastrada:'+TIPO+'Vendedor: '+VENDEDOR+' REGISTRO: '+COD_PROPOSTA+'Mes: '+MES_VENDA+'MOTIVO: '+error) 
        }
        if (!error){
        console.log('SUCESSO-VENDA-CADASTRADA: ' +TIPO+' Vendedor:  '+VENDEDOR+ ' REGISTRO: '+COD_PROPOSTA+' Mes: ' +MES_VENDA)
        
        }  
    })}



  }

 

  module.exports = {
    integraVenda
  }
    
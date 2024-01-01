const database = require('../../config/database.js') 

require('dotenv').config()
let schemaUsuario =  process.env.DB_DATABASE_SCHEMA

const getRegras = (request, response) => {

  const regras = []
    const id = request.params.id


    database.pool.query('SELECT * FROM "' +schemaUsuario+'".comissoes_faixa ', (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error)  
      results.rows.map(x=> {
        const data = {
          COD_EMPRESA: x.cod_empresa,
          NOME: x.nome
        }
        regras.push(data)

      })
      response.status(200).json(results.rows)
    })
  }


async function create(request,response) {

  const createSqlRegra = 'insert into  "'+schemaUsuario+'".comissoes_faixa ("COD_EMPRESA","DPTO","COD_FUNCAO","TIPO_COMISSAO","QTDE","PERC","VALOR","PREMIO","QTDE_MIN","QTDE_MAX","MEDIA_ACESSORIOS_MIN","MEDIA_ACESSORIOS_MAX","USA_FAIXA","PERMITE_AVULSO","VALOR_MIN","VALOR_MAX","MES","PAGAR_GESTOR","PERC_MIN","PERC_MAX","GRUPO","CLASSE","APELIDO","CAMPANHA","LEGENDA","ID") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)'

const regra = request.body; 
let seguencia=0

const querySequencia = 'select max("ID") AS NEXTID FROM "' +schemaUsuario+'". comissoes_faixa'
  
 database.pool.query(querySequencia,[],(error, results) => { 
  if (error) {
    console.log(`Ocorreu um ` + error) 
  }
  if (!error) { 
    results.rows.map(x => {
      //arrayUsuarios.push(x)
      seguencia = x.nextid+1
      console.log('Cadastro de Nova Regra ID: '+seguencia)       
      gravaRegra(seguencia)
    })      
  }   
}) 
  
 const gravaRegra = (seguencia) => { 
  console.log('iniciando gravacao')
  console.log(regra) 
  database.pool.query(createSqlRegra,
    [  
    regra.COD_EMPRESA,
    regra.DPTO,
    regra.COD_FUNCAO,
    regra.TIPO_COMISSAO,
    regra.QTDE,
    regra.PERC,
    regra.VALOR,
    regra.PREMIO,
    regra.QTDE_MIN,
    regra.QTDE_MAX,
    regra.MEDIA_ACESSORIOS_MIN,
    regra.MEDIA_ACESSORIOS_MAX,
    regra.USA_FAIXA,
    regra.PERMITE_AVULSO,
    regra.VALOR_MIN,
    regra.VALOR_MAX,
    regra.MES,
    regra.PAGAR_GESTOR,
    regra.PERC_MIN,
    regra.PERC_MAX,
    regra.GRUPO,
    regra.CLASSE,
    regra.APELIDO,
    regra.CAMPANHA, 
    regra.LEGENDA,
    seguencia
  ]
    ,(error, results) => {  
    if (error) {
      console.log(`Ocorreu um ` + error) 
    }
    if (!error) {   
        response.status(201).send('Cadastro de Nova Regra ID: '+seguencia)   
    }   
  })   
 }                
 
}
 
async function deleteRegra(request,response){
  const deleteRegra = 'delete from "'+schemaUsuario+'".comissoes_faixa where "ID" = $1'
  console.log('deletar o ID: ')
  if (request.params.id > 0){
    database.pool.query(deleteRegra,[request.params.id],(error, results) => { 
      if (error) {
        console.log(`Ocorreu um ` + error) 
      }
      if (!error) { 
        console.log('deletado Regra ID: '+request.params.id)            
        response.status(204).send('deletado Regra ID: '+request.params.id) 
             
      }   
    }) 
  }else{
    console.log('ID para delete nao informado')
  }
}

async function updateRegra(request,response){
  const regra = request.body; 
  console.log(regra)

  const updateRegrasql = 'update "'+schemaUsuario+'".comissoes_faixa set "TIPO_COMISSAO"=$2,"QTDE"=$3,"PERC"=$4,"VALOR"=$5,"PREMIO"=$6,"PERMITE_AVULSO"=$7,"CLASSE"=$8,"APELIDO"=$9,"LEGENDA"=$10,"USA_FAIXA"=$11,"VALOR_MIN"=$12,"VALOR_MAX"=$13,"QTDE_MIN"=$14,"QTDE_MAX"=$15,"PERC_MIN"=$16,"PERC_MAX"=$17 where "ID"=$1'
  console.log('update ID: '+request.params.id)
  
  
  if (request.params.id > 0){
    database.pool.query(updateRegrasql,[request.params.id, 
      regra.TIPO_COMISSAO,
      regra.QTDE,
      regra.PERC,
      regra.VALOR,
      regra.PREMIO,
      regra.PERMITE_AVULSO,
      regra.CLASSE,
      regra.APELIDO,
      regra.LEGENDA,
      regra.USA_FAIXA,
      regra.VALOR_MIN,
      regra.VALOR_MAX,
      regra.QTDE_MIN,
      regra.QTDE_MAX,
      regra.PERC_MIN,
      regra.PERC_MAX     
    ],(error, results) => { 
      if (error) {
        console.log(`Ocorreu um ` + error) 
      }
      if (!error) { 
        console.log('Atualizado Regra ID: '+request.params.id)            
        response.status(204).send('Atualizado Regra ID: '+request.params.id)              
      }   
    }) 
  }else{
    console.log('ID para Atualizar nao informado')
    response.status(404).send('ID para Atualizar nao informado') 
  }
}

module.exports = {
  getRegras,
  create,
  updateRegra,
  deleteRegra
  
  }
const database = require('../../../config/database.js') 
 

const getAll = (request, response) => {

  schemaUsuario = request.body.SCHEMA

  sqlVendasLucro = `
  SELECT v.id,
    to_char(v.data::timestamp with time zone, 'DD/MM/YYYY'::text) AS data,
    to_char(v.data::timestamp with time zone, 'MM/YYYY'::text) AS mes,
    vi.cod_produto,
    p.nome,
    vi.qtde,
    vi.valor - vi.desconto AS valor,
    vi.valor - (f.taxa / 100::numeric)::double precision AS valor1,
    vi.custo,
    vi.valor - (f.taxa / 100::numeric)::double precision - vi.custo - vi.desconto AS lucro,
    (vi.valor - (f.taxa / 100::numeric)::double precision - vi.custo - vi.desconto) * 100::double precision / vi.valor AS perc_lucro,
    c.descricao AS categoria,
    f.descricao AS forma_pgto,
    v.tipo_venda
   FROM 
   "`+schemaUsuario+`".vendas v,
   "`+schemaUsuario+`".vendas_itens vi,
   "`+schemaUsuario+`".produtos p,
   "`+schemaUsuario+`".categorias c,
   "`+schemaUsuario+`".formaspagamento f
  WHERE v.id = vi.id AND vi.cod_produto::text = p.codigo_barras::text AND p.categoria = c.id AND v.forma_pgto = f.id;
`
 
  database.pool.query(sqlVendasLucro, (error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error)
    response.status(200).json(results.rows) 
 
  })
}

const getId = (request, response) => {
    const context = {} 
    context.dataIni = (request.body.DATAINI)
    context.dataFim = (request.body.DATAFIM)

    console.log(request.body)

  database.pool.query(`SELECT * FROM mercearia.vendas WHERE DATA >= to_date($1,'dd/mm/yyyy') and DATA <= to_date($2,'dd/mm/yyyy') ` , 
      [context.dataIni,context.dataFim], (error, results) => {
    if (error) {
      response.status(400).send(`Ocorreu um erro ao buscar Registros`)
      throw error
    }
    if (!error){
      response.status(200).json(results.rows)  }
  })?.then(x => x)
}



const create = async (request, response) => { 
  schemaUsuario = request.body.SCHEMA
  let seqVenda = 0
  const SqlSeqVenda= 'SELECT max(id) as qtde FROM "'+schemaUsuario+'".VENDAS' 
  await database.pool.query(SqlSeqVenda).then(x => {seqVenda = x.rows[0]?.qtde + 1})

 

  async function postVenda (){
    schemaUsuario = request.body.SCHEMA
    console.log(`Registrando a venda:  ${seqVenda}`)
    
    const { COD_CLIENTE, COD_ENDERECO,VALOR,DESCONTO,FORMA_PGTO,TIPO_VENDA } = request.body

    const sqlInsertVenda = 'INSERT INTO "'+schemaUsuario+'".VENDAS (id, cod_cliente, cod_endereco, valor, desconto, forma_pgto, tipo_venda) VALUES($1,$2,$3,$4,$5,$6,$7)'
    const parmVenda = [seqVenda,COD_CLIENTE, COD_ENDERECO,VALOR,DESCONTO,FORMA_PGTO,TIPO_VENDA]                          


    database.pool.query(sqlInsertVenda,parmVenda,(error, results) => {
    if (error) {      
    throw error
    }
    if (!error){        
    response.status(201).send(`Venda ID: ${seqVenda} cadastrada com sucesso` ) 
    }   
    })  
  }
  postVenda ()

  function postVendaItens(codItem,qtde, valor,desconto,custo) {
    
    const parmVendaItens = [ seqVenda,codItem,qtde, valor,desconto,custo]
    
    const sqlInsertVendaItens = 'INSERT INTO "'+schemaUsuario+'".vendas_itens (id, cod_produto, qtde, valor, desconto, custo) VALUES($1,$2,$3,$4,$5,$6)'
                                          
  
    database.pool.query(sqlInsertVendaItens,parmVendaItens,(error, results) => {
      if (error) {      
        throw error
      }
      if (!error){  
        console.log(`Itens ${codItem} Cadastrado para a venda ${seqVenda} com Sucesso` ) 
        updateItensQtde(codItem, qtde) 
      }   
    })
  }
  
 async function updateItensQtde(cod_produto,qtde) {    
  
    const sqlUpdateQtdeItens = 'UPDATE "'+schemaUsuario+'".produtos SET qtde_estoque=qtde_estoque - $1 where codigo_barras = $2'
    database.pool.query(sqlUpdateQtdeItens,[qtde,cod_produto],(error, results) => {
      if (error) {      
        throw error
      }
      if (!error){  
        console.log(`Item ${cod_produto} diminuiu ${qtde} do estoque` )        
      }   
    })
  }
 
  request.body.ITENS.map(  x => {
    const itens = Object.assign({}, x);  
    postVendaItens(itens.COD_PRODUTO,itens.QTDE, itens.VALOR, itens.DESCONTO, itens.CUSTO)   
  }) 
}

  

const update= (request, response) => {
  const id = parseInt(request.params.id)  
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query(
    'UPDATE mercearia.vendas SET CATEGORIA = $1, CODIGO_BARRAS = $2,DESCRICAO = $3,FOTO = $4,NOME = $5,SITUACAO = $6,VALOR = $7,VALOR_CUSTO = $8,QTDE_ESTOQUE = $9 WHERE id = $10',
    [CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE,id],
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

  database.pool.query('DELETE FROM mercearia.vendas_itens WHERE id = $1', [id])

  database.pool.query('DELETE FROM mercearia.vendas WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if (!error){
      response.status(200).send(`Vendas modified with ID: ${id}`)
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
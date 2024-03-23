const { Query } = require('pg');
const database = require('../../../config/database.js') 
 
const options = { timeZone: 'America/Sao_Paulo' };
 

function dataFormatada(d){ 
  var data =  new Date(d),
      dia  = data.getDate().toString(),
      diaF = (dia.length == 1) ? '0'+dia : dia,
      mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
      mesF = (mes.length == 1) ? '0'+mes : mes,
      anoF = data.getFullYear();
  return anoF+"/"+mesF+"/"+diaF;
  }

const getAll = (request, response) => {

  schemaUsuario = request.body.SCHEMA

  sqlVendasLucro = `
  select 
  id,
  data,
  mes,
  cod_produto,
  nome,
  qtde,
  valor,
  sum(a.custo) as custo,
  sum(a.valor1 - a.custo) as lucro,
  sum(a.valor1 - a.custo) * 100 / sum(a.valor1) as PERC_lucro,
      categoria, 
      tipo_venda
  from
  (SELECT v.id,
      vp.valor * 100 / v.valor as perc,
      to_char(v.data::timestamp with time zone, 'DD/MM/YYYY'::text) AS data,
      to_char(v.data::timestamp with time zone, 'MM/YYYY'::text) AS mes,
      vi.cod_produto,
      p.nome,
      vi.qtde,
      v.valor as valor_bruto,
      (vi.valor ) - vi.desconto AS valor,
      (vi.valor  - vi.desconto  - (f.taxa / 100::numeric)::double precision) * (vp.valor * 100 / v.valor) /100  AS valor1,
      vi.custo * (vp.valor * 100 / v.valor) /100 as custo,        
      c.descricao AS categoria,
      f.descricao AS forma_pgto,
      v.tipo_venda
     FROM 
     "`+schemaUsuario+`".vendas v, 
     (select vi.id,vi.cod_produto, sum(vi.qtde) qtde, sum(vi.valor) valor, sum(vi.desconto) desconto,sum(vi.custo)custo,vi.id_produto 
     from "`+schemaUsuario+`".vendas_itens vi      
     group by vi.id,vi.cod_produto,vi.qtde,vi.valor,vi.desconto,vi.custo,vi.id_produto) vi,
     "`+schemaUsuario+`".produtos p,
     "`+schemaUsuario+`".categorias c,
     "`+schemaUsuario+`".formaspagamento f,
     "`+schemaUsuario+`".vendas_pagamento vp
    WHERE v.id = vi.id 
    AND vi.cod_produto::text = p.codigo_barras::text 
    AND p.categoria = c.id  
    and to_char(v.data::timestamp with time zone, 'MM/YYYY'::text) = $1
    and v.id = vp.id_venda
    and f.id = vp.cod_forma_pgto   
    
    )  a  
    group by a.id,data,mes ,a.nome, a.qtde,a.cod_produto, categoria, 
      tipo_venda,valor
      order by id desc
`
sqlCorrigeHorario = `update "`+schemaUsuario+`".vendas set data = $1 where data > $1`
  

database.pool.query(sqlCorrigeHorario, [dataFormatada(new Date())],(error, results) => {
  if (error) {
    response.status(500).send(`Ocorreu um ` + error) 
  }
  if (!error){ 
    console.log('sucesso Rotina Ajuste horario')

        database.pool.query(sqlVendasLucro,[request.body.MES], (error, results) => {
      if (error) {
        response.status(500).send(`Ocorreu um ` + error) 
      }
      if (!error){        
        response.status(200).json(results.rows) 
      }     
    })
  }     
})

console.log(request.body.MES)


}




const getId = (request, response) => {
  schemaUsuario = request.body.SCHEMA
    const context = {} 
    context.dataIni = (request.body.DATAINI)
    context.dataFim = (request.body.DATAFIM)

    const arrayVendasPeriodo = []

    console.log(request.body)

    var itensVenda = null

    var queryItensVenda = `
    select v.id,id_produto,qtde 
    from 
    "`+schemaUsuario+`".vendas_itens vi, 
    "`+schemaUsuario+`".vendas v 
    where vi.id = v.id 
    and DATA >= to_date($1,'dd/mm/yyyy') 
    and DATA <= to_date($2,'dd/mm/yyyy')
      `
    /**BUSCAR ITENS DA VENDA */
    database.pool.query(queryItensVenda, [context.dataIni,context.dataFim],(error, results) => { 
    if (error) {
    console.log(error) 
    }

    if (!error){      
    
    itensVenda = results.rows
    } 
    })

  database.pool.query(`  
    SELECT v.id,v.data,vp.valor,vp.cod_forma_pgto as forma_pgto,v.tipo_venda 
    from
    "`+schemaUsuario+`".VENDAS V,
    "`+schemaUsuario+`".vendas_pagamento vp 
    where v.id =vp.id_venda 
    and DATA >= to_date($1,'dd/mm/yyyy') 
    and DATA <= to_date($2,'dd/mm/yyyy')
  ` , 
      [context.dataIni,context.dataFim], (error, results) => {
    if (error) {
      response.status(400).send(`Ocorreu um erro ao buscar Registros`)
      throw error
    }
    if (!error){
      results.rows.map(x => {
        var data = {
          id: x.id,
          data: x.data,
          valor: x.valor,
          forma_pgto: x.forma_pgto,
          tipo_venda: x.tipo_venda,
          itens: itensVenda?.filter(f => f.id == x.id)
        }
        arrayVendasPeriodo.push(data)
      })
      response.status(200).json(arrayVendasPeriodo)  }
  })?.then(x => x)
}

async function updateItensQtdeCancelamento(qtde,id_produto) { 
  
  console.log('id do produto é: ' + id_produto)
    const sqlUpdateQtdeItens = 'UPDATE "'+schemaUsuario+'".produtos SET qtde_estoque=qtde_estoque + $1 where id= $2'
    database.pool.query(sqlUpdateQtdeItens,[qtde,id_produto],(error, results) => {
      if (error) {      
        throw error
        console.log(`Item ID ${id_produto} error` )       
      }
      if (!error){  
        console.log(`Item ID ${id_produto} aumentou ${qtde} do estoque` )        
      }   
    })
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

 
  function postVendaItens(codItem,qtde, valor,desconto,custo,id_produto) {   
    
    const parmVendaItens = [ seqVenda,codItem,qtde, valor,desconto,custo,id_produto]
    
    const sqlInsertVendaItens = 'INSERT INTO "'+schemaUsuario+'".vendas_itens (id, cod_produto, qtde, valor, desconto, custo, id_produto) VALUES($1,$2,$3,$4,$5,$6,$7)'
                                          
  
    database.pool.query(sqlInsertVendaItens,parmVendaItens,(error, results) => {
      if (error) {      
        throw error
      }
      if (!error){  
        console.log(`Itens ${codItem} Cadastrado para a venda ${seqVenda} com Sucesso` ) 
        updateItensQtde(qtde,id_produto) 
      }   
    })
  }
  
 async function updateItensQtde(qtde,id_produto) { 
  
  console.log('id do produto é: ' + id_produto)
    const sqlUpdateQtdeItens = 'UPDATE "'+schemaUsuario+'".produtos SET qtde_estoque=qtde_estoque - $1 where id= $2'
    database.pool.query(sqlUpdateQtdeItens,[qtde,id_produto],(error, results) => {
      if (error) {      
        throw error
        console.log(`Item ID ${id_produto} error` )       
      }
      if (!error){  
        console.log(`Item ID ${id_produto} diminuiu ${qtde} do estoque` )        
      }   
    })
  }


 //console.log(request.body.ITENS)

 async function postFormaPgto(id_venda,valor,cod_forma_pgto) { 
  
  console.log('id venda é: ' + id_venda +' formaPGTO: '+cod_forma_pgto+' valor: '+valor)
    const sqlUpdateQtdeItens = 'insert into"'+schemaUsuario+'".vendas_pagamento  (id_venda,valor,cod_forma_pgto) VALUES ($1,$2,$3)'
    database.pool.query(sqlUpdateQtdeItens,[id_venda,valor,cod_forma_pgto],(error, results) => {
      if (error) {      
        throw error
        console.log(`erro Pgto venda ID ${id_venda} error`+' formapgto: '+cod_forma_pgto )       
      }
      if (!error){  
        console.log('Gravando Pagamento vendaID é: ' + id_venda +' formaPGTO: '+cod_forma_pgto+' valor: '+valor)     
      }   
    })
  }

  request.body.ITENS.map(  x => {
    const itens = Object.assign({}, x);  
    postVendaItens(itens.COD_PRODUTO,itens.QTDE, itens.VALOR, itens.DESCONTO, itens.CUSTO,itens.ID_PRODUTO)
  }) 

  request.body.PGTO.map(x => {
    const pgto = Object.assign({}, x);  
    console.log(pgto)
    postFormaPgto(seqVenda,pgto.valor,pgto.cod_forma_pgto)
  }) 

}
  

const update= (request, response) => {
  schemaUsuario = request.body.SCHEMA
  const id = parseInt(request.params.id)  
  const { CATEGORIA, CODIGO_BARRAS,DESCRICAO,FOTO,NOME,SITUACAO,VALOR,VALOR_CUSTO,QTDE_ESTOQUE } = request.body

  database.pool.query(
    'UPDATE "'+schemaUsuario+'".vendas SET CATEGORIA = $1, CODIGO_BARRAS = $2,DESCRICAO = $3,FOTO = $4,NOME = $5,SITUACAO = $6,VALOR = $7,VALOR_CUSTO = $8,QTDE_ESTOQUE = $9 WHERE id = $10',
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
  schemaUsuario = request.body.SCHEMA
  const id = request.body.ID
  const ITENS = request.body.ITENS

  database.pool.query('DELETE FROM "'+schemaUsuario+'".vendas_itens WHERE id = $1', [id])
  database.pool.query('DELETE FROM "'+schemaUsuario+'".vendas_pagamento WHERE id_venda = $1', [id])

  database.pool.query('DELETE FROM "'+schemaUsuario+'".vendas WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if (!error){
     console.log(request.body.ITENS)
      if(request.body.ITENS){
        request.body.ITENS.map(  x => {
          const itens = Object.assign({}, x);  
          updateItensQtdeCancelamento(itens.qtde,itens.id_produto)
        }) 
      }
      
    

      response.status(200).send(` Delete Venda with ID: ${id}`)
    
    }     
  })
}

function somaValor(array) { 
  var arr =  array     
  var sum = 0; 
  for(var i =0;i<arr.length;i++){ 
    sum+=arr[i]; 
  }     
  return arredonda(sum,2)
}

module.exports = {
  getAll,
  getId,
  create,
  update,
  deleteId,
}
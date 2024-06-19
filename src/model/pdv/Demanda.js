const database = require('../../../config/database.js') 


const get = (request, response) => {
  schemaUsuario = request.body.SCHEMA
queryDemanda = 
` 
  select * from (
    select 
      p.nome, 
      p.id,
      p.codigo_barras,
      p.qtde_estoque,
      sum(vi.qtde) as qtde_vendas,
      CASE   
      WHEN p.qtde_estoque < 1 then 'ITENS-ZERADOS'
      ELSE  'PROXIMO-ACABAR'
      END  
      as TIPO
    from 
    "`+schemaUsuario+`".vendas v,
    "`+schemaUsuario+`".vendas_itens vi,
    "`+schemaUsuario+`".produtos   p,
    "`+schemaUsuario+`".categorias c
    where 
      v.id = vi.id 
    and v."data" > 	(CURRENT_DATE - 30)
    AND v.tipo_venda = 'NORMAL'
    and vi.id_produto = p.id 
    and p.categoria  = c.id 	 
    and c.descricao <> 'Servicos'  
    and p.situacao ='ATIVADO'
    group by p.nome,p.id,p.codigo_barras ,p.qtde_estoque )
    where qtde_estoque <= qtde_vendas / 3  
`


  database.pool.query(queryDemanda, (error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um ` + error) 
    }
    if (!error)
    response.status(200).json(results.rows)
  })
}
  

module.exports = {
  get
}
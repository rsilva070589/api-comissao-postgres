const database = require('../../../config/database.js') 


const get = (request, response) => {
  schemaUsuario = request.body.SCHEMA
queryDemanda = 
`
SELECT p.codigo_barras,
    p.nome,
    p.qtde_estoque,
    ( SELECT sum(vi.qtde) AS qtde_vendas
           FROM "`+schemaUsuario+`".vendas v,
           "`+schemaUsuario+`".vendas_itens vi
          WHERE v.id = vi.id AND v.data > (CURRENT_DATE - 30) AND v.tipo_venda::text = 'NORMAL'::text AND vi.cod_produto::text = p.codigo_barras::text
          GROUP BY vi.cod_produto) AS qtde_vendas,
    'PROXIMO-ACABAR'::text AS tipo
   FROM "`+schemaUsuario+`".produtos p
  WHERE p.qtde_estoque > 0 AND p.qtde_estoque < (( SELECT sum(vi.qtde) / 3 AS qtde_vendas
           FROM "`+schemaUsuario+`".vendas v,
           "`+schemaUsuario+`".vendas_itens vi
          WHERE v.id = vi.id AND v.data > (CURRENT_DATE - 30) AND vi.cod_produto::text = p.codigo_barras::text AND v.tipo_venda::text = 'NORMAL'::text
          GROUP BY vi.cod_produto)) AND (p.situacao::text = ANY (ARRAY['ATIVADO'::character varying::text, 'ATIVO'::character varying::text])) AND (p.codigo_barras::text IN ( SELECT vi.cod_produto
           FROM "`+schemaUsuario+`".vendas v,
           "`+schemaUsuario+`".vendas_itens vi
          WHERE v.id = vi.id AND v.tipo_venda::text = 'NORMAL'::text AND v.data > (CURRENT_DATE - 30))) AND NOT (p.codigo_barras::text IN ( SELECT p2.codigo_barras
           FROM "`+schemaUsuario+`".produtos p2
          WHERE p2.codigo_barras::text ~~ 'PIX%'::text))

  union all
  
  SELECT p.codigo_barras,
  p.nome,
  p.qtde_estoque,
  ( SELECT sum(vi.qtde) AS qtde_vendas
         FROM "`+schemaUsuario+`".vendas v,
         "`+schemaUsuario+`".vendas_itens vi
        WHERE v.id = vi.id AND v.data > (CURRENT_DATE - 30) AND v.tipo_venda::text = 'NORMAL'::text AND vi.cod_produto::text = p.codigo_barras::text
        GROUP BY vi.cod_produto) AS qtde_vendas,
  'ITENS-ZERADOS'::text AS tipo
 FROM "`+schemaUsuario+`".produtos p
WHERE p.qtde_estoque < 1 AND (p.situacao::text = ANY (ARRAY['ATIVADO'::character varying, 'ATIVO'::character varying]::text[])) AND (p.codigo_barras::text IN ( SELECT vi.cod_produto
         FROM "`+schemaUsuario+`".vendas v,
         "`+schemaUsuario+`".vendas_itens vi
        WHERE v.id = vi.id AND v.data > (CURRENT_DATE - 30) AND v.tipo_venda::text = 'NORMAL'::text)) AND NOT (p.codigo_barras::text IN ( SELECT p2.codigo_barras
         FROM "`+schemaUsuario+`".produtos p2
        WHERE p2.codigo_barras::text ~~ 'PIX%'::text))
ORDER BY 2;
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
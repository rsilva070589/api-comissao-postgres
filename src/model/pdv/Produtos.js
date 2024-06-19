const database = require('../../../config/database.js');
require('dotenv').config();

const getAll = (request, response) => {
  const schemaUsuario = request.body.SCHEMA;

  const queryProdutos = `
    SELECT 
      c.descricao AS categoria, 
      c.id AS id_categoria, 
      p.codigo_barras, 
      p.descricao, 
      p.foto, 
      p.nome, 
      p.situacao, 
      p.valor, 
      p.valor_custo, 
      p.qtde_estoque, 
      p.id,
      p.COD_FORNECEDOR,
      f.descricao AS fornecedor 
    FROM "${schemaUsuario}".produtos p
    JOIN "${schemaUsuario}".categorias c ON p.categoria = c.id
    JOIN "${schemaUsuario}".fornecedores f ON p.cod_fornecedor = f.cod_fornecedor`;

  database.pool.query(queryProdutos, (error, results) => {
    if (error) {
      response.status(500).send(`Ocorreu um erro: ${error}`);
      return;
    }
    response.status(200).json(results.rows);
  });
}

const getId = (request, response) => {
  const id = parseInt(request.params.id);
  const schemaUsuario = request.body.SCHEMA;

  const query = `SELECT * FROM "${schemaUsuario}".vwprodutos WHERE id = $1`;
  
  database.pool.query(query, [id], (error, results) => {
    if (error) {
      response.status(400).send('Ocorreu um erro ao buscar registros');
      return;
    }
    response.status(200).json(results.rows);
  });
}

const create = (request, response) => {
  const schemaUsuario = request.body.SCHEMA;
  const { CATEGORIA, CODIGO_BARRAS, DESCRICAO, FOTO, NOME, SITUACAO, VALOR, VALOR_CUSTO, QTDE_ESTOQUE, COD_FORNECEDOR } = request.body;

  const query = `
    INSERT INTO "${schemaUsuario}".produtos 
    (CATEGORIA, CODIGO_BARRAS, DESCRICAO, FOTO, NOME, SITUACAO, VALOR, VALOR_CUSTO, QTDE_ESTOQUE, COD_FORNECEDOR) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *`;

  database.pool.query(query, [CATEGORIA, CODIGO_BARRAS, DESCRICAO, FOTO, NOME, SITUACAO, VALOR, VALOR_CUSTO, QTDE_ESTOQUE, COD_FORNECEDOR], (error, results) => {
    if (error) {
      response.status(500).send(`Erro ao cadastrar produto: ${error}`);
      return;
    }
    response.status(201).send(`Produto cadastrado: ${results.rows[0].codigo_barras}`);
  });
}

const update = (request, response) => {
  const schemaUsuario = request.body.SCHEMA;
  const id = parseInt(request.body.ID);
  const { CATEGORIA, CODIGO_BARRAS, DESCRICAO, FOTO, NOME, SITUACAO, VALOR, VALOR_CUSTO, QTDE_ESTOQUE, COD_FORNECEDOR } = request.body;

  const query = `
    UPDATE "${schemaUsuario}".produtos 
    SET CATEGORIA = $1, CODIGO_BARRAS = $2, DESCRICAO = $3, FOTO = $4, NOME = $5, SITUACAO = $6, VALOR = $7, VALOR_CUSTO = $8, QTDE_ESTOQUE = $9, COD_FORNECEDOR = $10 
    WHERE id = $11`;

  database.pool.query(query, [CATEGORIA, CODIGO_BARRAS, DESCRICAO, FOTO, NOME, SITUACAO, VALOR, VALOR_CUSTO, QTDE_ESTOQUE, COD_FORNECEDOR, id], (error, results) => {
    if (error) {
      response.status(400).send(`Erro ao atualizar o ID: ${id}`);
      return;
    }
    response.status(200).send(`Produto atualizado com ID: ${id}`);
  });
}

const deleteId = (request, response) => {
  const schemaUsuario = request.body.SCHEMA;
  const id = parseInt(request.body.id);

  const query = `DELETE FROM "${schemaUsuario}".produtos WHERE id = $1`;

  database.pool.query(query, [id], (error, results) => {
    if (error) {
      response.status(500).send(`Erro ao deletar o ID: ${id}`);
      return;
    }
    response.status(200).send(`Produto deletado com ID: ${id}`);
  });
}

module.exports = {
  getAll,
  getId,
  create,
  update,
  deleteId,
};

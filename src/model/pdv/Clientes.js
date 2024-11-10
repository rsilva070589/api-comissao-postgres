const database = require('../../../config/database.js');
require('dotenv').config();

 

 

// Função para obter todos os clientes
const getClientes = async (request, response) => {
  const cod_cliente = request.params.id;
  const schemaUsuario = request.body.SCHEMA
  let query = 'SELECT * FROM "' + schemaUsuario + '".clientes';

  // Adiciona a cláusula WHERE caso `cod_cliente` seja fornecido
  if (cod_cliente) {
    query += ' WHERE "cod_cliente" = $1 ORDER BY "nome" ASC';
  } else {
    query += ' ORDER BY "nome" ASC';
  }

  // Executa a consulta com o parâmetro, se `cod_cliente` estiver definido
  const values = cod_cliente ? [cod_cliente] : [];

  if (schemaUsuario && query) {
    database.pool.query(query, values, (error, results) => {
      if (error) {
        return response.status(500).send(`Ocorreu um erro: ${error}`);
      }
      response.status(200).json(results.rows);
    });
  } else {
    response.status(500).send("Schema não definido");
  }
};

 
// Função para criar um cliente
const createCliente = (request, response) => {
  const schemaUsuario = request.body.SCHEMA
  const {
    cod_cliente,
    nome,
    data_nasc,
    ddd1,
    celular1,
    ddd2,
    celular2,
    email,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
  } = request.body;

  const query =
    'INSERT INTO "' +
    schemaUsuario +
    '".clientes ("cod_cliente","nome", "data_nasc", "ddd1", "celular1", "ddd2", "celular2", "email", "cep", "rua", "numero", "complemento", "bairro", "cidade", "estado") ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *';

  database.pool.query(
    query,
    [cod_cliente, nome, data_nasc, ddd1, celular1, ddd2, celular2, email, cep, rua, numero, complemento, bairro, cidade, estado],
    (error, results) => {
      if (error) {
        return response.status(500).send(`Erro ao criar cliente: ${error}`);
      }
      response.status(201).send(`Cliente cadastrado com sucesso: ${results.rows[0].cod_cliente}`);
    }
  );
};
 
// Função para atualizar um cliente
const updateCliente = (request, response) => {

  console.log(request.body.SCHEMA)

  const schemaUsuario = request.body.SCHEMA
  const {    
    cod_cliente,
    nome,
    data_nasc,
    ddd1,
    celular1,
    ddd2,
    celular2,
    email,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
  } = request.body;

  const query =
    'UPDATE "' +    schemaUsuario + '".clientes ' +
    'SET "nome" = $2, "data_nasc" = $3, "ddd1" = $4, "celular1" = $5, "ddd2" = $6, "celular2" = $7, "email" = $8, ' +
    '"cep" = $9, "rua" = $10, "numero" = $11, "complemento" = $12, "bairro" = $13, "cidade" = $14, "estado" = $15 ' +
    'WHERE "cod_cliente" = $1 RETURNING *';

  database.pool.query(
    query,
    [cod_cliente, nome, data_nasc, ddd1, celular1, ddd2, celular2, email, cep, rua, numero, complemento, bairro, cidade, estado],
    (error, results) => {
      if (error) {
        console.error('Erro ao executar query: ', error); // Log detalhado do erro
        return response.status(500).send(`Erro ao atualizar cliente: ${error}`);
      }
      if (results.rows.length > 0) {
        response.status(200).send(`Cliente atualizado com sucesso: ${results.rows[0].cod_cliente}`);
      } else {
        response.status(404).send('Cliente não encontrado para atualização.');
      }
    }
  );
};

 
// Função para deletar um cliente
const deleteCliente = (request, response) => {
  const schemaUsuario = request.body.SCHEMA
  const { SCHEMA, cod_cliente } = request.body; // Usando SCHEMA enviado no corpo da requisição

  
  const query = 'DELETE FROM "' + schemaUsuario + '".clientes WHERE "cod_cliente" = $1 RETURNING *'; // A query agora retorna o cliente deletado

  database.pool.query(query, [cod_cliente], (error, results) => {
    if (error) {
      console.error('Erro ao executar query: ', error); // Log detalhado do erro
      return response.status(500).send(`Erro ao deletar cliente: ${error}`);
    }
    if (results.rows.length > 0) {
      response.status(200).send(`Cliente com cod_cliente ${cod_cliente} deletado com sucesso`);
    } else {
      response.status(404).send(`Cliente com cod_cliente ${cod_cliente} não encontrado`);
    }
  });
};


module.exports = {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
};

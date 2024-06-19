const database = require('../../config/database.js');
const bcrypt = require('bcrypt');

const getLogin = async (request, response) => {
  const { USUARIO: usuario, SCHEMA: schema, SENHA: senha } = request.body;

  try {
    const queryAcesso = `
      SELECT cod_acesso
      FROM agiltec.usuario_acesso
      WHERE schema = $1
      AND username = $2
    `;

    const queryLogin = `
    SELECT 
      e.nomefantasia,
      e.cod_cliente,
      e.schema,
      eu.username,
      eu.senha,
      eu.cod_funcao,
      eu.nome,
      fc.funcao
    FROM agiltec.empresas e
    JOIN agiltec.empresa_usuarios eu ON e."schema" = eu."schema"
    JOIN agiltec.empresa_funcoes fc ON eu.cod_funcao = fc.cod_funcao
    WHERE eu.username = $1
    AND e.schema = $2
  `;


    const accessResults = await database.pool.query(queryAcesso, [schema, usuario]);
 
    const acessos_usuario = accessResults.rows;

   
    const loginResults = await database.pool.query(queryLogin, [usuario, schema]);
    if (loginResults.rows.length < 1) {
      return response.status(200).json({ login: 'usuario nao existe' });
    }

    const user = loginResults.rows[0];
   
 
    if (senha == user.senha) {
      const dadosLogin = {
        nomefantasia: user.nomefantasia,
        nome: user.nome,
        cod_cliente: user.cod_cliente,
        schema: user.schema,
        username: user.username,
        funcao: user.funcao,
        login: true,
        acessos: acessos_usuario,
      };

      return response.status(200).json(dadosLogin);
    } else {
      return response.status(200).json({ login: false });
    }
  } catch (error) {
    console.error('Error during login process:', error);
    return response.status(500).send('Ocorreu um erro durante o processo de login.');
  }
};

module.exports = {
  getLogin
};

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const usuarios = require('./src/model/Usuarios') 
const acesso   = require('./src/model/Acesso') 
const meta     = require('./src/model/integracaoMeta') 
const venda    = require('./src/model/integracaoVendas') 
const port = 4141
var cors = require('cors');

app.use(bodyParser.json()).use(cors())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/meta', (request, response) => { response.json({ info: 'Atualização de Meta Ativa' })})
app.post('/meta', meta.integraMeta)

app.get('/vendas', (request, response) => { response.json({ info: 'Atualização de Vendas Ativa' })})
app.post('/vendas', venda.integraVenda) 

app.get('/acesso/:id', acesso.getLogin)

app.get('/usuarios/:id', usuarios.getUsers)
 
app.post('/usuarios', usuarios.createUser)
app.put('/usuarios/:id', usuarios.updateUser)
app.delete('/usuarios/:id', usuarios.deleteUser)
 

console.log('pagina index' +acesso.usuarioLogado)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

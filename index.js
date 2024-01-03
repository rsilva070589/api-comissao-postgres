const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const usuarios = require('./src/model/Usuarios') 
const acesso   = require('./src/model/Acesso') 
const funcao    = require('./src/model/Funcoes') 
const empresa    = require('./src/model/Empresas')
const regra    = require('./src/model/RegraComissao')
const comissao    = require('./src/model/Comissao')
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

app.get('/usuarios', usuarios.getUsers)  
app.get('/usuarios/:id', usuarios.getUsers)   
app.post('/usuarios', usuarios.createUser)
app.put('/usuarios', usuarios.updateUser)
app.delete('/usuarios', usuarios.deleteUser)

app.get('/funcoes', funcao.getFuncoes)

app.get('/empresas', empresa.getEmpresas)
 
app.get('/regracomissao', regra.getRegras)
app.post('/regracomissao', regra.create)
app.put('/regracomissao/:id', regra.updateRegra)
app.delete('/regracomissao/:id', regra.deleteRegra)

app.post('/comissao', comissao.find)
 
app.get('/acesso/:id', acesso.getLogin)


app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

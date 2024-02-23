const express = require('express')
const https = require('https')
const fs = require('fs')

const bodyParser = require('body-parser')
const app         = express()
const usuarios  =  require('./src/model/Usuarios') 
const acesso    = require('./src/model/Acesso') 
const funcao    = require('./src/model/Funcoes') 
const empresa    = require('./src/model/Empresas')
const regra    = require('./src/model/RegraComissao')
const comissao    = require('./src/model/Comissao')

const Produtos       = require('./src/model/pdv/Produtos') 
const formaspagamento = require('./src/model/pdv/FormasPagamento') 
const categorias = require('./src/model/pdv/Categorias') 
const vendas = require('./src/model/pdv/Vendas') 
const demanda = require('./src/model/pdv/Demanda') 


const port = 4141
var cors = require('cors');

app.use(bodyParser.json()).use(cors())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

console.log(process.env.DB_HOST)


app.get('/', (request, response) => { 
  response.send({ result: 'Bem Vindo a Api Postgres'}) 
})


app.post('/demanda', demanda.get)

app.post('/getProdutos', Produtos.getAll)  
app.get('/Produtos/:id', Produtos.getId)   
app.post('/Produtos', Produtos.create)
app.put('/Produtos', Produtos.update)
app.delete('/Produtos', Produtos.deleteId)


app.post('/GetFormapagamento', formaspagamento.getAll)  
app.get('/formapagamento/:id', formaspagamento.getId)   
app.post('/formapagamento', formaspagamento.create)
app.put('/formapagamento', formaspagamento.update)
app.delete('/formapagamento', formaspagamento.deleteId)

app.post('/getCategorias', categorias.getAll)   
app.post('/categorias', categorias.create)
app.put('/categorias', categorias.update)
app.delete('/categorias', categorias.deleteId)

app.post('/relvendas', vendas.getAll)  
app.get('/vendas/:id', vendas.getId)   
app.post('/vendas', vendas.create)
app.put('/vendas', vendas.update)
app.delete('/vendas', vendas.deleteId)
app.post('/periodovendas', vendas.getId)

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
 
app.post('/acesso', acesso.getLogin)


//app.listen(port, () => {  console.log(`App running on port ${port}.`)})

 
https.createServer({
  key: fs.readFileSync('certificado/private.key'),
  cert: fs.readFileSync('certificado/certificate.crt')
}, app).listen(port, () => {  console.log(`App running on port ${port}.`)})
 


/** 
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
*/
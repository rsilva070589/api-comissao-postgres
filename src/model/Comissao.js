const database = require('../../config/database.js') 

require('dotenv').config()
let schemaUsuario =  process.env.DB_DATABASE_SCHEMA
var arrayUsuarios = []
var arrayRegras   = []
var arrayRegrasAux = []
var arrayVendaLista = []
var arrayVendaGroup = [] 
var metaGet   = []
var regrasComissaoFinal = []
var arrayComissao = []

async function getUsuarios(body,response) {
  arrayUsuarios = []
  const query = 'SELECT * FROM "' +schemaUsuario+'".usuarios where "NOME" = $1 and "MES" = $2' 
  database.pool.query(query,[body.NOME,body.MES],(error, results) => { 
    if (error) {
      console.log(`Ocorreu um ` + error) 
    }
    if (!error) { 
      results.rows.map(x => {
        arrayUsuarios.push(x)
      })  
      getRegrasAux(body,response)   
      getRegras(body,response)  
      
    }   
  }) 
}

async function getRegras(body,response){
  arrayRegras = []
  const query = 'SELECT * FROM "' +schemaUsuario+'".comissoes_faixa where  "MES" = $1' 
  database.pool.query(query,[body.MES],(error, results) => { 
    if (error) {
      console.log(`erro ao buscar regras:  ` + error) 
    }
    if (!error) { 
      results.rows.map(x => {
        arrayRegras.push(x)
      })  
      
      getVendas(body,response)     
     // response.status(200).json(arrayRegras)
    }   
  }) 
}

async function getRegrasAux(body,response){
  arrayRegras = []
  const query = 'SELECT * FROM "' +schemaUsuario+'".comissoes_faixa_aux where  "MES" = $1' 
  database.pool.query(query,[body.MES],(error, results) => { 
    if (error) {
      console.log(`erro ao buscar regras Auxiliar:  ` + error) 
    }
    if (!error) { 
      results.rows.map(x => {
        arrayRegrasAux.push(x)
      })        
    }   
  }) 
}

async function getMeta(context,response) {  
  metaGet = []
  const baseQueryFechada = 'select * FROM "' +schemaUsuario+'".VW_META_VENDAS_FECHADA where 1=1';
  
  let query = null
      query = baseQueryFechada  
  const binds = []; 

  if (context.MES) { 
    binds.push(context.MES); 
    query += ' and  "MES_VENDA" = $'+binds.length;
  }

  if (context.NOME && !context.COLABORADOR) { 
    binds.push(context.NOME); 
    query += ' and  "VENDEDOR" = $'+binds.length;
  }

  if (context.COD_EMPRESA) { 
    binds.push(context.COD_EMPRESA); 
    query += ' and  "COD_EMPRESA_VENDEDORA" = $'+binds.length;
  }
 
 database.pool.query(query,binds,(error, results) => { 
  if (error) {
    console.log(`Ocorreu um ` + error) 
  }
  if (!error) {   
    results.rows.map(x => { 
      metaGet.push(x)      
    })  
    console.log('linhas das metaGet => '+metaGet.length)
    processaCalculo(context,response)
  }   
})  
 // console.log('Meta - numero de linhas retorno é: '+metaGet.length) 
}

async function getVendas(context,response) { 
  
  context.COD_FUNCAO = arrayUsuarios[0].COD_FUNCAO
  //console.log(arrayUsuarios[0].GESTOR)

  if (arrayUsuarios[0].GESTOR > 0){
    context.COD_EMPRESA = arrayUsuarios[0].GESTOR
    context.COLABORADOR = context.NOME
  }

  if (arrayUsuarios[0].GESTOR == 'M'){
    context.MARCA = arrayUsuarios[0].MARCA
    context.COLABORADOR = context.NOME
  } 
  

  console.log(context)
 
  const baseQueryFechada =  'select * FROM "' +schemaUsuario+'"."vw_comissao_encerrada"    where 1=1 ';  
  let query = baseQueryFechada; 
  let binds = []

  if (context.MES)         {  binds.push(context.MES); query += ` and  "MES_VENDA" = $`+binds.length;  }
  if (context.COD_EMPRESA) {  binds.push(context.COD_EMPRESA); query += ` and "COD_EMPRESA_VENDEDORA" = $`+binds.length;  }
  if (context.MARCA)       {  binds.push(context.MARCA); query += ` and "MARCA" = $`+binds.length;  }
  if (context.SETOR)       {  binds.push(context.SETOR); query += ` and  "MARCA" = $`+binds.length;  }
  if (context.NOME && !context.COLABORADOR )  {  binds.push(context.NOME) ;  query += ` and  "VENDEDOR" = $`+binds.length;  }
  if (context.PERIODO_INI) {  binds.push(context.PERIODO_INI); query += ` and  "DATA_VENDA" >= $`+binds.length;  }
  if (context.PERIODO_FIM) {  binds.push(context.PERIODO_FIM); query += ` and  "DATA_VENDA" <= $`+binds.length;  }
 
  const baseQueryGroupFechada = 'select "COD_EMPRESA_VENDEDORA","VENDEDOR","MES_VENDA","MARCA","TIPO",SUM("TOTAL_VENDA") as TOTAL_VENDA, SUM("DESPESAS") as DESPESAS,SUM("GANHOS") as GANHOS,(COUNT(*)) AS QTDE FROM "' +schemaUsuario+'".vw_comissao_encerrada x where 1 = 1  ';
  let queryGroup = baseQueryGroupFechada
  let bindsGroup = []  

  if (context.MES)          { bindsGroup.push(context.MES);         queryGroup += ` and  "MES_VENDA" =  $`+bindsGroup.length;  }
  if (context.COD_EMPRESA)  { bindsGroup.push(context.COD_EMPRESA); queryGroup += ` and  "COD_EMPRESA_VENDEDORA" = $`+bindsGroup.length;  }
  if (context.MARCA)        { bindsGroup.push(context.MARCA);       queryGroup += ` and  "MARCA" = $`+bindsGroup.length;  }
  if (context.SETOR)        { bindsGroup.push(context.SETOR);       queryGroup += ` and "MARCA" = $`+bindsGroup.length;  }
  if (context.NOME && !context.COLABORADOR)  { bindsGroup.push(context.NOME);        queryGroup += ` and "VENDEDOR" = $`+bindsGroup.length;  }
  if (context.PERIODO_INI)  { bindsGroup.push(context.PERIODO_INI); queryGroup += ` and "DATA_VENDA" >= $`+bindsGroup.length;  }
  if (context.PERIODO_FIM)  { bindsGroup.push(context.PERIODO_FIM); queryGroup += ` and "DATA_VENDA" <= $`+bindsGroup.length;  }

  queryGroup += `\ group by "COD_EMPRESA_VENDEDORA","VENDEDOR","MES_VENDA","MARCA","TIPO"`;
   


      function getVendasLista() {
        arrayVendaLista = []
        database.pool.query(query,binds,(error, results) => {  
          console.log(query)
          console.log(binds)
          
          if (error) {
            console.log(`Ocorreu um ` + error) 
          }
          if (!error) {  
            results.rows.map(x => {
              const vendasLista = {
                "TIPO": x.TIPO,
                "COD_EMPRESA": x.COD_EMPRESA,
                "COD_EMPRESA_VENDEDORA": x.COD_EMPRESA_VENDEDORA,
                "MARCA": x.MARCA,
                "DATA_VENDA": dataAtualFormatada(x.DATA_VENDA),
                "MES_VENDA": x.MES_VENDA,
                "COD_CLIENTE": x.COD_CLIENTE,
                "NOME_CLIENTE": x.NOME_CLIENTE,
                "CHASSI": x.CHASSI,
                "NOVO_USADO": x.NOVO_USADO,
                "DESCRICAO_MODELO": x.DESCRICAO_MODELO,
                "ANO_MODELO": x.ANO_MODELO,
                "COD_PROPOSTA": x.COD_PROPOSTA,
                "VENDEDOR": x.VENDEDOR,
                "TOTAL_VENDA": arredonda(x.TOTAL_VENDA,2), 
                "MARGEM_VENDA": x.MARGEM_VENDA,
                "DESPESAS": x.DESPESAS,
                "GANHOS":   x.GANHOS
              }
              arrayVendaLista.push(vendasLista) })  
              getVendasGroup()  
          }   
        })
      }

      
      function getVendasGroup(){
        arrayVendaGroup = []
        database.pool.query(queryGroup,bindsGroup,(error, results) => { 
          if (error) {
            console.log(`Ocorreu um ` + error) 
          }
          if (!error) {  
            results.rows.map(x => {
              const vendasLista = {
                "TIPO": x.TIPO,       
                "COD_EMPRESA_VENDEDORA": x.COD_EMPRESA_VENDEDORA,
                "MARCA": x.MARCA, 
                "MES_VENDA": x.MES_VENDA,    
                "VENDEDOR": x.VENDEDOR,
                "TOTAL_VENDA": x.total_venda,
                "QTDE": x.qtde,
                "DESPESAS": x.despesas,
                "GANHOS": x.ganhos,
                "ANALITICO": arrayVendaLista.filter(f => f.TIPO == x.TIPO)
              } 
              arrayVendaGroup.push(vendasLista)  
            })
            getMeta(context,response)
            //console.log(arrayUsuarios)
          }   
        }) 
      
      }


  getVendasLista()
 
   
  function dataAtualFormatada(dataFormat){
    var data = dataFormat,
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return diaF+"/"+mesF+"/"+anoF;
  }

  var arredonda = function(numero, casasDecimais) {
    casasDecimais = typeof casasDecimais !== 'undefined' ?  casasDecimais : 2;
    return +(Math.floor(numero + ('e+' + casasDecimais)) + ('e-' + casasDecimais));
  };
  
    
}

async function processaCalculo(context,response) {   
  let schemaUsuario =  process.env.DB_DATABASE_SCHEMA
 
 
   arrayComissao = []

 usuario  = arrayUsuarios.filter(f=> f.NOME == context.NOME).map(x => x)[0]
 
  const meta =  metaGet.filter(f=> f.VENDEDOR==usuario?.NOME)
 // console.log(meta)

  if (!usuario?.NOME){
       usuario  = arrayUsuarios.filter(f=> f.NOME == context.NOME).map(x => x)[0]
      }

      if (usuario?.NOME){
        
        if(usuario.GESTOR == 'N'){
        
            comissaoFaixa(arrayVendaGroup,usuario,context.MES, meta,arrayRegras).map(x => x.TIPO_COMISSAO).map(tipoComissao => {
            comissaoColaboradores(arrayVendaGroup,tipoComissao,usuario,context.MES,meta,arrayRegras).map(x => {arrayComissao.push(x)}) 
            })
        }
        else{
          
          comissaoSupervisor(arrayVendaGroup,context.MES, usuario,meta,arrayRegras).map(x => {arrayComissao.push(x)}) 
        }         
         
       }else{
        arrayComissao.push({erro: 'usuario nao encontrado'})
      }

 
  response.status(200).json(arrayComissao)
} 

function somaVendaAcessorio(arrayVendas,usuario,mes) { 
  return 10000
}

var arredonda = function(numero, casasDecimais) {
  casasDecimais = typeof casasDecimais !== 'undefined' ?  casasDecimais : 0;
  return +(Math.floor(numero + ('e+' + casasDecimais)) + ('e-' + casasDecimais));
};

function somaValor(array) { 
  var arr =  array     
  var sum = 0; 
  for(var i =0;i<arr.length;i++){ 
    sum+=arr[i]; 
  }     
  return arredonda(sum,2)
}

function somaValorInteiro(array) { 
  var arr =  array 
 // console.log(array)    
  var sum = 0; 
  for(var i =0;i<arr.length;i++){ 
    sum+=arr[i]; 
    
  }     
  return sum
}

function comissaoFaixa(arrayVendas,usuario,mes,meta,arrayRegras) { 
  // console.log('inicio Funcao comissaoFINAL') 
  console.log(meta)
  
  function metaVendedor(tipo) {
    let metaVendedor = 0
    if (metaVendedor = meta.filter(fm => fm.TIPO == tipo).map(x => x.QTDE)[0]){
      metaVendedor   = meta.filter(fm => fm.TIPO == tipo).map(x => x.QTDE)[0]
    }else{
      metaVendedor   = meta.filter(fm => fm.TIPO == 'META-VENDAS').map(x => x.QTDE)[0] 
    }
   return metaVendedor
   }
  
 
   if (1) { 
    regrasComissaoFinal = []
     arrayRegras.filter(   f =>   f.USA_FAIXA == 'S' 
                               && f.MES == mes
                               && f.COD_EMPRESA == usuario.COD_EMPRESA
                               && f.COD_FUNCAO ==  usuario.COD_FUNCAO
                               &&  metaVendedor(f.TIPO_COMISSAO) >=  f.QTDE_MIN 
                               &&  metaVendedor(f.TIPO_COMISSAO) <= f.QTDE_MAX 
                               &&  f.MEDIA_ACESSORIOS_MIN == null
                               &&  f.VALOR_MIN == null
                               &&  f.QTDE_MIN > 0 
                                                    
               ).map(x => {
                   console.log('Bloco-1: '+x.TIPO_COMISSAO +' META: ' + ' TIPO-PREMIO: '+ x.PREMIO)
                       regrasComissaoFinal.push(x)
                                     })
 
                 arrayRegras.filter(f =>     f.USA_FAIXA == 'S' 
                                 && f.MES == mes
                                 && f.COD_EMPRESA == usuario.COD_EMPRESA
                                 && f.COD_FUNCAO ==  usuario.COD_FUNCAO
                                 &&  somaVendaAcessorio(arrayVendas,usuario,mes) >= f.MEDIA_ACESSORIOS_MIN
                                 &&  somaVendaAcessorio(arrayVendas,usuario,mes) <  f.MEDIA_ACESSORIOS_MAX
                                 &&  f.MEDIA_ACESSORIOS_MIN > 0 
                                 &&  f.VALOR_MIN == null
                                           ).map(x => {
                                             console.log('Bloco-2: '+x.TIPO_COMISSAO)
                                             regrasComissaoFinal.push(x)
                                             }) 
 
  
               arrayRegras.filter(f =>    f.USA_FAIXA == 'S'  
                                       && f.MES == mes
                                       && f.COD_EMPRESA == usuario.COD_EMPRESA
                                       && f.COD_FUNCAO ==  usuario.COD_FUNCAO
                                       &&  meta.filter(fm => fm.TIPO == f.TIPO_COMISSAO).map(x => x.TOTAL_VENDA) >= f.VALOR_MIN
                                       &&  meta.filter(fm => fm.TIPO == f.TIPO_COMISSAO).map(x => x.TOTAL_VENDA) <  f.VALOR_MAX
                                       &&  f.VALOR_MIN > 0 
                                       &&  f.MEDIA_ACESSORIOS_MIN == null
                     ).map(x => { console.log('Bloco-3: '+x.TIPO_COMISSAO)
                     regrasComissaoFinal.push(x)
                     }) 
                           arrayRegras.filter(f => f.USA_FAIXA != 'S' 
                               && f.MES == mes 
                               && f.COD_EMPRESA == usuario.COD_EMPRESA
                               && f.COD_FUNCAO ==  usuario.COD_FUNCAO
                                     ).map(x => {
                                       console.log('Bloco-4: '+x.TIPO_COMISSAO)
                                   //    console.log(x)
                                       regrasComissaoFinal.push(x)
                                     })            
                                     return regrasComissaoFinal 
                                    }
     
 }

function comissaoPerc(empresa, tipo, meta){
var perc_valor = 0        
regrasComissaoFinal.filter(f => f.COD_EMPRESA == empresa && f.TIPO_COMISSAO == tipo ).map(x => {    
    
  
        if (x.PERC > 0) {
            perc_valor = x.PERC 
        } 
        if (x.VALOR == 0 && x.QTDE <= meta.QTDE) {
            perc_valor = x.VALOR
        }   
        
        if (x.PREMIO == 'S' && x.QTDE <= meta.QTDE) {                                                      
          x.VALOR
        }             
        if (x.PREMIO == 'NPS' ) {              
          //&& x.QTDE <= 90                                                     
            perc_valor = x.VALOR
        }             
        if (x.PREMIO == 'DSR') {                                                      
            perc_valor = x.PERC
        }   
    })
  
return perc_valor    

}

function comissaoColaboradores(arrayVendas,tipoComissao,usuario,mes,meta,arrayRegras) {  
  var arrayFiltro = [] 
 
  arrayVendas.filter(f => f.MES_VENDA == mes 
                                  && f.VENDEDOR == usuario.NOME                                      
                                  && f.TIPO == tipoComissao
                                  && f.TIPO != 'EMPLACAMENTO'
                                  ).map( x => { 
                                                          const dados = {
                                                          "TIPO":         x.TIPO,
                                                          "COD_EMPRESA":  x.COD_EMPRESA_VENDEDORA,
                                                          "MARCA":        x.MARCA,
                                                          "MES_VENDA":    x.MES_VENDA,
                                                          "NOME_CLIENTE": x.NOME_CLIENTE,
                                                          "CHASSI":       x.CHASSI,
                                                          "DESCRICAO_MODELO": x.DESCRICAO_MODELO,
                                                          "VENDEDOR":     x.VENDEDOR,
                                                          "TOTAL_VENDA":  x.TOTAL_VENDA, 
                                                          "DATA":         x.DATA_VENDA,
                                                          "PROPOSTA":     x.COD_PROPOSTA,
                                                          "CPF":          x.COD_CLIENTE,
                                                          "COMISSAO":     arredonda(valorComissao(x.COD_EMPRESA_VENDEDORA, x.TIPO, x.TOTAL_VENDA, arrayVendas,usuario,arrayRegras.filter(f => f.TIPO_COMISSAO == x.TIPO)[0]?.QTDE),2),
                                                          "PERCENTUAL":   comissaoPerc(x.COD_EMPRESA_VENDEDORA, x.TIPO,meta) * 100,
                                                          "QTDE":         x.QTDE,
                                                          "CLASSE":       arrayRegras.filter(f => f.TIPO_COMISSAO == x.TIPO)[0]?.CLASSE,
                                                          "APELIDO":      arrayRegras.filter(f => f.TIPO_COMISSAO == x.TIPO)[0]?.APELIDO,
                                                          "DESPESAS":     somaValor(x.ANALITICO.map(x => x.DESPESAS)) ,
                                                          "GANHOS":       somaValor(x.ANALITICO.map(x => x.GANHOS)) ,
                                                          "ANALITICO":    x.ANALITICO,
                                                          "BLOCO": "NORMAL",
                                                          "PERC": comissaoPerc(x.COD_EMPRESA_VENDEDORA, x.TIPO,meta) || 0,
                                                      } 
                                                      arrayFiltro.push(dados)             
                                                      })        
  //calculando Bonus do Vendedor
    regrasComissaoFinal.filter(f => f.PREMIO != 'N' && f.TIPO_COMISSAO==tipoComissao).map( bonus => {
                            const dados = {
                              "TIPO":         bonus.TIPO_COMISSAO,
                              "COD_EMPRESA":  usuario.COD_EMPRESA,
                              "MES_VENDA":    mes,                                                            
                              "VENDEDOR":     usuario.NOME,
                              "TOTAL_VENDA":  0,                        
                              "COMISSAO":     arredonda(valorComissao(usuario.COD_EMPRESA, bonus.TIPO_COMISSAO, bonus.VALOR,arrayVendas,usuario,arrayRegras.filter(f => f.TIPO_COMISSAO == bonus.TIPO_COMISSAO)[0]?.QTDE)),
                              "PERCENTUAL":   0,
                              "APELIDO":      arrayRegras.filter(f => f.TIPO_COMISSAO == bonus.TIPO_COMISSAO)[0]?.APELIDO,                              
                              "QTDE": 1,
                              "BLOCO": 'PREMIO',
                              "CLASSE":       'PREMIACOES',
                              "PERC":  0,
                          } 
  arrayFiltro.push(dados)     
  }) 

  return arrayFiltro
} 
 
function comissaoSupervisor(arrayVendas,mes,usuario,meta,arrayRegras) {  
  const arrayGestor = []    
  const arrayFiltro = [] 
  const arrayVendasLista = []
  const arrayfiltroGestorFaixa = []    
  const arrayAjusteObjeto = []
  const notaNPS = false
  const arrayMargens = []
  arrayMargens.pop()
  let  qtdeteste = 0

 
 
                                        function vendas(){
                                          if(usuario?.GESTOR > 1){ 
                                            return arrayVendas.filter(f => f.COD_EMPRESA_VENDEDORA == usuario.COD_EMPRESA
                                                                        &&    f.MES_VENDA  == mes
                                                                        &&    f.TIPO       != 'DSR' 
                                                  )
                                          }

                                          if(usuario?.GESTOR == 'M'){
                                            return arrayVendas.filter(f => f.MARCA == usuario.MARCA 
                                              &&    f.MES_VENDA == mes)
                                          }
                                        }                                         
                                 
                                              if(1){
                                                vendas().map(x => {
                                                                                    const dados = {
                                                                                                  "COD_EMPRESA":  x.COD_EMPRESA_VENDEDORA,
                                                                                                  "TIPO":         x.TIPO,
                                                                                                  "TOTAL_VENDA":  arredonda(x.TOTAL_VENDA,2),
                                                                                                  "MES_VENDA":    x.MES_VENDA,
                                                                                                  "QTDE":         qtdeVenda(x.TOTAL_VENDA),
                                                                                                  "ANALITICO":    x.ANALITICO,
                                                                                                  "COMISSAO":    arredonda(x.TOTAL_VENDA * x.PERC,2) 
                                                                                                  }
                                                                                                  arrayFiltro.push(dados)
                                                                                                  }) 
                                              }
                                             
                                          
                                         //GESTOR SEM FAIXA
                                         arrayRegras.filter(f => f.MES==mes && f.COD_EMPRESA == usuario.COD_EMPRESA && f.COD_FUNCAO == usuario.COD_FUNCAO && f.USA_FAIXA != 'S').map(r => {
                                                   
                                              if(r.PREMIO=='S' && r.PERMITE_AVULSO!='S'){
                                                  const valorTotalDpto  = { 
                                                  "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA)),
                                                  "QTDE":           arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.length,
                                                  "VENDEDOR":       usuario.NOME, 
                                                  "TIPO":           r.TIPO_COMISSAO,
                                                  "COMISSAO":       r.VALOR,
                                                  "USA_FAIXA": 'N',
                                                  "CLASSE": r.CLASSE,
                                                  "APELIDO": r.APELIDO,
                                                  "BLOCO": "1",
                                                  "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                                          } 
                                                      arrayGestor.push(valorTotalDpto)  
                                                  }   
                                                  
                                                  if(r.PREMIO=='S' && r.PERMITE_AVULSO=='S' && r.PERC == 0){                                                  
                                                  const valorTotalDpto  = { 
                                                  "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA)),
                                                  "QTDE":           arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.length,
                                                  "VENDEDOR":       usuario.NOME,
                                                  "TIPO":           r.TIPO_COMISSAO,
                                                  "COMISSAO":       somaValor(vendas.filter(f => f.MARCA == usuario.MARCA && f.VENDEDOR == usuario.NOME
                                                                      &&    f.MES_VENDA == mes
                                                                      &&      f.TIPO == r.TIPO_COMISSAO
                                                                      ).map( x=> x.TOTAL_VENDA)),
                                                  "USA_FAIXA": 'N' ,
                                                  "CLASSE": r.CLASSE,
                                                  "APELIDO": r.APELIDO,
                                                  "BLOCO": "2",
                                                  "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                                          } 
                                                      arrayGestor.push(valorTotalDpto)  
                                                  }     
                                                  if(r.PREMIO=='S' && r.PERMITE_AVULSO=='S' && r.PERC > 0){
                                                    //  console.log(r)
                                                  const valorTotalDpto  = { 
                                                  "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA)),
                                                  "QTDE":           arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.length,
                                                  "VENDEDOR":       usuario.NOME,
                                                  "TIPO":           r.TIPO_COMISSAO,
                                                  "COMISSAO":       somaValor(arrayVendas.filter(f => f.MARCA == usuario.MARCA && f.VENDEDOR == usuario.NOME
                                                                      &&    f.MES_VENDA == mes
                                                                      &&      f.TIPO == r.TIPO_COMISSAO
                                                                      ).map( x=> x.TOTAL_VENDA)  ) *r.PERC,
                                                  "USA_FAIXA": 'N' ,
                                                  "CLASSE": r.CLASSE,
                                                  "APELIDO": r.APELIDO,
                                                  "BLOCO": "3",
                                                  "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                                          } 
                                                      arrayGestor.push(valorTotalDpto)  
                                                  }                                        
                                                  if(r.PREMIO=='N'){
                                                    let percentual = 0
                                                    if (r.PERC_NPS != null && usuario.NOTA_NPS >= 90){
                                                      percentual=r.PERC_NPS
                                                    }else{
                                                      percentual=r.PERC
                                                    }
                                                    

                                                  const valorTotalDpto  = { 
                                                    "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA)),
                                                    "QTDE":           arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.length,
                                                    "VENDEDOR":       usuario.NOME,
                                                    "TIPO":           r.TIPO_COMISSAO,
                                                    "COMISSAO":       somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA * percentual )),
                                                    "USA_FAIXA": 'N',
                                                    "CLASSE": r.CLASSE,
                                                    "APELIDO": r.APELIDO,
                                                    "LEGENDA": r.LEGENDA,
                                                    "MARCA": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.map(x => x.MARCA)?.[0],
                                                    "DESPESAS": somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.map(x => x.DESPESAS)|| 0),
                                                    "GANHOS":   somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.map(x => x.GANHOS)|| 0),
                                                    "BLOCO": "4",
                                                    "PERC": percentual,
                                                    "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                                          } 
                                                      arrayGestor.push(valorTotalDpto)  
                                                  }
                                                 
                                                  if(r.PREMIO=='DSR'){
                                                  const valorTotalDpto  = { 
                                                  "TOTAL_VENDA":    0,
                                                  "QTDE":           arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]?.length,
                                                  "VENDEDOR":       usuario.NOME,
                                                  "TIPO":           r.PREMIO,
                                                  "COMISSAO":       somaValor(arrayGestor.filter(f => f.TIPO != 'SALARIO-FIXO').map(x => x.COMISSAO))* r.PERC,
                                                  "USA_FAIXA": 'N',
                                                  "CLASSE": r.CLASSE,
                                                  "APELIDO": r.APELIDO,
                                                  "BLOCO": "5",
                                                  "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                                  }              
                                                      arrayGestor.push(valorTotalDpto)  
                                                  }
                                           
                                         
                                          })  


                                           //GESTOR COM FAIXA
                                           vendas().map(x => x.ANALITICO.map(n1 => {arrayVendasLista.push(n1)}))

                                           
                                              
                                           arrayRegras.filter(f => f.MES==mes && f.COD_EMPRESA == usuario.COD_EMPRESA && f.COD_FUNCAO == usuario.COD_FUNCAO && f.USA_FAIXA == 'S').map(r => {

                                            vendas().filter(f => f.TIPO == r.TIPO_COMISSAO).map(x=> x.ANALITICO).map(x1 => arrayMargens.push(x1))
                                            //console.log(somaValorInteiro(arrayMargens[0].map(x=> parseFloat(x.MARGEM_VENDA))))
                                            metaVlr = somaValor(vendas(r.TIPO_COMISSAO).map(x=> x.TOTAL_VENDA))
                                            metaQtde = somaValorInteiro( vendas().filter(f => f.TIPO == r.TIPO_COMISSAO).map(x=> parseInt(x.QTDE)))
                                          //  somaMargem = somaValorInteiro( )
                                          ///  console.log(vendas().filter(f => f.TIPO == r.TIPO_COMISSAO).length)
                                            metaMargem = Math.round(((somaValorInteiro(arrayMargens[0].map(x=> parseFloat(x.MARGEM_VENDA)))) / metaQtde), -2)
                                            console.log(metaMargem)
                                            bonusPerc = arrayRegrasAux.filter(f =>  f.MES   == mes &&  f.COD_EMPRESA == usuario.COD_EMPRESA
                                              &&  f.PERC_MIN  <= metaMargem
                                              &&  f.PERC_MAX  >= metaMargem
                                              &&  f.TIPO_COMISSAO == r.TIPO_COMISSAO  ).map(x => x.PERC)[0] 

                                                    console.log('META GESTOR - TIPO '+r.TIPO_COMISSAO+' valor - '+metaVlr+' Qtde: '+ metaQtde+ ' bonusPerc: '+bonusPerc)
                                                    vendas().map(item => {  
                                                              
                                                                    //faixa valor meta
                                                                    arrayRegras.filter(f =>  f.MES   == mes
                                                                      && f.COD_EMPRESA == usuario.COD_EMPRESA
                                                                      && f.COD_FUNCAO  == usuario.COD_FUNCAO
                                                                      && f.USA_FAIXA   == 'S' 
                                                                    // && f.PERC_MIN    == 0
                                                                      && metaVlr >= f.VALOR_MIN    
                                                                      && metaVlr <  f.VALOR_MAX     
                                                                      &&  f.MEDIA_ACESSORIOS_MIN == null
                                                                      &&  f.TIPO_COMISSAO == item.TIPO
                                                                      ).map(rf => {  
                                                                      //  console.log(item.ANALITICO)
                                                                        item.ANALITICO.map(item1 => {
                                                                          var dadosVendas  = {
                                                                            "CHASSI": item1.CHASSI,                                                                                         
                                                                            "CPF": item1.COD_CLIENTE,
                                                                            "DATA_VENDA": item1.DATA_VENDA,
                                                                            "COD_EMPRESA": item1.EMPRESA,
                                                                            "MES_VENDA": item1.MES_VENDA,
                                                                            "NOME_CLIENTE": item1.NOME_CLIENTE,
                                                                            "PROPOSTA": item1.COD_PROPOSTA,
                                                                            "DESCRICAO_MODELO": item1.DESCRICAO_MODELO,
                                                                            "COD_PROPOSTA": item1.COD_PROPOSTA,
                                                                            "MARGEM_VENDA": item1.MARGEM_VENDA,
                                                                            "TOTAL_VENDA": item1.TOTAL_VENDA,
                                                                            "TIPO": item1.TIPO,
                                                                            "QTDE": item1.QTDE,
                                                                            "PERCENTUAL": rf.PERC,
                                                                            "COMISSAO": arredonda(item1.TOTAL_VENDA * rf.PERC,2),
                                                                            "VENDEDOR":       item1.VENDEDOR                                                                       
                                                                            } 
                                                                        
                                                                            if(arrayfiltroGestorFaixa.filter(f => f.COD_PROPOSTA == item1.COD_PROPOSTA ).length == 0){
                                                                              // console.log(dadosVendas)
                                                                              arrayfiltroGestorFaixa.push(dadosVendas) 
                                                                             }
                                                                        })                                                                                                                                          
                                                                     
                                                                    }) 


                                                              //faixa percentual
                                                              arrayRegras.filter(f =>  f.MES   == mes
                                                                                  && f.COD_EMPRESA == usuario.COD_EMPRESA
                                                                                  && f.COD_FUNCAO  == usuario.COD_FUNCAO
                                                                                  && f.USA_FAIXA   == 'S' 
                                                                                  && f.PERC_MIN < item?.MARGEM_VENDA
                                                                                  && f.PERC_MAX > item?.MARGEM_VENDA
                                                                                  &&  f.MEDIA_ACESSORIOS_MIN == null
                                                                                  &&  f.TIPO_COMISSAO == item.TIPO
                                                                              ).map(rf => {  
                                                                         //  console.log(item)
                                                                                 var dadosVendas  = {
                                                                                  "CHASSI": item.CHASSI,                                                                                         
                                                                                  "CPF": item.COD_CLIENTE,
                                                                                  "DATA_VENDA": item.DATA_VENDA,
                                                                                  "COD_EMPRESA": item.EMPRESA,
                                                                                  "MES_VENDA": item.MES_VENDA,
                                                                                  "NOME_CLIENTE": item.NOME_CLIENTE,
                                                                                  "PROPOSTA": item.COD_PROPOSTA,
                                                                                  "DESCRICAO_MODELO": item.DESCRICAO_MODELO,
                                                                                  "COD_PROPOSTA": item.COD_PROPOSTA,
                                                                                  "MARGEM_VENDA": item.MARGEM_VENDA,
                                                                                  "TOTAL_VENDA": item.TOTAL_VENDA,
                                                                                  "TIPO": item.TIPO,
                                                                                  "QTDE": item.QTDE,
                                                                                  "PERCENTUAL": rf.PERC,
                                                                                  "COMISSAO": arredonda(item.TOTAL_VENDA * rf.PERC,2) ,
                                                                                  "VENDEDOR":       usuario.NOME                                                                       
                                                                                  } 
                                                                              
                                                                                  if(arrayfiltroGestorFaixa.filter(f => f.COD_PROPOSTA == item.COD_PROPOSTA ).length == 0){
                                                                                   // console.log(dadosVendas)
                                                                                   arrayfiltroGestorFaixa.push(dadosVendas) 
                                                                                  }
                                                                              })  

                                                                    //faixa QTDE - NAO PREMIO
                                                                    
                                                              arrayRegras.filter(f =>  f.MES   == mes
                                                                                  && f.COD_EMPRESA == usuario.COD_EMPRESA
                                                                                  && f.COD_FUNCAO  == usuario.COD_FUNCAO
                                                                                  && f.USA_FAIXA   == 'S'   
                                                                                  && f.PREMIO   != 'S'                                                                                
                                                                                  &&  f.QTDE_MIN  <= metaQtde 
                                                                                  &&  f.QTDE_MAX  >= metaQtde 
                                                                                  &&  f.MEDIA_ACESSORIOS_MIN == null
                                                                                  &&  f.TIPO_COMISSAO == item.TIPO
                                                                              ).map(rf => {  
                                                                           
                                                                                 var dadosVendas  = {
                                                                                  "CHASSI": item.CHASSI,                                                                                         
                                                                                  "CPF": item.COD_CLIENTE,
                                                                                  "DATA_VENDA": item.DATA_VENDA,
                                                                                  "COD_EMPRESA": item.EMPRESA,
                                                                                  "MES_VENDA": item.MES_VENDA,
                                                                                  "NOME_CLIENTE": item.NOME_CLIENTE,
                                                                                  "PROPOSTA": item.COD_PROPOSTA,
                                                                                  "DESCRICAO_MODELO": item.DESCRICAO_MODELO,
                                                                                  "COD_PROPOSTA": item.COD_PROPOSTA,
                                                                                  "MARGEM_VENDA": item.MARGEM_VENDA,
                                                                                  "TOTAL_VENDA": item.TOTAL_VENDA,
                                                                                  "TIPO": item.TIPO,
                                                                                  "QTDE": item.QTDE,
                                                                                  "PERCENTUAL": rf.PERC,
                                                                                  "COMISSAO": arredonda(item.TOTAL_VENDA * rf.PERC,2) ,
                                                                                  "VENDEDOR":       usuario.NOME                                                                       
                                                                                  } 
                                                                              
                                                                                  if(arrayfiltroGestorFaixa.filter(f => f.COD_PROPOSTA == item.COD_PROPOSTA ).length == 0){
                                                                                    console.log(dadosVendas)
                                                                                   arrayfiltroGestorFaixa.push(dadosVendas) 
                                                                                  }
                                                                              })              
                                                                        //faixa QTDE - COM PREMIO
                                                               
                                                          

                                                              arrayRegras.filter(f =>  f.MES   == mes
                                                                &&  f.COD_EMPRESA == usuario.COD_EMPRESA
                                                                &&  f.COD_FUNCAO  == usuario.COD_FUNCAO
                                                                &&  f.USA_FAIXA   == 'S'   
                                                                &&  f.PREMIO   == 'S'                                                                                
                                                                &&  f.QTDE_MIN  <= metaQtde 
                                                                &&  f.QTDE_MAX  >= metaQtde 
                                                                &&  f.MEDIA_ACESSORIOS_MIN == null
                                                                &&  f.TIPO_COMISSAO == item.TIPO
                                                            ).map(rf => {   
                                                              const PREMIO  = { 
                                                                "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == rf.TIPO_COMISSAO && f.MES_VENDA   == mes).map(x => x.TOTAL_VENDA)),
                                                                "QTDE":           metaQtde,
                                                                "VENDEDOR":       usuario.NOME,
                                                                "TIPO":           rf.TIPO_COMISSAO,
                                                                "COMISSAO":       rf.VALOR * (bonusPerc || 1),
                                                                "USA_FAIXA": 'S',
                                                                "APELIDO": r.APELIDO,
                                                                "BLOCO": "12",
                                                                "ANALITICO": [{
                                                                                "CHASSI": '% Bonus: '+bonusPerc,                                                                                                                                                                                                                                                        
                                                                                "COD_EMPRESA": item.EMPRESA,
                                                                                "MES_VENDA": item.MES_VENDA,
                                                                                "NOME_CLIENTE": 'Vlr Bonus Integral:  '+rf.VALOR,
                                                                                "PROPOSTA": item.COD_PROPOSTA,
                                                                                "DESCRICAO_MODELO": 'Margem Media é '+metaMargem,                                                                                  
                                                                                "TIPO": item.TIPO,
                                                                                "QTDE": 1,
                                                                                "VENDEDOR":       usuario.NOME                                                                       
                                                                                } ]
                                                                                } 
                                                                              if (arrayGestor.filter(f=> f.TIPO == item.TIPO).length < 1){
                                                                                arrayGestor.push(PREMIO)  
                                                                              }             
                                                                     
                                                                } ) 
                                                             
                                                                              
                                                          })

                                                          
                                                          
                                                          

                                        if(r.PREMIO=='S' && arrayGestor.filter(f => f.TIPO==r.TIPO_COMISSAO).length == 0){
                                          const valorTotalDpto  = { 
                                          "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).map(x => x.TOTAL_VENDA)),
                                          "QTDE":           arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).length,
                                          "VENDEDOR":       usuario.NOME,
                                          "TIPO":           r.TIPO_COMISSAO,
                                          "COMISSAO":       somaValor(arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).map(x => x.COMISSAO)),
                                          "USA_FAIXA": 'S',
                                          "APELIDO": r.APELIDO,
                                          "BLOCO": "7",
                                          "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                          }              
                                              arrayGestor.push(valorTotalDpto)  
                                          }   

                                          if(r.PREMIO=='S' && arrayGestor.filter(f => f.TIPO==r.TIPO_COMISSAO).length == 0){
                                          const valorTotalDpto  = { 
                                          "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).map(x => x.TOTAL_VENDA)),
                                          "QTDE":           arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).length,
                                          "VENDEDOR":       usuario.NOME,
                                          "TIPO":           r.TIPO_COMISSAO,
                                          "COMISSAO":       somaValor(arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).map(x => x.COMISSAO)),
                                          "USA_FAIXA": 'S',
                                          "APELIDO": r.APELIDO,
                                          "BLOCO": "8",
                                          "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                          }              
                                              arrayGestor.push(valorTotalDpto)  
                                          }   
                                          
                                          if(   r.PREMIO=='S' 
                                            &&  meta.filter(fm => fm.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA) >= r.VALOR_MIN
                                            &&  meta.filter(fm => fm.TIPO == r.TIPO_COMISSAO).map(x => x.TOTAL_VENDA) <  r.VALOR_MAX
                                            &&  r.VALOR_MIN > 0 
                                         //   &&  r.MEDIA_ACESSORIOS_MIN == null
                                            )
                                            {
                                              console.log(r)
                                            const valorTotalDpto  = { 
                                            "TOTAL_VENDA":    somaValor(arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).map(x => x.TOTAL_VENDA)),
                                            "QTDE":           arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).length,
                                            "VENDEDOR":       usuario.NOME,
                                            "TIPO":           r.TIPO_COMISSAO,
                                            "COMISSAO":       r.VALOR,
                                            "USA_FAIXA": 'S',
                                            "APELIDO": r.APELIDO,
                                            "BLOCO": "7",
                                            "ANALITICO": arrayFiltro.filter(f => f.TIPO == r.TIPO_COMISSAO).map(x => x.ANALITICO)[0]
                                                            }              
                                                arrayGestor.push(valorTotalDpto)  
                                            }  

                                          })

                                          

                                          
                                          arrayRegras.filter(f =>  f.MES   == mes
                                            && f.COD_EMPRESA == usuario.COD_EMPRESA
                                            && f.COD_FUNCAO  == usuario.COD_FUNCAO
                                            && f.USA_FAIXA   == 'S' 
                                            &&  f.MEDIA_ACESSORIOS_MIN == null
                                           // &&  f.TIPO_COMISSAO == 'VENDA-VEICULOS-NOVOS-MARGEM'
                                        ).map( r=> {
                                          const valorTotalDpto  = { 
                                            "TOTAL_VENDA":    somaValor(arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes && f.PERCENTUAL == r.PERC).map(x => x.TOTAL_VENDA)),
                                            "QTDE":           arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes).length,
                                            "VENDEDOR":       usuario.NOME,
                                            "TIPO":           r.TIPO_COMISSAO,
                                            "COMISSAO":       somaValor(arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.MES_VENDA   == mes  && f.PERCENTUAL == r.PERC).map(x => x.COMISSAO)),
                                            "USA_FAIXA": 'S',
                                            "APELIDO": r.APELIDO,
                                            "BLOCO": "9",
                                            "PERC": r.PERC,
                                            "ANALITICO": arrayfiltroGestorFaixa.filter(f => f.TIPO == r.TIPO_COMISSAO && f.PERCENTUAL == r.PERC)
                                                            }              
                                                arrayGestor.push(valorTotalDpto) 
                                        }) 
   
  return   arrayGestor.filter(f => f.COMISSAO != 0)
}

function qtdeVenda(valor){
  let qtde = 1
  if (valor < 0) {
      qtde = -1
  }
  return qtde
}

function formataDinheiro(item) {
  let venda = item;
  if (!!venda && venda.toString().includes(",")) {
    venda = venda.toString().replace(",", ".");
  }
  return parseFloat(venda)
    .toFixed(2)
    .replace(".", ",")
    .replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
}


function valorComissao(empresa, tipo, vlr_venda,arrayVendas,colaborador,qtde_nps) {
    console.log(empresa+' - '+tipo+' - '+vlr_venda+' - '+colaborador.NOME+' - '+qtde_nps)
    //console.log(arrayVendas)
    //console.log(regrasComissaoFinal.filter(f => f.COD_EMPRESA == colaborador.COD_EMPRESA && f.TIPO_COMISSAO == tipo ))
    var vlrComissao = 0     
      regrasComissaoFinal.filter(f => f.COD_EMPRESA == colaborador.COD_EMPRESA && f.TIPO_COMISSAO == tipo ).map(x => {   
  
      if (x.PERC > 0) {           
          vlrComissao =  vlr_venda *  x.PERC 
          console.log(x.TIPO_COMISSAO+' valor comicao: '+vlrComissao)
      } 
      if (x.PERC == 0  && vlr_venda > 0  && x.PREMIO != 'NPS') {                           
          vlrComissao = x.VALOR                     
      } 
      if (x.PERC == 0  && vlr_venda == 0) {    
                     
        vlrComissao = arrayVendas?.filter(f => f.TIPO == tipo && f.VENDEDOR == colaborador.NOME).map(x=> x.QTDE) * x.VALOR                    
      } 
      if (x.VALOR > 0 && x.PERC == 0 && x.PREMIO == 'N') {
        vlrComissao = x.VALOR * arrayVendas?.filter(f => f.TIPO == tipo && f.VENDEDOR == colaborador.NOME)[0].ANALITICO.length
        //   
      }  
      if ( x.PREMIO == 'NPS' &&  parseInt(colaborador.NOTA_NPS ) >= qtde_nps) {    
        vlrComissao = x.VALOR      
      }  
      })                 
     // console.log(tipo +' - '+ vlr_venda+' - '+vlrComissao)
      return vlrComissao           || 0     
  }
  
  function comissaoPerc(empresa, tipo, meta){
    var perc_valor = 0        
    regrasComissaoFinal.filter(f => f.COD_EMPRESA == empresa && f.TIPO_COMISSAO == tipo ).map(x => {  
      
            if (x.PERC > 0) {
                perc_valor = x.PERC 
            } 
            if (x.VALOR == 0 && x.QTDE <= meta.QTDE) {
                perc_valor = x.VALOR
            }   
           
            if (x.PREMIO == 'S' && x.QTDE <= meta.QTDE) {                                                      
              x.VALOR
            }             
            if (x.PREMIO == 'NPS' ) {              
              //&& x.QTDE <= 90                                                     
                perc_valor = x.VALOR
            }             
            if (x.PREMIO == 'DSR') {                                                      
                perc_valor = x.PERC
            }   
        })
     
    return perc_valor    
  
  }

async function find  (request, response) {  
  await getUsuarios(request.body,response)
}
module.exports = {
    find
  }
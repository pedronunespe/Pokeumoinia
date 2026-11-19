// Módulo responsável por executar os comandos no banco de dados.
var database = require("../database/config");

// Seleciona todos os aquários pertencentes a uma empresa.
function buscarAquariosPorEmpresa(empresaId) {

  var instrucaoSql = `SELECT * FROM aquario a WHERE fk_empresa = ${empresaId}`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

// Insere um novo aquário com descrição e empresa vinculada.
function cadastrar(empresaId, descricao) {
  
  var instrucaoSql = `INSERT INTO (descricao, fk_empresa) aquario VALUES (${descricao}, ${empresaId})`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


// Exporta as consultas usadas pelo controller de aquários.
module.exports = {
  buscarAquariosPorEmpresa,
  cadastrar
}

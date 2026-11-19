// Módulo responsável por executar os comandos no banco de dados.
var database = require("../database/config");

// Busca uma empresa pelo seu id.
function buscarPorId(id) {
  var instrucaoSql = "SELECT * FROM empresa WHERE id = '" + id + "'";
  return database.executar(instrucaoSql);
}

// Lista o id, a razão social, o CNPJ e o código de ativação das empresas.
function listar() {
  var instrucaoSql = "SELECT id, razao_social, cnpj, codigo_ativacao FROM empresa";
  return database.executar(instrucaoSql);
}

// Busca uma empresa pelo CNPJ informado.
function buscarPorCnpj(cnpj) {
  var instrucaoSql = "SELECT * FROM empresa WHERE cnpj = '" + cnpj + "'";
  return database.executar(instrucaoSql);
}

// Cadastra uma nova empresa com razão social e CNPJ.
function cadastrar(razaoSocial, cnpj) {
  var instrucaoSql = "INSERT INTO empresa (razao_social, cnpj) VALUES ('" + razaoSocial + "', '" + cnpj + "')";
  return database.executar(instrucaoSql);
}

// Exporta as consultas usadas pelo controller de empresas.
module.exports = { buscarPorCnpj, buscarPorId, cadastrar, listar };

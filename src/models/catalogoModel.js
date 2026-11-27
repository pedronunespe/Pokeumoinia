 
 
 

var database = require("../database/config");

 
function listarGeracoes() {
    var instrucaoSql = `
        SELECT idGeracao, numero, regiao
        FROM geracao
        ORDER BY numero;
    `;
    return database.executar(instrucaoSql, []);
}

 
function listarTipos() {
    var instrucaoSql = `
        SELECT idTipo, nome, cor
        FROM tipo
        ORDER BY nome;
    `;
    return database.executar(instrucaoSql, []);
}

 
function listarJogos() {
    var instrucaoSql = `
        SELECT idJogo, nome, plataforma, anoLancamento
        FROM jogo
        ORDER BY nome;
    `;
    return database.executar(instrucaoSql, []);
}

 
function criarJogo(nome, plataforma, anoLancamento) {
    var instrucaoSql = `
        INSERT INTO jogo (nome, plataforma, anoLancamento) VALUES (?, ?, ?);
    `;
    return database.executar(instrucaoSql, [nome, plataforma, anoLancamento]);
}

module.exports = {
    listarGeracoes,
    listarTipos,
    listarJogos,
    criarJogo
};

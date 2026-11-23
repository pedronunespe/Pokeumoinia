// Arquivo: src/models/catalogoModel.js
// Consultas dos catálogos que alimentam os formulários (geração, tipo e jogo).
// PORQUE: os selects da dashboard precisam vir do banco, não de listas fixas no HTML.

var database = require("../database/config");

// Lista gerações em ordem numérica para o select de cadastro de Pokémon.
function listarGeracoes() {
    var instrucaoSql = `
        SELECT idGeracao, numero, regiao
        FROM geracao
        ORDER BY numero;
    `;
    return database.executar(instrucaoSql, []);
}

// Cadastra uma nova geração. O numero é UNIQUE no banco.
function criarGeracao(numero, regiao) {
    var instrucaoSql = `
        INSERT INTO geracao (numero, regiao) VALUES (?, ?);
    `;
    return database.executar(instrucaoSql, [numero, regiao]);
}

// Lista tipos com a cor usada nos cartões do dashboard.
function listarTipos() {
    var instrucaoSql = `
        SELECT idTipo, nome, cor
        FROM tipo
        ORDER BY nome;
    `;
    return database.executar(instrucaoSql, []);
}

// Cadastra um novo tipo. O nome é UNIQUE no banco.
function criarTipo(nome, cor) {
    var instrucaoSql = `
        INSERT INTO tipo (nome, cor) VALUES (?, ?);
    `;
    return database.executar(instrucaoSql, [nome, cor]);
}

// Lista o catálogo de jogos disponível para vincular à jornada do usuário.
function listarJogos() {
    var instrucaoSql = `
        SELECT idJogo, nome, plataforma, anoLancamento
        FROM jogo
        ORDER BY nome;
    `;
    return database.executar(instrucaoSql, []);
}

// Cadastra um jogo no catálogo global (antes de adicioná-lo à jornada do usuário).
function criarJogo(nome, plataforma, anoLancamento) {
    var instrucaoSql = `
        INSERT INTO jogo (nome, plataforma, anoLancamento) VALUES (?, ?, ?);
    `;
    return database.executar(instrucaoSql, [nome, plataforma, anoLancamento]);
}

module.exports = {
    listarGeracoes,
    criarGeracao,
    listarTipos,
    criarTipo,
    listarJogos,
    criarJogo
};

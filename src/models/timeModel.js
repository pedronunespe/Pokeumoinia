// Arquivo: src/models/timeModel.js
// Consultas da tabela timePokemon (até 6 Pokémon por jogo do usuário).
// PORQUE: os times são a base do radar de status, da rosca de gerações e do tipo predominante.

var database = require("../database/config");

// Lista todas as posições ocupadas dos times de um usuário.
function listar(idUsuario) {
    var instrucaoSql = `
        SELECT tp.fkUsuarioJogo, tp.posicao, tp.fkPokemon,
               p.nome AS pokemon, j.nome AS jogo
        FROM timePokemon tp
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = tp.fkUsuarioJogo
        JOIN jogo j ON j.idJogo = uj.fkJogo
        JOIN pokemon p ON p.idPokemon = tp.fkPokemon
        WHERE uj.fkUsuario = ?
        ORDER BY j.nome, tp.posicao;
    `;
    return database.executar(instrucaoSql, [idUsuario]);
}

// Insere ou substitui o Pokémon de uma posição do time.
// A PRIMARY KEY (fkUsuarioJogo, posicao) permite usar ON DUPLICATE KEY UPDATE.
function salvar(idUsuarioJogo, posicao, idPokemon) {
    var instrucaoSql = `
        INSERT INTO timePokemon (fkUsuarioJogo, posicao, fkPokemon)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE fkPokemon = VALUES(fkPokemon);
    `;
    return database.executar(instrucaoSql, [idUsuarioJogo, posicao, idPokemon]);
}

// Remove uma posição do time, conferindo se o jogo pertence ao usuário logado.
function remover(idUsuario, idUsuarioJogo, posicao) {
    var instrucaoSql = `
        DELETE tp FROM timePokemon tp
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = tp.fkUsuarioJogo
        WHERE tp.fkUsuarioJogo = ? AND tp.posicao = ? AND uj.fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [idUsuarioJogo, posicao, idUsuario]);
}

module.exports = {
    listar,
    salvar,
    remover
};

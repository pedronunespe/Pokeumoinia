 
 
 

var database = require("../database/config");

 
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

 
 
function salvar(idUsuarioJogo, posicao, idPokemon) {
    var instrucaoSql = `
        INSERT INTO timePokemon (fkUsuarioJogo, posicao, fkPokemon)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE fkPokemon = VALUES(fkPokemon);
    `;
    return database.executar(instrucaoSql, [idUsuarioJogo, posicao, idPokemon]);
}

 
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

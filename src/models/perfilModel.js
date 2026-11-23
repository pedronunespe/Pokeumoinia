// Arquivo: src/models/perfilModel.js
// Leitura e atualização do perfil do treinador (apelido, ano de início e favorito).
// PORQUE: os "anos de jornada" da dashboard vêm de perfilTreinador.anoInicio.

var database = require("../database/config");

// Busca o perfil 1:1 do usuário, trazendo o nome do Pokémon favorito.
function buscar(idUsuario) {
    var instrucaoSql = `
        SELECT pt.fkUsuario, pt.apelido, pt.anoInicio, pt.fkPokemonFavorito,
               p.nome AS pokemonFavorito
        FROM perfilTreinador pt
        LEFT JOIN pokemon p ON p.idPokemon = pt.fkPokemonFavorito
        WHERE pt.fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [idUsuario]);
}

// Atualiza os dados configuráveis do perfil.
function atualizar(idUsuario, apelido, anoInicio, fkPokemonFavorito) {
    var instrucaoSql = `
        UPDATE perfilTreinador
        SET apelido = ?, anoInicio = ?, fkPokemonFavorito = ?
        WHERE fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [apelido, anoInicio, fkPokemonFavorito, idUsuario]);
}

module.exports = {
    buscar,
    atualizar
};

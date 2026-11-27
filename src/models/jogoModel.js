 
 
 

var database = require("../database/config");

 
function listarCatalogo() {
    var instrucaoSql = `
        SELECT idJogo, nome, plataforma, anoLancamento
        FROM jogo
        ORDER BY nome;
    `;
    return database.executar(instrucaoSql, []);
}

 
function criarCatalogo(nome, plataforma, anoLancamento) {
    var instrucaoSql = `
        INSERT INTO jogo (nome, plataforma, anoLancamento) VALUES (?, ?, ?);
    `;
    return database.executar(instrucaoSql, [nome, plataforma, anoLancamento]);
}

 
function listarDoUsuario(idUsuario) {
    var instrucaoSql = `
        SELECT uj.idUsuarioJogo, j.idJogo, j.nome, j.plataforma,
               uj.nota, COALESCE(SUM(rh.horas), 0) AS horas
        FROM usuarioJogo uj
        JOIN jogo j ON j.idJogo = uj.fkJogo
        LEFT JOIN registroHoras rh ON rh.fkUsuarioJogo = uj.idUsuarioJogo
        WHERE uj.fkUsuario = ?
        GROUP BY uj.idUsuarioJogo, j.idJogo, j.nome, j.plataforma, uj.nota
        ORDER BY j.nome;
    `;
    return database.executar(instrucaoSql, [idUsuario]);
}

 
function buscarUsuarioJogo(idUsuario, idUsuarioJogo) {
    var instrucaoSql = `
        SELECT uj.idUsuarioJogo, j.nome
        FROM usuarioJogo uj
        JOIN jogo j ON j.idJogo = uj.fkJogo
        WHERE uj.idUsuarioJogo = ? AND uj.fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [idUsuarioJogo, idUsuario]);
}

 
function adicionarAoUsuario(idUsuario, idJogo, nota) {
    var instrucaoSql = `
        INSERT INTO usuarioJogo (fkUsuario, fkJogo, nota) VALUES (?, ?, ?);
    `;
    return database.executar(instrucaoSql, [idUsuario, idJogo, nota]);
}

 
function atualizarDoUsuario(idUsuarioJogo, idUsuario, nota) {
    var instrucaoSql = `
        UPDATE usuarioJogo SET nota = ?
        WHERE idUsuarioJogo = ? AND fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [nota, idUsuarioJogo, idUsuario]);
}

 
function removerDoUsuario(idUsuarioJogo, idUsuario) {
    var passos = [
        { sql: `DELETE FROM timePokemon WHERE fkUsuarioJogo = ?;`, params: [idUsuarioJogo] },
        { sql: `DELETE FROM registroHoras WHERE fkUsuarioJogo = ?;`, params: [idUsuarioJogo] },
        { sql: `DELETE FROM usuarioJogo WHERE idUsuarioJogo = ? AND fkUsuario = ?;`, params: [idUsuarioJogo, idUsuario] }
    ];

    var cadeia = Promise.resolve();
    passos.forEach(function (passo) {
        cadeia = cadeia.then(function () {
            return database.executar(passo.sql, passo.params);
        });
    });
    return cadeia;
}

 
function listarHoras(idUsuario) {
    var instrucaoSql = `
        SELECT rh.idRegistro, rh.fkUsuarioJogo, rh.ano, rh.horas, j.nome AS jogo
        FROM registroHoras rh
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = rh.fkUsuarioJogo
        JOIN jogo j ON j.idJogo = uj.fkJogo
        WHERE uj.fkUsuario = ?
        ORDER BY rh.ano, j.nome;
    `;
    return database.executar(instrucaoSql, [idUsuario]);
}

 
function buscarHora(idRegistro, idUsuario) {
    var instrucaoSql = `
        SELECT rh.idRegistro, rh.ano, rh.horas, j.nome AS jogo
        FROM registroHoras rh
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = rh.fkUsuarioJogo
        JOIN jogo j ON j.idJogo = uj.fkJogo
        WHERE rh.idRegistro = ? AND uj.fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [idRegistro, idUsuario]);
}

 
function salvarHora(idUsuarioJogo, ano, horas) {
    var instrucaoSql = `
        INSERT INTO registroHoras (fkUsuarioJogo, ano, horas) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE horas = VALUES(horas);
    `;
    return database.executar(instrucaoSql, [idUsuarioJogo, ano, horas]);
}

 
function atualizarHora(idRegistro, idUsuario, ano, horas) {
    var instrucaoSql = `
        UPDATE registroHoras rh
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = rh.fkUsuarioJogo
        SET rh.ano = ?, rh.horas = ?
        WHERE rh.idRegistro = ? AND uj.fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [ano, horas, idRegistro, idUsuario]);
}

 
function removerHora(idRegistro, idUsuario) {
    var instrucaoSql = `
        DELETE rh FROM registroHoras rh
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = rh.fkUsuarioJogo
        WHERE rh.idRegistro = ? AND uj.fkUsuario = ?;
    `;
    return database.executar(instrucaoSql, [idRegistro, idUsuario]);
}

module.exports = {
    listarCatalogo,
    criarCatalogo,
    listarDoUsuario,
    buscarUsuarioJogo,
    adicionarAoUsuario,
    atualizarDoUsuario,
    removerDoUsuario,
    listarHoras,
    buscarHora,
    salvarHora,
    atualizarHora,
    removerHora
};

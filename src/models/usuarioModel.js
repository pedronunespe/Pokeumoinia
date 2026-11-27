 
var database = require("../database/config")

 
function autenticar(email, senha) {
     
    var instrucaoSql = `
        SELECT idUsuario, nome, sobrenome, email
        FROM usuario
        WHERE email = ? AND senha = ?;
    `;
    return database.executar(instrucaoSql, [email, senha]);
}

 
function cadastrar(nome, sobrenome, email, senha) {
     
     
    var instrucaoSql = `
        INSERT INTO usuario (nome, sobrenome, email, senha) VALUES (?, ?, ?, ?);
    `;
    return database.executar(instrucaoSql, [nome, sobrenome, email, senha]);
}

 
function cadastrarPerfil(fkUsuario, apelido) {
    var instrucaoSql = `
        INSERT INTO perfilTreinador (fkUsuario, apelido, anoInicio) VALUES (?, ?, YEAR(CURDATE()));
    `;
    return database.executar(instrucaoSql, [fkUsuario, apelido]);
}

 
module.exports = {
    autenticar,
    cadastrar,
    cadastrarPerfil
};

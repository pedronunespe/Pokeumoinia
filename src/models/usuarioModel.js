// Módulo responsável por executar os comandos no banco de dados.
var database = require("../database/config")

// ALTERAÇÃO: consulta de login passou a usar apenas colunas da tabela usuario. PORQUE: fkEstabelecimento não existe no banco pokeumonia.
function autenticar(email, senha) {
    // Os "?" evitam montar a consulta com valores diretos (parâmetros seguros).
    var instrucaoSql = `
        SELECT idUsuario, nome, sobrenome, email
        FROM usuario
        WHERE email = ? AND senha = ?;
    `;
    return database.executar(instrucaoSql, [email, senha]);
}

// ALTERAÇÃO: assinatura reduzida a nome, sobrenome, email e senha. PORQUE: o vínculo com estabelecimento foi removido do cadastro.
function cadastrar(nome, sobrenome, email, senha) {
    // ALTERAÇÃO: logs da SQL e dos dados do formulário removidos. PORQUE: evita expor e-mail e senha no console.
    // ALTERAÇÃO: INSERT usa placeholders "?" e parâmetros separados. PORQUE: elimina interpolação de strings na SQL.
    var instrucaoSql = `
        INSERT INTO usuario (nome, sobrenome, email, senha) VALUES (?, ?, ?, ?);
    `;
    return database.executar(instrucaoSql, [nome, sobrenome, email, senha]);
}

// ALTERAÇÃO: novo insert na tabela perfilTreinador, com anoInicio vindo do ano atual do MySQL. PORQUE: o perfil é 1:1 com o usuário e define os anos de jornada.
function cadastrarPerfil(fkUsuario, apelido) {
    var instrucaoSql = `
        INSERT INTO perfilTreinador (fkUsuario, apelido, anoInicio) VALUES (?, ?, YEAR(CURDATE()));
    `;
    return database.executar(instrucaoSql, [fkUsuario, apelido]);
}

// ALTERAÇÃO: cadastrarPerfil exportado. PORQUE: o controller precisa criar o perfil após o cadastro do usuário.
module.exports = {
    autenticar,
    cadastrar,
    cadastrarPerfil
};

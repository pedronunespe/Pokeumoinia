// Módulo responsável por executar os comandos no banco de dados.
var database = require("../database/config")

// Confere se o e-mail e a senha informados existem no cadastro.
function autenticar(email, senha) {
    // Os "?" evitam montar a consulta com valores diretos (parâmetros seguros).
    var instrucaoSql = `
        SELECT idUsuario, nome, sobrenome, email, fkEstabelecimento AS estabelecimentoId
        FROM usuario
        WHERE email = ? AND senha = ?;
    `;
    return database.executar(instrucaoSql, [email, senha]);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
// Cadastra um novo usuário e vincula ele a um estabelecimento.
function cadastrar(nome, sobrenome, email, senha, fkEstabelecimento) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, sobrenome, email, senha, fkEstabelecimento);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    // Insere os dados do formulário na tabela usuario.
    var instrucaoSql = `
        INSERT INTO usuario (nome, sobrenome, email, senha, fkEstabelecimento) VALUES ('${nome}', '${sobrenome}', '${email}', '${senha}', '${fkEstabelecimento}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Exporta as consultas usadas pelo controller de usuários.
module.exports = {
    autenticar,
    cadastrar
};

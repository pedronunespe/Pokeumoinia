// Biblioteca usada para conversar com o MySQL.
var mysql = require("mysql2");

// CONEXÃO DO MYSQL SERVER
// Dados de acesso ao banco, vindos das variáveis de ambiente.
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

// Executa um comando SQL e devolve o resultado como Promise.
function executar(instrucao, parametros) {

    // Valida se o ambiente foi configurado antes de tentar conectar no banco.
    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    // Cria a Promise que abre a conexão, executa a query e a fecha em seguida.
    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect();

        // Executa o SQL com os parâmetros recebidos (ou com um array vazio).
        conexao.query(instrucao, parametros || [], function (erro, resultados) {
            conexao.end();
            if (erro) {
                reject(erro);
            }
            console.log(resultados);
            resolve(resultados);
        });

        // Trata falhas de conexão com o servidor MySQL.
        conexao.on('error', function (erro) {
            return ("ERRO NO MySQL SERVER: ", erro.sqlMessage);
        });
    });
}

// Disponibiliza a função de execução para os models.
module.exports = {
    executar
};

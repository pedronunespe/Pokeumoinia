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

        // ALTERAÇÃO: o evento 'error' agora registra e rejeita a Promise. PORQUE: antes a falha de conexão era engolida e a rota ficava sem resposta.
        conexao.on("error", function (erro) {
            console.error("ERRO NO MySQL SERVER:", erro.sqlMessage || erro.message || erro);
            reject(erro);
        });

        // A query só é enviada depois que a conexão foi realmente estabelecida.
        conexao.connect(function (erroConexao) {
            if (erroConexao) {
                reject(erroConexao);
                return;
            }

            // Executa o SQL com os parâmetros recebidos (ou com um array vazio).
            conexao.query(instrucao, parametros || [], function (erro, resultados) {
                conexao.end();
                if (erro) {
                    reject(erro);
                    return;
                }
                // ALTERAÇÃO: log de resultados removido. PORQUE: cadastros passaram a reunir mais dados e o console ficaria poluído.
                resolve(resultados);
            });
        });
    });
}

// Disponibiliza a função de execução para os models.
module.exports = {
    executar
};

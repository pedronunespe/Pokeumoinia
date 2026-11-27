 
var mysql = require("mysql2");

 
 
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

 
function executar(instrucao, parametros) {

     
    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

     
    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);

         
        conexao.on("error", function (erro) {
            console.error("ERRO NO MySQL SERVER:", erro.sqlMessage || erro.message || erro);
            reject(erro);
        });

         
        conexao.connect(function (erroConexao) {
            if (erroConexao) {
                reject(erroConexao);
                return;
            }

             
            conexao.query(instrucao, parametros || [], function (erro, resultados) {
                conexao.end();
                if (erro) {
                    reject(erro);
                    return;
                }
                 
                resolve(resultados);
            });
        });
    });
}

 
module.exports = {
    executar
};

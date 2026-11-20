// Ambiente de execução: 'desenvolvimento' usa o banco local; 'producao' usa o remoto.
// var ambiente_processo = 'producao';
var ambiente_processo = 'desenvolvimento';

// Escolhe o arquivo de variáveis de ambiente conforme o ambiente ativo.
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

// Carrega as variáveis (porta, host, credenciais do banco) do arquivo escolhido.
require("dotenv").config({ path: caminho_env });

// Importa as bibliotecas usadas pelo servidor.
var express = require("express");
var cors = require("cors");
var path = require("path");

// Lê a porta e o host definidos no arquivo de ambiente.
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

// Cria a aplicação Express.
var app = express();

// Importa os roteadores responsáveis por cada grupo de rotas da API.
var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
// ALTERAÇÃO: imports das rotas antigas (avisos, medidas, aquários e empresas) removidos. PORQUE: os arquivos e tabelas saíram do projeto.
// ALTERAÇÃO: importação do roteador de dashboard adicionada. PORQUE: o painel precisa expor os dados do banco pokeumonia.
var dashboardRouter = require("./src/routes/dashboard");

// Habilita o servidor a receber dados em JSON e em formulário.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve os arquivos estáticos (HTML, CSS, JS e imagens) da pasta public.
app.use(express.static(path.join(__dirname, "public")));

// Libera o acesso de outras origens (CORS) à API.
app.use(cors());

// Associa cada roteador ao seu prefixo de URL.
app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
// ALTERAÇÃO: registros das rotas antigas (avisos, medidas, aquários e empresas) removidos. PORQUE: não há mais arquivos nem tabelas para elas.
// ALTERAÇÃO: roteador do dashboard registrado em /dashboard. PORQUE: a API deve servir os dados do painel.
app.use("/dashboard", dashboardRouter);

// Inicia o servidor na porta configurada e exibe as informações no console.
app.listen(PORTA_APP, function () {
    // Mensagem de boas-vindas com o endereço de acesso e o ambiente ativo.
    console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
    \n\n\n                                                                                                 
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n`);
});

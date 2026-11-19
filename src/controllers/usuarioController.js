// Models usados no login e na busca dos aquários do usuário.
var usuarioModel = require("../models/usuarioModel");
var aquarioModel = require("../models/aquarioModel");

// Valida e-mail e senha e devolve os dados do usuário após o login.
async function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    // Valida se o e-mail foi preenchido corretamente.
    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).send("Informe um e-mail válido.");
    }
    // Valida se a senha foi preenchida.
    if (typeof senha !== "string" || senha === "") {
        return res.status(400).send("Informe sua senha.");
    }

    try {
        // Consulta o banco pelo e-mail e senha informados.
        var resultadoAutenticar = await usuarioModel.autenticar(email.trim(), senha);

        // Nenhum usuário encontrado: credenciais inválidas.
        if (resultadoAutenticar.length === 0) {
            return res.status(403).send("E-mail ou senha inválidos.");
        }
        // Mais de um usuário com as mesmas credenciais: não é possível entrar.
        if (resultadoAutenticar.length > 1) {
            return res.status(403).send("Há mais de um usuário com esse e-mail e senha.");
        }

        var usuario = resultadoAutenticar[0];
        var aquarios = [];

        // A autenticação não depende de a empresa já possuir aquários cadastrados.
        try {
            // Se o usuário tiver empresa, carrega os aquários dela.
            if (usuario.empresaId != null) {
                aquarios = await aquarioModel.buscarAquariosPorEmpresa(usuario.empresaId);
            }
        } catch (erroAquarios) {
            // Falha ao buscar aquários não impede o login.
            console.error("Não foi possível carregar os aquários após o login:", erroAquarios.sqlMessage || erroAquarios.message);
        }

        // Resposta de sucesso com os dados do usuário e seus aquários.
        return res.status(200).json({
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            aquarios: aquarios || []
        });
    } catch (erro) {
        // Erro inesperado ao validar o login.
        console.error("Houve um erro ao realizar o login:", erro.sqlMessage || erro.message || erro);
        return res.status(500).send("Não foi possível validar o login. Verifique a conexão e a estrutura do banco de dados.");
    }
}

// Cadastra um novo usuário com os dados enviados pelo formulário.
function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var sobrenome = req.body.sobrenomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var fkEstabelecimento = req.body.idEmpresaVincularServer;

    // Validação dos campos obrigatórios.
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    }else if (sobrenome == undefined) {
        res.status(400).send("Seu sobrenome está undefined!");
    }else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    }else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    }else if (fkEstabelecimento == undefined) {
        res.status(400).send("Sua empresa a vincular está undefined!");
    }else {
        // Chama o model para gravar o usuário no banco.
        usuarioModel.cadastrar(nome, sobrenome, email, senha, fkEstabelecimento)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o cadastro! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

// Exporta as funções usadas pelo roteador de usuários.
module.exports = {
    autenticar,
    cadastrar
}

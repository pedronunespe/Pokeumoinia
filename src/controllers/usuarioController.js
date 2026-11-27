 
var usuarioModel = require("../models/usuarioModel");

 
function validarEmail(email) {
    if (typeof email !== "string") {
        return { valido: false, erros: ["O e-mail deve ser um texto."] };
    }

    var ESPACOS = [" ", "\t", "\n", "\r"];
    var erros = [];
    var quantidadeArroba = 0;
    var posicaoArroba = -1;
    var temEspaco = false;
    var i = 0;
    var j = 0;

    for (i = 0; i < email.length; i++) {
        for (j = 0; j < ESPACOS.length; j++) {
            if (email[i] === ESPACOS[j]) {
                temEspaco = true;
            }
        }
        if (email[i] === "@") {
            quantidadeArroba = quantidadeArroba + 1;
            posicaoArroba = i;
        }
    }

    if (temEspaco) {
        erros[erros.length] = "O e-mail não pode conter espaços.";
    }
    if (quantidadeArroba !== 1) {
        erros[erros.length] = "O e-mail deve conter exatamente um @.";
    }
    if (quantidadeArroba === 1 && posicaoArroba === 0) {
        erros[erros.length] = "O @ não pode ser o primeiro caractere.";
    }
    if (quantidadeArroba === 1 && posicaoArroba !== 0) {
        var pontoValido = false;
        var letrasEntre = 0;
        for (i = posicaoArroba + 1; i < email.length; i++) {
            if (email[i] === ".") {
                if (letrasEntre >= 1 && i < email.length - 1) {
                    pontoValido = true;
                }
                letrasEntre = 0;
            } else if ((email[i] >= "a" && email[i] <= "z") || (email[i] >= "A" && email[i] <= "Z")) {
                letrasEntre = letrasEntre + 1;
            }
        }
        if (!pontoValido) {
            erros[erros.length] = "O e-mail deve ter um ponto após o @, com pelo menos uma letra entre eles e não no final.";
        }
    }

    return { valido: erros.length === 0, erros: erros };
}

 
function validarSenha(senha) {
    if (typeof senha !== "string") {
        return { valido: false, erros: ["A senha deve ser um texto."] };
    }

    var NUMEROS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    var MAIUSCULAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var erros = [];
    var temNumero = false;
    var temMaiuscula = false;
    var i = 0;
    var j = 0;

    for (i = 0; i < senha.length; i++) {
        for (j = 0; j < NUMEROS.length; j++) {
            if (senha[i] === NUMEROS[j]) {
                temNumero = true;
            }
        }
        for (j = 0; j < MAIUSCULAS.length; j++) {
            if (senha[i] === MAIUSCULAS[j]) {
                temMaiuscula = true;
            }
        }
    }

    if (senha.length < 8) {
        erros[erros.length] = "A senha deve ter no mínimo 8 caracteres.";
    }
    if (!temMaiuscula) {
        erros[erros.length] = "A senha deve conter pelo menos uma letra maiúscula.";
    }
    if (!temNumero) {
        erros[erros.length] = "A senha deve conter pelo menos um número.";
    }

    return { valido: erros.length === 0, erros: erros };
}

 
async function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

     
    if (typeof email !== "string") {
        return res.status(400).send("Informe um e-mail válido.");
    }
    if (typeof senha !== "string") {
        return res.status(400).send("Informe sua senha.");
    }
    var resultadoEmail = validarEmail(email);
    var resultadoSenha = validarSenha(senha);
    if (!resultadoEmail.valido) {
        return res.status(400).json(resultadoEmail.erros);
    }
    if (!resultadoSenha.valido) {
        return res.status(400).json(resultadoSenha.erros);
    }

    try {
         
        var resultadoAutenticar = await usuarioModel.autenticar(email, senha);

         
        if (resultadoAutenticar.length === 0) {
            return res.status(403).send("E-mail ou senha inválidos.");
        }
         
        if (resultadoAutenticar.length > 1) {
            return res.status(403).send("Há mais de um usuário com esse e-mail e senha.");
        }

        var usuario = resultadoAutenticar[0];

         
        return res.status(200).json({
            id: usuario.idUsuario,
            email: usuario.email,
            nome: usuario.nome
        });
    } catch (erro) {
         
        console.error("Houve um erro ao realizar o login:", erro.sqlMessage || erro.message || erro);
        return res.status(500).send("Não foi possível validar o login. Verifique a conexão e a estrutura do banco de dados.");
    }
}

 
function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var sobrenome = req.body.sobrenomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

     
    var resultadoEmail = validarEmail(email);
    var resultadoSenha = validarSenha(senha);

     
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    }else if (sobrenome == undefined) {
        res.status(400).send("Seu sobrenome está undefined!");
    }else if (!resultadoEmail.valido) {
        res.status(400).json(resultadoEmail.erros);
    }else if (!resultadoSenha.valido) {
        res.status(400).json(resultadoSenha.erros);
    }else {
         
        usuarioModel.cadastrar(nome, sobrenome, email, senha)
            .then(function (resultado) {
                return usuarioModel.cadastrarPerfil(resultado.insertId, nome);
            })
            .then(function (resultadoPerfil) {
                res.status(201).json(resultadoPerfil);
            })
            .catch(function (erro) {
                console.error("Houve um erro ao realizar o cadastro:", erro.sqlMessage || erro.message || erro);
                 
                if (erro && erro.code === "ER_DUP_ENTRY") {
                    return res.status(409).send("E-mail já cadastrado.");
                }
                return res.status(500).json(erro.sqlMessage || erro.message || erro);
            });
    }
}

 
module.exports = {
    autenticar,
    cadastrar,
    validarEmail,
    validarSenha
}

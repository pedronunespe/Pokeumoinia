// Arquivo: src/controllers/jogoController.js
// Regras dos jogos da jornada: vincular jogo, dar nota, registrar horas e editar tudo isso.
// PORQUE: cada alteração aqui aparece nos gráficos após recarregar a dashboard.

var jogoModel = require("../models/jogoModel");
var catalogoModel = require("../models/catalogoModel");
var validacao = require("./validacao");

// Converte um campo de nota em número ou em null (nota não é obrigatória).
function notaOpcional(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }
    return validacao.decimal(valor, "nota", 0, 10);
}

// GET /jogos/catalogo
async function listarCatalogo(req, res) {
    try {
        return res.status(200).json(await catalogoModel.listarJogos());
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar o catálogo de jogos.");
    }
}

// POST /jogos/catalogo
async function criarCatalogo(req, res) {
    try {
        var nome = validacao.texto(req.body.nome, "nome do jogo", 60);
        var plataforma = validacao.texto(req.body.plataforma, "plataforma", 30);
        var anoLancamento = validacao.inteiroOpcional(req.body.anoLancamento, "ano de lançamento", 1900);
        var resultado = await catalogoModel.criarJogo(nome, plataforma, anoLancamento);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível cadastrar o jogo no catálogo.");
    }
}

// GET /jogos/usuario/:idUsuario
async function listarDoUsuario(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        return res.status(200).json(await jogoModel.listarDoUsuario(idUsuario));
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar seus jogos.");
    }
}

// POST /jogos/usuario/:idUsuario
async function adicionarAoUsuario(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idJogo = validacao.inteiro(req.body.idJogo, "jogo", 1);
        var nota = notaOpcional(req.body.nota);
        var resultado = await jogoModel.adicionarAoUsuario(idUsuario, idJogo, nota);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível adicionar o jogo à sua jornada.");
    }
}

// PUT /jogos/usuario/:idUsuario/:idUsuarioJogo
async function atualizarDoUsuario(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idUsuarioJogo = validacao.inteiro(req.params.idUsuarioJogo, "jogo do usuário", 1);
        var vinculo = await jogoModel.buscarUsuarioJogo(idUsuario, idUsuarioJogo);
        if (vinculo.length === 0) {
            return res.status(404).send("Jogo não encontrado na sua jornada.");
        }

        var nota = notaOpcional(req.body.nota);
        var resultado = await jogoModel.atualizarDoUsuario(idUsuarioJogo, idUsuario, nota);
        return res.status(200).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível atualizar a nota do jogo.");
    }
}

// DELETE /jogos/usuario/:idUsuario/:idUsuarioJogo
async function removerDoUsuario(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idUsuarioJogo = validacao.inteiro(req.params.idUsuarioJogo, "jogo do usuário", 1);
        var vinculo = await jogoModel.buscarUsuarioJogo(idUsuario, idUsuarioJogo);
        if (vinculo.length === 0) {
            return res.status(404).send("Jogo não encontrado na sua jornada.");
        }

        await jogoModel.removerDoUsuario(idUsuarioJogo, idUsuario);
        return res.status(200).json({ excluido: true });
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível remover o jogo da sua jornada.");
    }
}

// GET /jogos/horas/:idUsuario
async function listarHoras(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        return res.status(200).json(await jogoModel.listarHoras(idUsuario));
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar suas horas.");
    }
}

// POST /jogos/horas/:idUsuario
async function salvarHora(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idUsuarioJogo = validacao.inteiro(req.body.idUsuarioJogo, "jogo do usuário", 1);
        var ano = validacao.ano(req.body.ano);
        var horas = validacao.decimal(req.body.horas, "horas", 0, 100000);

        var vinculo = await jogoModel.buscarUsuarioJogo(idUsuario, idUsuarioJogo);
        if (vinculo.length === 0) {
            return res.status(404).send("Jogo não encontrado na sua jornada.");
        }

        var resultado = await jogoModel.salvarHora(idUsuarioJogo, ano, horas);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível salvar as horas.");
    }
}

// PUT /jogos/horas/:idUsuario/:idRegistro
async function atualizarHora(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idRegistro = validacao.inteiro(req.params.idRegistro, "registro de horas", 1);
        var registro = await jogoModel.buscarHora(idRegistro, idUsuario);
        if (registro.length === 0) {
            return res.status(404).send("Registro de horas não encontrado.");
        }

        var ano = validacao.ano(req.body.ano);
        var horas = validacao.decimal(req.body.horas, "horas", 0, 100000);
        var resultado = await jogoModel.atualizarHora(idRegistro, idUsuario, ano, horas);
        return res.status(200).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível atualizar as horas.");
    }
}

// DELETE /jogos/horas/:idUsuario/:idRegistro
async function removerHora(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idRegistro = validacao.inteiro(req.params.idRegistro, "registro de horas", 1);
        var registro = await jogoModel.buscarHora(idRegistro, idUsuario);
        if (registro.length === 0) {
            return res.status(404).send("Registro de horas não encontrado.");
        }

        var resultado = await jogoModel.removerHora(idRegistro, idUsuario);
        return res.status(200).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível excluir as horas.");
    }
}

module.exports = {
    listarCatalogo,
    criarCatalogo,
    listarDoUsuario,
    adicionarAoUsuario,
    atualizarDoUsuario,
    removerDoUsuario,
    listarHoras,
    salvarHora,
    atualizarHora,
    removerHora
};

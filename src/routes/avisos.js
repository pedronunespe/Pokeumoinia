// Importa o Express e cria o roteador de avisos.
var express = require("express");
var router = express.Router();

// Controller com as regras de negócio dos avisos.
var avisoController = require("../controllers/avisoController");

// GET /avisos/listar -> lista todos os avisos.
router.get("/listar", function (req, res) {
    avisoController.listar(req, res);
});

// GET /avisos/listar/:idUsuario -> lista os avisos de um usuário.
router.get("/listar/:idUsuario", function (req, res) {
    avisoController.listarPorUsuario(req, res);
});

// GET /avisos/pesquisar/:descricao -> busca avisos pela descrição.
router.get("/pesquisar/:descricao", function (req, res) {
    avisoController.pesquisarDescricao(req, res);
});

// POST /avisos/publicar/:idUsuario -> publica um novo aviso.
router.post("/publicar/:idUsuario", function (req, res) {
    avisoController.publicar(req, res);
});

// PUT /avisos/editar/:idAviso -> altera a descrição de um aviso.
router.put("/editar/:idAviso", function (req, res) {
    avisoController.editar(req, res);
});

// DELETE /avisos/deletar/:idAviso -> remove um aviso.
router.delete("/deletar/:idAviso", function (req, res) {
    avisoController.deletar(req, res);
});

// Exporta o roteador para ser registrado no app.js.
module.exports = router;

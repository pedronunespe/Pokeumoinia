// Importa o Express e cria o roteador de empresas.
var express = require("express");
var router = express.Router();

// Controller com as regras de negócio das empresas.
var empresaController = require("../controllers/empresaController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
// POST /empresas/cadastrar -> cadastra uma nova empresa.
router.post("/cadastrar", function (req, res) {
    empresaController.cadastrar(req, res);
})

// GET /empresas/buscar?cnpj=... -> busca uma empresa pelo CNPJ.
router.get("/buscar", function (req, res) {
    empresaController.buscarPorCnpj(req, res);
});

// GET /empresas/buscar/:id -> busca uma empresa pelo id.
router.get("/buscar/:id", function (req, res) {
  empresaController.buscarPorId(req, res);
});

// GET /empresas/listar -> lista todas as empresas.
router.get("/listar", function (req, res) {
  empresaController.listar(req, res);
});

// Exporta o roteador para ser registrado no app.js.
module.exports = router;

// Arquivo: src/routes/catalogos.js
// Rotas dos catálogos de geração e tipo usados nos selects da dashboard.

var express = require("express");
var router = express.Router();

var catalogoController = require("../controllers/catalogoController");

// Gerações (1 = Kanto, 2 = Johto etc.).
router.get("/geracoes", function (req, res) {
    catalogoController.listarGeracoes(req, res);
});
router.post("/geracoes", function (req, res) {
    catalogoController.criarGeracao(req, res);
});

// Tipos (Fogo, Água...) com a cor exibida nos cartões.
router.get("/tipos", function (req, res) {
    catalogoController.listarTipos(req, res);
});
router.post("/tipos", function (req, res) {
    catalogoController.criarTipo(req, res);
});

module.exports = router;

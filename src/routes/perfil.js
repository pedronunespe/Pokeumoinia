// Arquivo: src/routes/perfil.js
// Rotas da configuração do perfil do treinador.

var express = require("express");
var router = express.Router();

var perfilController = require("../controllers/perfilController");

router.get("/:idUsuario", function (req, res) {
    perfilController.buscar(req, res);
});

router.put("/:idUsuario", function (req, res) {
    perfilController.atualizar(req, res);
});

module.exports = router;

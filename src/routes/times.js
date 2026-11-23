// Arquivo: src/routes/times.js
// Rotas para montar e desmontar o time de 6 Pokémon de cada jogo do usuário.

var express = require("express");
var router = express.Router();

var timeController = require("../controllers/timeController");

// Lista os times de um usuário.
router.get("/:idUsuario", function (req, res) {
    timeController.listar(req, res);
});

// Insere ou substitui uma posição do time.
router.post("/:idUsuario", function (req, res) {
    timeController.salvar(req, res);
});

// Remove uma posição (jogo e posição identificam o slot).
router.delete("/:idUsuario/:idUsuarioJogo/:posicao", function (req, res) {
    timeController.remover(req, res);
});

module.exports = router;

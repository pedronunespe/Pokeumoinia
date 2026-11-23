// Arquivo: src/routes/jogos.js
// Rotas do catálogo de jogos, dos jogos da jornada e dos registros de horas.

var express = require("express");
var router = express.Router();

var jogoController = require("../controllers/jogoController");

// Catálogo global de jogos (cadastrar o jogo antes de adicioná-lo à jornada).
router.get("/catalogo", function (req, res) {
    jogoController.listarCatalogo(req, res);
});
router.post("/catalogo", function (req, res) {
    jogoController.criarCatalogo(req, res);
});

// Jogos vinculados ao usuário. O idUsuario vai na URL para evitar confiar no corpo da requisição.
router.get("/usuario/:idUsuario", function (req, res) {
    jogoController.listarDoUsuario(req, res);
});
router.post("/usuario/:idUsuario", function (req, res) {
    jogoController.adicionarAoUsuario(req, res);
});
router.put("/usuario/:idUsuario/:idUsuarioJogo", function (req, res) {
    jogoController.atualizarDoUsuario(req, res);
});
router.delete("/usuario/:idUsuario/:idUsuarioJogo", function (req, res) {
    jogoController.removerDoUsuario(req, res);
});

// Horas jogadas por ano em cada jogo.
router.get("/horas/:idUsuario", function (req, res) {
    jogoController.listarHoras(req, res);
});
router.post("/horas/:idUsuario", function (req, res) {
    jogoController.salvarHora(req, res);
});
router.put("/horas/:idUsuario/:idRegistro", function (req, res) {
    jogoController.atualizarHora(req, res);
});
router.delete("/horas/:idUsuario/:idRegistro", function (req, res) {
    jogoController.removerHora(req, res);
});

module.exports = router;

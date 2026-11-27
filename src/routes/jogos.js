 
 

var express = require("express");
var router = express.Router();

var jogoController = require("../controllers/jogoController");

 
router.get("/catalogo", function (req, res) {
    jogoController.listarCatalogo(req, res);
});
router.post("/catalogo", function (req, res) {
    jogoController.criarCatalogo(req, res);
});

 
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

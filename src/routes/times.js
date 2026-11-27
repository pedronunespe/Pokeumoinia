 
 

var express = require("express");
var router = express.Router();

var timeController = require("../controllers/timeController");

 
router.get("/:idUsuario", function (req, res) {
    timeController.listar(req, res);
});

 
router.post("/:idUsuario", function (req, res) {
    timeController.salvar(req, res);
});

 
router.delete("/:idUsuario/:idUsuarioJogo/:posicao", function (req, res) {
    timeController.remover(req, res);
});

module.exports = router;

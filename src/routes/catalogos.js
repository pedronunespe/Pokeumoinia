 
 

var express = require("express");
var router = express.Router();

var catalogoController = require("../controllers/catalogoController");

 
router.get("/geracoes", function (req, res) {
    catalogoController.listarGeracoes(req, res);
});

 
router.get("/tipos", function (req, res) {
    catalogoController.listarTipos(req, res);
});

module.exports = router;

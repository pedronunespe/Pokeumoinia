// Model com os comandos SQL dos aquários.
var aquarioModel = require("../models/aquarioModel");

// Busca os aquários vinculados à empresa do usuário.
function buscarAquariosPorEmpresa(req, res) {
  // Identificador recebido na URL.
  var idUsuario = req.params.idUsuario;

  // Consulta o model e devolve a lista, ou 204 quando não há aquários.
  aquarioModel.buscarAquariosPorEmpresa(idUsuario).then((resultado) => {
    if (resultado.length > 0) {
      res.status(200).json(resultado);
    } else {
      res.status(204).json([]);
    }
  }).catch(function (erro) {
    // Em caso de falha no banco, registra o erro e responde 500.
    console.log(erro);
    console.log("Houve um erro ao buscar os aquarios: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  });
}


// Cadastra um novo aquário a partir dos dados enviados pelo formulário.
function cadastrar(req, res) {
  var descricao = req.body.descricao;
  var idUsuario = req.body.idUsuario;

  // Valida se os campos obrigatórios foram enviados.
  if (descricao == undefined) {
    res.status(400).send("descricao está undefined!");
  } else if (idUsuario == undefined) {
    res.status(400).send("idUsuario está undefined!");
  } else {

    // Tudo certo: chama o model para inserir no banco.
    aquarioModel.cadastrar(descricao, idUsuario)
      .then((resultado) => {
        res.status(201).json(resultado);
      }
      ).catch((erro) => {
        // Falha na inserção é retornada como erro 500.
        console.log(erro);
        console.log(
          "\nHouve um erro ao realizar o cadastro! Erro: ",
          erro.sqlMessage
        );
        res.status(500).json(erro.sqlMessage);
      });
  }
}

// Exporta as funções usadas pelo roteador de aquários.
module.exports = {
  buscarAquariosPorEmpresa,
  cadastrar
}

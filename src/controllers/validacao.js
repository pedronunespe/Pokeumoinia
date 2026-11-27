 
 
 

 
function falha(mensagem, status) {
    var erro = new Error(mensagem);
    erro.status = status || 400;  
    return erro;
}

 
function texto(valor, nome, tamanhoMaximo) {
    if (typeof valor !== "string") {
        throw falha("Informe um valor de texto para " + nome + ".");
    }

    var limpo = valor.trim();
    if (limpo.length === 0) {
        throw falha("O campo " + nome + " é obrigatório.");
    }
    if (tamanhoMaximo !== undefined && limpo.length > tamanhoMaximo) {
        throw falha("O campo " + nome + " deve ter no máximo " + tamanhoMaximo + " caracteres.");
    }
    return limpo;
}

 
function inteiro(valor, nome, minimo, maximo) {
    if (valor === undefined || valor === null || valor === "") {
        throw falha("Informe um número inteiro para " + nome + ".");
    }

    var numero = Number(valor);
    if (!Number.isInteger(numero)) {
        throw falha("O campo " + nome + " deve ser um número inteiro.");
    }
    if (minimo !== undefined && numero < minimo) {
        throw falha("O campo " + nome + " deve ser maior ou igual a " + minimo + ".");
    }
    if (maximo !== undefined && numero > maximo) {
        throw falha("O campo " + nome + " deve ser menor ou igual a " + maximo + ".");
    }
    return numero;
}

 
function decimal(valor, nome, minimo, maximo) {
    if (valor === undefined || valor === null || valor === "") {
        throw falha("Informe um número para " + nome + ".");
    }

    var numero = Number(valor);
    if (!Number.isFinite(numero)) {
        throw falha("O campo " + nome + " deve ser um número.");
    }
    if (minimo !== undefined && numero < minimo) {
        throw falha("O campo " + nome + " deve ser maior ou igual a " + minimo + ".");
    }
    if (maximo !== undefined && numero > maximo) {
        throw falha("O campo " + nome + " deve ser menor ou igual a " + maximo + ".");
    }
    return numero;
}

 
function inteiroOpcional(valor, nome, minimo) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }
    return inteiro(valor, nome, minimo);
}

 
function ano(valor) {
    return inteiro(valor, "ano", 1900, 2100);
}

 
function responderErro(res, erro, mensagemPadrao) {
    console.error(mensagemPadrao, erro.sqlMessage || erro.message || erro);

     
    if (erro && erro.status) {
        return res.status(erro.status).send(erro.message);
    }

     
    if (erro && erro.code === "ER_DUP_ENTRY") {
        return res.status(409).send("Já existe um registro com esse nome.");
    }

     
    if (erro && (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.code === "ER_NO_REFERENCED_ROW_2")) {
        return res.status(400).send("Não é possível concluir: existem vínculos com outros registros.");
    }

     
    return res.status(500).send(mensagemPadrao);
}

module.exports = {
    falha,
    texto,
    inteiro,
    decimal,
    inteiroOpcional,
    ano,
    responderErro
};

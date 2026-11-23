// Arquivo: src/controllers/validacao.js
// Funções pequenas e reutilizáveis para validar o que chega da dashboard.
// PORQUE: vários cadastros diferentes precisam das mesmas regras (texto, número, cor etc.).

// Cria um erro que sabe qual status HTTP deve ser devolvido ao navegador.
function falha(mensagem, status) {
    var erro = new Error(mensagem);
    erro.status = status || 400; // 400 = requisição inválida (padrão para erro do formulário).
    return erro;
}

// Valida textos obrigatórios e devolve o texto sem espaços nas pontas.
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

// Valida números inteiros (ids, ano, posição, status base etc.).
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

// Valida números com casas decimais (nota e horas).
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

// Valida inteiro opcional: campo vazio vira null (útil para pokémon favorito).
function inteiroOpcional(valor, nome, minimo) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }
    return inteiro(valor, nome, minimo);
}

// Valida cores no formato hexadecimal usado pela coluna tipo.cor (#RRGGBB).
function corHex(valor) {
    var limpa = texto(valor, "cor", 7);
    if (!/^#[0-9a-fA-F]{6}$/.test(limpa)) {
        throw falha("A cor deve estar no formato #RRGGBB.");
    }
    return limpa;
}

// Valida ano no intervalo aceitável para a jornada do projeto.
function ano(valor) {
    return inteiro(valor, "ano", 1900, 2100);
}

// Centro único de tratamento de erros das rotas de cadastro.
function responderErro(res, erro, mensagemPadrao) {
    console.error(mensagemPadrao, erro.sqlMessage || erro.message || erro);

    // Erro de validação: devolvemos a mensagem amigável criada acima.
    if (erro && erro.status) {
        return res.status(erro.status).send(erro.message);
    }

    // Chave duplicada (nome de jogo/pokémon/tipo repetido, por exemplo).
    if (erro && erro.code === "ER_DUP_ENTRY") {
        return res.status(409).send("Já existe um registro com esse nome.");
    }

    // Tentativa de apagar algo que ainda está sendo usado por outra tabela.
    if (erro && (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.code === "ER_NO_REFERENCED_ROW_2")) {
        return res.status(400).send("Não é possível concluir: existem vínculos com outros registros.");
    }

    // Qualquer outro erro é problema de servidor/banco.
    return res.status(500).send(mensagemPadrao);
}

module.exports = {
    falha,
    texto,
    inteiro,
    decimal,
    inteiroOpcional,
    corHex,
    ano,
    responderErro
};

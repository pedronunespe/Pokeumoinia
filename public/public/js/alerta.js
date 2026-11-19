// Lista de alertas ativos, um por aquário.
var alertas = [];

// Busca a temperatura mais recente de um aquário na API.
function obterdados(idAquario) {
    fetch(`/medidas/tempo-real/${idAquario}`)
        .then(resposta => {
            // Quando a API responde, converte o JSON e analisa a temperatura.
            if (resposta.status == 200) {
                resposta.json().then(resposta => {

                    console.log(`Dados recebidos: ${JSON.stringify(resposta)}`);

                    alertar(resposta, idAquario);
                });
            } else {
                console.error(`Nenhum dado encontrado para o id ${idAquario} ou erro na API`);
            }
        })
        // Erro de rede ou falha na requisição.
        .catch(function (error) {
            console.error(`Erro na obtenção dos dados do aquario p/ gráfico: ${error.message}`);
        });

}

// Classifica a temperatura em níveis de alerta e atualiza a tela.
function alertar(resposta, idAquario) {
    var temp = resposta[0].temperatura;

    var grauDeAviso = '';

    // Limites usados para classificar a temperatura.
    var limites = {
        muito_quente: 23,
        quente: 22,
        ideal: 20,
        frio: 10,
        muito_frio: 5
    };

    var classe_temperatura = 'cor-alerta';

    // Temperatura muito alta: alerta de perigo.
    if (temp >= limites.muito_quente) {
        classe_temperatura = 'cor-alerta perigo-quente';
        grauDeAviso = 'perigo quente'
        grauDeAvisoCor = 'cor-alerta perigo-quente'
        exibirAlerta(temp, idAquario, grauDeAviso, grauDeAvisoCor)
    }
    // Temperatura alta: alerta de atenção.
    else if (temp < limites.muito_quente && temp >= limites.quente) {
        classe_temperatura = 'cor-alerta alerta-quente';
        grauDeAviso = 'alerta quente'
        grauDeAvisoCor = 'cor-alerta alerta-quente'
        exibirAlerta(temp, idAquario, grauDeAviso, grauDeAvisoCor)
    }
    // Faixa ideal: remove qualquer alerta ativo desse aquário.
    else if (temp < limites.quente && temp > limites.frio) {
        classe_temperatura = 'cor-alerta ideal';
        removerAlerta(idAquario);
    }
    // Temperatura baixa: alerta de atenção.
    else if (temp <= limites.frio && temp > limites.muito_frio) {
        classe_temperatura = 'cor-alerta alerta-frio';
        grauDeAviso = 'alerta frio'
        grauDeAvisoCor = 'cor-alerta alerta-frio'
        exibirAlerta(temp, idAquario, grauDeAviso, grauDeAvisoCor)
    }
    // Temperatura muito baixa: alerta de perigo.
    else if (temp <= limites.muito_frio) {
        classe_temperatura = 'cor-alerta perigo-frio';
        grauDeAviso = 'perigo frio'
        grauDeAvisoCor = 'cor-alerta perigo-frio'
        exibirAlerta(temp, idAquario, grauDeAviso, grauDeAvisoCor)
    }

    var card;

    // Atualiza o texto da temperatura exibido no card do aquário.
    if (document.getElementById(`temp_aquario_${idAquario}`) != null) {
        document.getElementById(`temp_aquario_${idAquario}`).innerHTML = temp + "°C";
    }

    // Aplica a cor correspondente ao nível de alerta no card.
    if (document.getElementById(`card_${idAquario}`)) {
        card = document.getElementById(`card_${idAquario}`)
        card.className = classe_temperatura;
    }
}

// Adiciona ou atualiza o alerta do aquário na lista e redesenha os cards.
function exibirAlerta(temp, idAquario, grauDeAviso, grauDeAvisoCor) {
    var indice = alertas.findIndex(item => item.idAquario == idAquario);

    // Se já existe alerta para o aquário, troca os dados; senão, cria um novo.
    if (indice >= 0) {
        alertas[indice] = { idAquario, temp, grauDeAviso, grauDeAvisoCor }
    } else {
        alertas.push({ idAquario, temp, grauDeAviso, grauDeAvisoCor });
    }

    exibirCards();
}

// Remove o alerta do aquário quando a temperatura volta ao normal.
function removerAlerta(idAquario) {
    alertas = alertas.filter(item => item.idAquario != idAquario);
    exibirCards();
}

// Limpa a área de alertas e desenha todos os cards atualizados.
function exibirCards() {
    alerta.innerHTML = '';

    for (var i = 0; i < alertas.length; i++) {
        var mensagem = alertas[i];
        alerta.innerHTML += transformarEmDiv(mensagem);
    }
}

// Monta o HTML de um card de alerta com a descrição do aquário.
function transformarEmDiv({ idAquario, temp, grauDeAviso, grauDeAvisoCor }) {

    var descricao = JSON.parse(sessionStorage.AQUARIOS).find(item => item.id == idAquario).descricao;
    return `
    <div class="mensagem-alarme">
        <div class="informacao">
            <div class="${grauDeAvisoCor}">&#12644;</div> 
            <h3>${descricao} está em estado de ${grauDeAviso}!</h3>
            <small>Temperatura capturada: ${temp}°C.</small>   
        </div>
        <div class="alarme-sino"></div>
    </div>
    `;
}

// Consulta todos os aquários da sessão e repete a cada 5 segundos.
function atualizacaoPeriodica() {
    JSON.parse(sessionStorage.AQUARIOS).forEach(item => {
        obterdados(item.id)
    });
    setTimeout(atualizacaoPeriodica, 5000);
}

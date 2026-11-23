// Arquivo: public/js/dashboard.js
// Busca os dados do usuário na API e desenha os KPIs e gráficos da dashboard.
// PORQUE: antes esta página usava um array fixo escondido no HTML; agora ela reflete o banco.

var nomesStatus = ["PS", "Ataque", "Defesa", "Atq. Esp.", "Def. Esp.", "Velocidade"];
var tiposEscuros = ["Água", "Venenoso", "Dragão", "Lutador", "Fantasma", "Sombrio", "Aço"];

// Guardamos as instâncias para poder destruí-las se a página for recarregada.
var graficoBarras = null;
var graficoRadar = null;
var graficoRosca = null;

// Ponto de entrada: só busca se o login já tiver gravado o ID na sessão.
document.addEventListener("DOMContentLoaded", function () {
    var id = idUsuarioLogado();
    if (!id) {
        return; // validarSessao() já cuida do redirecionamento.
    }

    carregarDashboard(id);
});

async function carregarDashboard(id) {
    try {
        var dados = await api("/dashboard/dados/" + encodeURIComponent(id));
        renderizar(dados);
    } catch (erro) {
        mostrarMensagem("mensagem_dashboard", "Não foi possível carregar a dashboard: " + erro.message, "erro");
    }
}

// Desenha todos os indicadores a partir do objeto devolvido por dashboardModel.
function renderizar(dados) {
    var jogos = dados.jogos || [];
    var anos = dados.anos || [];
    var horasAno = dados.horasAno || [];
    var coresTipos = dados.coresTipos || {};

    var totalHoras = 0;
    var maiorHora = 0;
    var i = 0;
    for (i = 0; i < horasAno.length; i++) {
        totalHoras += Number(horasAno[i]);
        if (Number(horasAno[i]) > maiorHora) {
            maiorHora = Number(horasAno[i]);
        }
    }

    // Aviso aparece apenas quando o banco ainda não tem jogos nem horas do usuário.
    var vazio = document.getElementById("estado_vazio");
    vazio.style.display = (jogos.length === 0 && horasAno.length === 0) ? "block" : "none";

    var nivel = "Treinador iniciante";
    if (totalHoras >= 1000) {
        nivel = "Treinador mestre";
    } else if (totalHoras >= 200) {
        nivel = "Treinador experiente";
    }
    document.getElementById("kpi_horas").innerHTML = totalHoras + ' <span class="unidade">h</span>';
    document.getElementById("kpi_nivel").textContent = nivel + " · " + (dados.anosJornada || 0) + " anos de jornada";

    // ---------- Linha do tempo ----------
    var coresBarras = [];
    for (i = 0; i < horasAno.length; i++) {
        coresBarras.push(Number(horasAno[i]) === maiorHora ? "#ff4a33" : "#c9a574");
    }

    if (graficoBarras) {
        graficoBarras.destroy();
    }
    graficoBarras = new Chart(document.getElementById("grafico_barras"), {
        type: "bar",
        data: {
            labels: anos,
            datasets: [{ label: "Horas", data: horasAno, backgroundColor: coresBarras }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: "#9a9ca3" }, grid: { color: "rgba(255, 255, 255, 0.08)" } },
                x: { ticks: { color: "#9a9ca3" }, grid: { display: false } }
            }
        }
    });

    // ---------- Radar e BST ----------
    var somaStatus = [0, 0, 0, 0, 0, 0];
    var totalPokemon = 0;
    var a = 0;
    var b = 0;
    var c = 0;
    for (a = 0; a < jogos.length; a++) {
        for (b = 0; b < jogos[a].time.length; b++) {
            for (c = 0; c < 6; c++) {
                somaStatus[c] += Number(jogos[a].time[b].status[c]) || 0;
            }
            totalPokemon++;
        }
    }

    var mediaStatus = [];
    var bst = 0;
    for (c = 0; c < 6; c++) {
        // Proteção contra divisão por zero quando ainda não há times cadastrados.
        var media = totalPokemon > 0 ? Math.round(somaStatus[c] / totalPokemon) : 0;
        mediaStatus.push(media);
        bst += media;
    }
    document.getElementById("kpi_bst").textContent = totalPokemon > 0 ? bst : "-";

    if (graficoRadar) {
        graficoRadar.destroy();
    }
    graficoRadar = new Chart(document.getElementById("grafico_radar"), {
        type: "radar",
        data: {
            labels: nomesStatus,
            datasets: [{
                label: "Status geral",
                data: mediaStatus,
                borderColor: "#c9a574",
                backgroundColor: "rgba(201, 165, 116, 0.25)",
                pointBackgroundColor: "#c9a574",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 140,
                    ticks: { color: "#9a9ca3", backdropColor: "transparent", stepSize: 50 },
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    angleLines: { color: "rgba(255, 255, 255, 0.1)" },
                    pointLabels: { color: "#b9bcc6" }
                }
            }
        }
    });

    // ---------- Tipos por jogo e tipo mais usado ----------
    var listaTipos = document.getElementById("lista_tipos");
    listaTipos.innerHTML = "";
    var contagemGeral = {};
    var e = 0;
    var f = 0;
    var g = 0;

    for (e = 0; e < jogos.length; e++) {
        var contagem = {};
        for (f = 0; f < jogos[e].time.length; f++) {
            for (g = 0; g < jogos[e].time[f].tipos.length; g++) {
                var tipo = jogos[e].time[f].tipos[g];
                contagem[tipo] = (contagem[tipo] || 0) + 1;
                contagemGeral[tipo] = (contagemGeral[tipo] || 0) + 1;
            }
        }

        var maior = 0;
        var nomesTipo = Object.keys(contagem);
        for (g = 0; g < nomesTipo.length; g++) {
            if (contagem[nomesTipo[g]] > maior) {
                maior = contagem[nomesTipo[g]];
            }
        }

        var predominantes = [];
        for (g = 0; g < nomesTipo.length; g++) {
            if (contagem[nomesTipo[g]] === maior) {
                predominantes.push(nomesTipo[g]);
            }
        }

        // Criamos os elementos com textContent para não interpretar nomes do banco como HTML.
        var item = document.createElement("li");
        item.className = "item";
        var nomeJogo = document.createElement("strong");
        nomeJogo.textContent = jogos[e].nome;
        var detalhe = document.createElement("span");
        detalhe.textContent = jogos[e].horas + " h · " + (predominantes.length ? predominantes.join(" e ") : "sem tipos") +
            " (" + maior + " de " + jogos[e].time.length + ")";
        item.appendChild(nomeJogo);
        item.appendChild(detalhe);
        listaTipos.appendChild(item);
    }

    var tiposGerais = Object.keys(contagemGeral);
    var tipoTop = "";
    var maiorGeral = 0;
    for (i = 0; i < tiposGerais.length; i++) {
        if (contagemGeral[tiposGerais[i]] > maiorGeral) {
            maiorGeral = contagemGeral[tiposGerais[i]];
            tipoTop = tiposGerais[i];
        }
    }

    var cardTipo = document.getElementById("card_tipo");
    if (tipoTop) {
        cardTipo.style.backgroundColor = coresTipos[tipoTop] || "#1a1a1e";
        cardTipo.style.color = tiposEscuros.indexOf(tipoTop) >= 0 ? "#ffffff" : "#0b0b0c";
        document.getElementById("kpi_tipo").textContent = tipoTop;
        document.getElementById("kpi_tipo_qtd").textContent = maiorGeral + " aparições nos meus times";
    } else {
        cardTipo.style.backgroundColor = "";
        cardTipo.style.color = "";
        document.getElementById("kpi_tipo").textContent = "-";
        document.getElementById("kpi_tipo_qtd").textContent = "Cadastre times para calcular";
    }

    // ---------- Rosca: Pokémon por geração ----------
    var porGeracao = {};
    for (e = 0; e < jogos.length; e++) {
        for (f = 0; f < jogos[e].time.length; f++) {
            var chave = "Geração " + jogos[e].time[f].geracao;
            porGeracao[chave] = (porGeracao[chave] || 0) + 1;
        }
    }

    var nomesGeracoes = Object.keys(porGeracao).sort(function (esquerda, direita) {
        return Number(esquerda.replace(/\D/g, "")) - Number(direita.replace(/\D/g, ""));
    });
    var qtdGeracoes = [];
    var maiorGeracao = 0;
    var geracaoTop = "";
    for (i = 0; i < nomesGeracoes.length; i++) {
        qtdGeracoes.push(porGeracao[nomesGeracoes[i]]);
        if (porGeracao[nomesGeracoes[i]] > maiorGeracao) {
            maiorGeracao = porGeracao[nomesGeracoes[i]];
            geracaoTop = nomesGeracoes[i];
        }
    }

    var paleta = ["#c9a574", "#8a6a43", "#b9bcc6", "#6f7380", "#4a4d57"];
    var coresRosca = [];
    for (i = 0; i < nomesGeracoes.length; i++) {
        coresRosca.push(nomesGeracoes[i] === geracaoTop ? "#ff4a33" : paleta[i % paleta.length]);
    }

    var afinidade = document.getElementById("afinidade");
    if (geracaoTop && totalPokemon > 0) {
        var percentual = (maiorGeracao / totalPokemon) * 100;
        afinidade.textContent = geracaoTop + ": " + maiorGeracao + " de " + totalPokemon +
            " Pokémon dos meus times (" + percentual.toFixed(0) + "%).";
    } else {
        afinidade.textContent = "Cadastre Pokémon nos times para ver a afinidade por geração.";
    }

    if (graficoRosca) {
        graficoRosca.destroy();
    }
    graficoRosca = new Chart(document.getElementById("grafico_rosca"), {
        type: "doughnut",
        data: {
            labels: nomesGeracoes,
            datasets: [{ data: qtdGeracoes, backgroundColor: coresRosca, borderColor: "#131315", borderWidth: 2 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom", labels: { color: "#b9bcc6" } } }
        }
    });
}

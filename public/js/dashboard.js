// Arquivo: public/js/dashboard.js
// Responsável por buscar os dados do usuário diretamente do banco via API e desenhar os indicadores e gráficos da dashboard.
// PORQUE: substitui os dados estáticos antigos por dados reais cadastrados no banco de dados.

// Nomes dos 6 status base para o gráfico de radar (ordem padronizada nos jogos Pokémon)
var nomesStatus = ["PS", "Ataque", "Defesa", "Atq. Esp.", "Def. Esp.", "Velocidade"];

// Tipos com cores de fundo escuras que exigem texto branco no card para contraste
var tiposEscuros = ["Água", "Venenoso", "Dragão", "Lutador", "Fantasma", "Sombrio", "Aço"];

// Instâncias globais do Chart.js para permitir atualização e destruição limpa sem sobreposição
var graficoBarras = null;
var graficoRadar = null;
var graficoRosca = null;

// Controle para evitar requisições concorrentes ou duplicadas
var carregandoDashboard = false;

// Função de inicialização: obtém o ID da sessão e solicita os dados da dashboard
function inicializarDashboard() {
    if (carregandoDashboard) {
        return;
    }

    var id = idUsuarioLogado();
    if (!id) {
        return; // validarSessao() já redireciona para a tela de login se não houver usuário logado
    }

    carregandoDashboard = true;
    carregarDashboard(id);
}

// Executa a inicialização assim que o DOM estiver pronto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarDashboard);
} else {
    inicializarDashboard();
}

// Etapa 1: Requisição assíncrona para buscar os dados consolidados do usuário no backend
async function carregarDashboard(id) {
    try {
        // Envia requisição HTTP GET para a rota parametrizada da API
        var resposta = await fetch("/dashboard/dados/" + encodeURIComponent(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        // Valida se a resposta da API foi bem-sucedida (status HTTP 200)
        if (!resposta.ok) {
            var mensagemErro = await resposta.text();
            throw new Error(mensagemErro || ("Erro " + resposta.status));
        }

        // Converte o corpo da resposta em objeto JSON
        var dados = await resposta.json();

        // Renderiza os dados recebidos nos cards, listas e gráficos
        renderizar(dados);
    } catch (erro) {
        console.error("Erro ao buscar dados da dashboard:", erro);
        mostrarMensagem("mensagem_dashboard", "Não foi possível carregar a dashboard: " + erro.message, "erro");
    } finally {
        carregandoDashboard = false;
    }
}

// Etapa 2: Interpretar os dados retornados pelo banco e desenhar os componentes na tela
function renderizar(dados) {
    var jogos = dados.jogos || [];
    var anos = dados.anos || [];
    var horasAno = dados.horasAno || [];
    var coresTipos = dados.coresTipos || {};
    var anosJornada = dados.anosJornada || 0;

    // ---------- Cálculo de Horas Totais e Nível do Treinador ----------
    var totalHoras = 0;
    var maiorHora = 0;
    var i = 0;

    for (i = 0; i < horasAno.length; i++) {
        var horasAtual = Number(horasAno[i]) || 0;
        totalHoras += horasAtual;
        if (horasAtual > maiorHora) {
            maiorHora = horasAtual;
        }
    }

    // Exibe aviso de estado vazio apenas quando o usuário ainda não tiver jogos nem horas
    var avisoVazio = document.getElementById("estado_vazio");
    if (avisoVazio) {
        avisoVazio.style.display = (jogos.length === 0 && horasAno.length === 0) ? "block" : "none";
    }

    // Regra de nível baseada no total acumulado de horas jogadas
    var nivel = "Treinador iniciante";
    if (totalHoras >= 1000) {
        nivel = "Treinador mestre";
    } else if (totalHoras >= 200) {
        nivel = "Treinador experiente";
    }

    // Preenche o card de Horas Totais
    var elemKpiHoras = document.getElementById("kpi_horas");
    if (elemKpiHoras) {
        elemKpiHoras.innerHTML = totalHoras + ' <span class="unidade">h</span>';
    }

    var elemKpiNivel = document.getElementById("kpi_nivel");
    if (elemKpiNivel) {
        elemKpiNivel.textContent = nivel + " · " + anosJornada + " anos de jornada";
    }

    // ---------- Gráfico 1: Linha do Tempo (Horas por Ano) ----------
    var coresBarras = [];
    for (i = 0; i < horasAno.length; i++) {
        // Destaca em vermelho (#ff4a33) o ano com maior número de horas jogadas
        coresBarras.push(Number(horasAno[i]) === maiorHora && maiorHora > 0 ? "#ff4a33" : "#c9a574");
    }

    var canvasBarras = document.getElementById("grafico_barras");
    if (canvasBarras) {
        if (graficoBarras) {
            graficoBarras.destroy();
        }
        graficoBarras = new Chart(canvasBarras, {
            type: "bar",
            data: {
                labels: anos,
                datasets: [{
                    label: "Horas",
                    data: horasAno,
                    backgroundColor: coresBarras,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#9a9ca3" },
                        grid: { color: "rgba(255, 255, 255, 0.08)" }
                    },
                    x: {
                        ticks: { color: "#9a9ca3" },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // ---------- Gráfico 2: Radar e BST Médio (Status Geral dos Times) ----------
    var somaStatus = [0, 0, 0, 0, 0, 0];
    var totalPokemon = 0;
    var a = 0;
    var b = 0;
    var c = 0;

    for (a = 0; a < jogos.length; a++) {
        var timeDoJogo = jogos[a].time || [];
        for (b = 0; b < timeDoJogo.length; b++) {
            var statsPokemon = timeDoJogo[b].status || [];
            for (c = 0; c < 6; c++) {
                somaStatus[c] += Number(statsPokemon[c]) || 0;
            }
            totalPokemon++;
        }
    }

    // Calcula a média arredondada de cada status base e a soma total (BST)
    var mediaStatus = [];
    var bst = 0;
    for (c = 0; c < 6; c++) {
        var media = totalPokemon > 0 ? Math.round(somaStatus[c] / totalPokemon) : 0;
        mediaStatus.push(media);
        bst += media;
    }

    var elemKpiBst = document.getElementById("kpi_bst");
    if (elemKpiBst) {
        elemKpiBst.textContent = totalPokemon > 0 ? bst : "-";
    }

    var canvasRadar = document.getElementById("grafico_radar");
    if (canvasRadar) {
        if (graficoRadar) {
            graficoRadar.destroy();
        }
        graficoRadar = new Chart(canvasRadar, {
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
                plugins: {
                    legend: { display: false }
                },
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
    }

    // ---------- Lista: Tipo Predominante em Cada Jogo e KPI do Tipo Mais Utilizado ----------
    var listaTipos = document.getElementById("lista_tipos");
    if (listaTipos) {
        listaTipos.innerHTML = "";
    }

    var contagemGeral = {};
    var e = 0;
    var f = 0;
    var g = 0;

    for (e = 0; e < jogos.length; e++) {
        var contagemJogo = {};
        var timeAtual = jogos[e].time || [];

        for (f = 0; f < timeAtual.length; f++) {
            var tiposPokemon = timeAtual[f].tipos || [];
            for (g = 0; g < tiposPokemon.length; g++) {
                var nomeTipo = tiposPokemon[g];
                contagemJogo[nomeTipo] = (contagemJogo[nomeTipo] || 0) + 1;
                contagemGeral[nomeTipo] = (contagemGeral[nomeTipo] || 0) + 1;
            }
        }

        // Descobre a maior frequência de um tipo no time deste jogo
        var maiorFrequencia = 0;
        var nomesDosTipos = Object.keys(contagemJogo);
        for (g = 0; g < nomesDosTipos.length; g++) {
            if (contagemJogo[nomesDosTipos[g]] > maiorFrequencia) {
                maiorFrequencia = contagemJogo[nomesDosTipos[g]];
            }
        }

        // Identifica todos os tipos empatados na liderança
        var predominantes = [];
        for (g = 0; g < nomesDosTipos.length; g++) {
            if (contagemJogo[nomesDosTipos[g]] === maiorFrequencia) {
                predominantes.push(nomesDosTipos[g]);
            }
        }

        // Cria o item da lista com elementos DOM seguros (textContent contra XSS)
        if (listaTipos) {
            var item = document.createElement("li");
            item.className = "item";

            var strongJogo = document.createElement("strong");
            strongJogo.textContent = jogos[e].nome;

            var spanDetalhe = document.createElement("span");
            if (timeAtual.length > 0 && predominantes.length > 0) {
                spanDetalhe.textContent = jogos[e].horas + " h · " + predominantes.join(" e ") +
                    " (" + maiorFrequencia + " de " + timeAtual.length + ")";
            } else {
                spanDetalhe.textContent = jogos[e].horas + " h · sem time cadastrado";
            }

            item.appendChild(strongJogo);
            item.appendChild(spanDetalhe);
            listaTipos.appendChild(item);
        }
    }

    if (listaTipos && jogos.length === 0) {
        var itemVazio = document.createElement("li");
        itemVazio.className = "item";
        var spanVazio = document.createElement("span");
        spanVazio.textContent = "Nenhum jogo cadastrado até o momento.";
        itemVazio.appendChild(spanVazio);
        listaTipos.appendChild(itemVazio);
    }

    // Localiza o tipo com maior número de aparições em todos os times
    var tiposGerais = Object.keys(contagemGeral);
    var tipoTop = "";
    var maiorGeral = 0;
    for (i = 0; i < tiposGerais.length; i++) {
        if (contagemGeral[tiposGerais[i]] > maiorGeral) {
            maiorGeral = contagemGeral[tiposGerais[i]];
            tipoTop = tiposGerais[i];
        }
    }

    // Estiliza o card com a cor oficial do tipo e ajusta a legibilidade
    var cardTipo = document.getElementById("card_tipo");
    var elemKpiTipo = document.getElementById("kpi_tipo");
    var elemKpiTipoQtd = document.getElementById("kpi_tipo_qtd");

    if (cardTipo && elemKpiTipo && elemKpiTipoQtd) {
        if (tipoTop) {
            cardTipo.style.backgroundColor = coresTipos[tipoTop] || "#1a1a1e";
            cardTipo.style.color = tiposEscuros.indexOf(tipoTop) >= 0 ? "#ffffff" : "#0b0b0c";
            elemKpiTipo.textContent = tipoTop;
            elemKpiTipoQtd.textContent = maiorGeral + " aparições nos meus times";
        } else {
            cardTipo.style.backgroundColor = "";
            cardTipo.style.color = "";
            elemKpiTipo.textContent = "-";
            elemKpiTipoQtd.textContent = "Cadastre times para calcular";
        }
    }

    // ---------- Gráfico 3: Rosca (Pokémon por Geração) ----------
    var porGeracao = {};
    for (e = 0; e < jogos.length; e++) {
        var pokemonsDoJogo = jogos[e].time || [];
        for (f = 0; f < pokemonsDoJogo.length; f++) {
            var chaveGeracao = "Geração " + pokemonsDoJogo[f].geracao;
            porGeracao[chaveGeracao] = (porGeracao[chaveGeracao] || 0) + 1;
        }
    }

    // Ordena as gerações numericamente (1, 2, 3...)
    var nomesGeracoes = Object.keys(porGeracao).sort(function (esquerda, direita) {
        var numEsq = Number(esquerda.replace(/\D/g, "")) || 0;
        var numDir = Number(direita.replace(/\D/g, "")) || 0;
        return numEsq - numDir;
    });

    var qtdGeracoes = [];
    var maiorGeracao = 0;
    var geracaoTop = "";
    for (i = 0; i < nomesGeracoes.length; i++) {
        var qtd = porGeracao[nomesGeracoes[i]];
        qtdGeracoes.push(qtd);
        if (qtd > maiorGeracao) {
            maiorGeracao = qtd;
            geracaoTop = nomesGeracoes[i];
        }
    }

    // Paleta em tons terrosos e neutros com destaque em vermelho para a geração favorita
    var paleta = ["#c9a574", "#8a6a43", "#b9bcc6", "#6f7380", "#4a4d57"];
    var coresRosca = [];
    for (i = 0; i < nomesGeracoes.length; i++) {
        coresRosca.push(nomesGeracoes[i] === geracaoTop ? "#ff4a33" : paleta[i % paleta.length]);
    }

    // Atualiza o texto de afinidade
    var elemAfinidade = document.getElementById("afinidade");
    if (elemAfinidade) {
        if (geracaoTop && totalPokemon > 0) {
            var percentual = (maiorGeracao / totalPokemon) * 100;
            elemAfinidade.textContent = geracaoTop + ": " + maiorGeracao + " de " + totalPokemon +
                " Pokémon dos meus times (" + percentual.toFixed(0) + "%).";
        } else {
            elemAfinidade.textContent = "Cadastre Pokémon nos times para ver a afinidade por geração.";
        }
    }

    var canvasRosca = document.getElementById("grafico_rosca");
    if (canvasRosca) {
        if (graficoRosca) {
            graficoRosca.destroy();
        }
        graficoRosca = new Chart(canvasRosca, {
            type: "doughnut",
            data: {
                labels: nomesGeracoes,
                datasets: [{
                    data: qtdGeracoes,
                    backgroundColor: coresRosca,
                    borderColor: "#131315",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#b9bcc6" }
                    }
                }
            }
        });
    }
}

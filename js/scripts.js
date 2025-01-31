// Referencias dos elementos HTML
const _elements = {
  loading: document.querySelector(".loading"),
  switch: document.querySelector(".switch_track"),
  stateSelectToggle: document.querySelector(".state-select-toggle"),
  selectOptions: document.querySelectorAll(".state-select-list_item"),
  selectList: document.querySelector(".state-select-list"),
  selectToggleIcon: document.querySelector(".state-select-toggle_icon"),
  selectSearchBox: document.querySelector(".state-select-list_search"),
  selectStateSelected: document.querySelector(
    ".state-select-toggle_state-selected"
  ),
  confirmed: document.querySelector(".info_total-confirmed"),
  deaths: document.querySelector(".info_total-deaths"),
  deathsDescription: document.querySelector(".data-box_description"),
  vaccinated1: document.querySelector(".info_total-vaccinated-1"),
  vaccinated2: document.querySelector(".info_total-vaccinated-2"),
};

// Variaveis globais
const _data = {
  id: "brasil=true",
  vaccinatedInfo: undefined,
  vaccinated: undefined,
  confirmed: undefined,
  deaths: undefined,
};

// Responsvel por armazenar os graficos da dashboard
const _charts = {};

// Criando o alterador de tema claro/escuro
_elements.switch.addEventListener("click", () => {
  const isDark = _elements.switch.classList.toggle("switch_track-dark");
  // Acessando o atributo data e adicionando a classe dark ou light
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
});

// Adicionando a rotação do icone da bara de menu
_elements.stateSelectToggle.addEventListener("click", () => {
  _elements.selectToggleIcon.classList.toggle(
    "state-select-toggle_icon-rotate"
  );
  _elements.selectList.classList.toggle("state-select-list-show");
});

// Todos os estados da lista são referenciados dentro do parametro item o que permite seleciona-los com os eventos adicionados
_elements.selectOptions.forEach((item) => {
  item.addEventListener("click", () => {
    // Selecionando oque o usuario utilizou dentro do input
    _elements.selectStateSelected.innerText = item.innerText;
    // Salvando as informações dentro da variavel global _data.id
    _data.id = item.getAttribute("data-id");
    // Dispara um evento de click sem a interação do usuario (no caso deste codigo quando o usuario seleciona um item da lista a lista se fecha sozinha)
    _elements.stateSelectToggle.dispatchEvent(new Event("click"));

    loadData(_data.id);
  });
});

// Adicionando evento para quando o usuario soltar uma tecla ("keyup") a função se torna responsavel por receber essa informação para a tratativa de dados
_elements.selectSearchBox.addEventListener("keyup", (e) => {
  // Acessando as informações passadas no teclado pelo usuario e transformando todas as letras minuscula
  const search = e.target.value.toLowerCase();

  // Fazendo a comparação de tudo oque o usuario digitou com o que temos salvo dentro da lista
  for (const item of _elements.selectOptions) {
    // Acessando o nome do estado e comparando
    const state = item.innerText.toLowerCase();

    // Fazendo o filtro de pesquisa do usuario, se o nome do estado inclui o que esta sendo pesquisado pelo usuario a função remove os itens não correspondentes pela pesquisa se não ela mostra
    if (state.includes(search)) {
      item.classList.remove("state-select-list_item-hide");
    } else {
      item.classList.add("state-select-list_item-hide");
    }
  }
});

// Obtendo dados da api com uma função assincrona
const request = async (api, id) => {
  try {
    const url = api + id;
    // Pega os dados da api
    const data = await fetch(url);
    // Transforma os dados em json
    const json = await data.json();
    console.log(json);
    return json;
    // Catch pega o erro e armazena dentro da variavel e
  } catch (e) {
    console.log(e);
  }
};

// Função responsavel por carregar os dados da api
const loadData = async (id) => {
  // Fazendo com que a tela de loading apareça enquanto os dados são carregados
  _elements.loading.classList.remove("loading-ride");

  _data.confirmed = await request(_api.confirmed, id);
  _data.deaths = await request(_api.deaths, id);
  _data.vaccinated = await request(_api.vaccinated, id);
  _data.vaccinatedInfo = await request(_api.vaccinatedInfo, "");

  updateCards();

  // Ocultando a tela de loading quando os dados forem carregados
  _elements.loading.classList.add("loading-ride");
};

// Função responsavel por criar o grafico vazio
const createBasicChart = (element, config) => {
  // Configurações gerais do grafico
  const options = {
    chart: {
      background: "transparent",
    },

    xaxis: {
      type: "datetime",
    },

    series: [],
  };

  const chart = new ApexCharts(document.querySelector(element), options);
  chart.render();

  return chart;
};

const createDonutChart = (element) => {};

const createStackedColumnsChart = (element) => {};

// Função responsavel por criar o grafico de barras
const createCharts = () => {
  _charts.confirmed = createBasicChart(".data-box-confirmed .data-box_body");
  _charts.deaths = createBasicChart(".data-box-deaths .data-box_body");
  _charts.confirmed30 = createBasicChart(".data-box-30 .data-box_body");
  _charts.vaccinatedAbs = createBasicChart(
    ".data-box-vaccinated-abs .data-box_body"
  );
};

// Fazendo a atualização dos cards (VERIFICAR API ANTES)
const updateCards = () => {
  // Pega o valor do id passado no HTML e armazena para converter o codigo da uf para o par de letras de cada unidade federativa do Brasil que é usado dentro da api
  const uf = _ufs[_data.id];
  // Acessando os casos confirmados dentro de elements
  _elements.confirmed.innerText =
    // _data.confirmed => Acessando os dados que são salvos dentro de um array na api
    //[_data.confirmed.length - 1] => Pegando o ultimo elemento do array
    // ["total_de_casos"] => Acessando a informação desejada
    _data.confirmed[_data.confirmed.length - 1]["total_de_casos"];

  _elements.deaths.innerText =
    _data.deaths[_data.deaths.length - 1]["total_de_mortes"];

  _elements.vaccinated1.innerText =
    // Acessando os dados dentro da API => acessando o campo extras que vai ser relacionada a uf correspondente => Dentro de extras acessando o campo info com a info desejada
    _data.vaccinatedInfo.extras[uf].info["total-hoje-dose-1"];

  _elements.vaccinated2.innerText =
    _data.vaccinatedInfo.extras[uf].info["total-hoje-dose-2"] + // Somando o total da dose 2 com o total da dose unica
    _data.vaccinatedInfo.extras[uf].info["total-hoje-dose-unica"];

  // Modificando valores para aparecerem formatados com pontos
  _elements.confirmed.innerText = Number(
    _elements.confirmed.innerText
  ).toLocaleString();

  _elements.deaths.innerText = Number(
    _elements.deaths.innerText
  ).toLocaleString();

  _elements.vaccinated1.innerText = Number(
    _elements.vaccinated1.innerText
  ).toLocaleString();

  _elements.vaccinated2.innerText = Number(
    _elements.vaccinated2.innerText
  ).toLocaleString();
};

// Atualizando os graficos
const updateCharts = () => {
  createBasicChart();
};

const getChartOptions = (series, labels, colors) => {};

const getDonutChartOptions = (value, name, colors) => {};

//
loadData(_data.id);
createCharts();

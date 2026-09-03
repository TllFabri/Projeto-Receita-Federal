let historicoPesquisas = [];

function mascaraCNPJ(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function preencherCNPJ(cnpj) {
  document.getElementById("cnpjInput").value = mascaraCNPJ(cnpj);
  document.getElementById("sugestoes").style.display = "none";
}

async function buscarParcial(valor) {
  const trecho = valor.replace(/\D/g, "");
  document.getElementById("cnpjInput").value = mascaraCNPJ(valor);
  const listaSugestoes = document.getElementById("listaSugestoes");
  const listaSugestoesItens = document.getElementById("listaSugestoesItens");

  if (trecho.length < 2) {
    listaSugestoes.style.display = "none";
    listaSugestoesItens.innerHTML = "";
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:5000/buscar/${trecho}`);
    const empresas = await resposta.json();

    if (empresas.length === 0) {
      listaSugestoes.style.display = "none";
      listaSugestoesItens.innerHTML = "";
      return;
    }

    listaSugestoes.style.display = "block";
    listaSugestoesItens.innerHTML = empresas.map(e => `
      <span onclick="selecionarSugestao('${e.cnpj}')">
        <strong>${mascaraCNPJ(e.cnpj)}</strong> — ${e.razao_social}
      </span>
    `).join("");

  } catch (erro) {
    listaSugestoes.style.display = "none";
  }
}

function selecionarSugestao(cnpj) {
  document.getElementById("cnpjInput").value = mascaraCNPJ(cnpj);
  document.getElementById("sugestoes").style.display = "none";
  consultarEmpresa();
}

async function consultarEmpresa() {
  const cnpjDigitado = document.getElementById("cnpjInput").value.replace(/\D/g, "").trim();
  const resultado = document.getElementById("resultado");

  if (cnpjDigitado === "") {
    resultado.innerHTML = `<div class="erro">Digite um CNPJ para realizar a consulta.</div>`;
    return;
  }

  resultado.innerHTML = `<p>Carregando...</p>`;

  try {
    const respostaEmpresa = await fetch(`http://localhost:5000/empresa/${cnpjDigitado}`);
    const empresa = await respostaEmpresa.json();

    if (empresa.erro) {
      resultado.innerHTML = `<div class="erro">Empresa não encontrada na base de dados.</div>`;
      return;
    }

    const respostaSocios = await fetch(`http://localhost:5000/socios/${cnpjDigitado}`);
    const socios = await respostaSocios.json();

    adicionarAoHistorico(cnpjDigitado);

    let sociosHTML = socios.length > 0
      ? socios.map(socio => `
          <li>
            <div class="socio-info">
              <strong>${socio.nome}</strong><br>
              <small>CPF: ${mascaraCPF(socio.cpf)}</small>
            </div>
            <button class="btn-ver" onclick="abrirModal('${socio.cpf}', '${socio.nome}')">
              Ver Informações
            </button>
          </li>
        `).join("")
      : `<li>Nenhum sócio encontrado.</li>`;

    resultado.innerHTML = `
      <section class="bloco">
        <h3>Dados da Empresa</h3>
        <div class="grid">
          <div class="info">
            <strong>CNPJ</strong>
            ${mascaraCNPJ(empresa.cnpj)}
          </div>
          <div class="info">
            <strong>Razão Social</strong>
            ${empresa.razao_social}
          </div>
        </div>
      </section>

      <section class="bloco">
        <h3>Sócios</h3>
        <ul class="lista">${sociosHTML}</ul>
      </section>
    `;

  } catch (erro) {
    resultado.innerHTML = `<div class="erro">Erro ao conectar com o servidor. O Flask está rodando?</div>`;
  }
}

async function abrirModal(cpf, nome) {
  const modal = document.getElementById("modal");
  const conteudo = document.getElementById("modal-conteudo");

  conteudo.innerHTML = `<p>Carregando informações...</p>`;
  modal.classList.add("ativo");

  try {
    const resposta = await fetch(`http://localhost:5000/conexoes/${cpf}`);
    const empresas = await resposta.json();

    const totalEmpresas = empresas.length;
    const risco = calcularRisco(totalEmpresas);

    let empresasHTML = empresas.length > 0
      ? empresas.map(e => `
          <li>
            <strong>${e.razao_social}</strong><br>
            <small>CNPJ: ${mascaraCNPJ(e.cnpj)}</small>
          </li>
        `).join("")
      : `<li>Nenhuma empresa encontrada.</li>`;

    conteudo.innerHTML = `
      <h3>${nome}</h3>
      <small>CPF: ${mascaraCPF(cpf)}</small>

      <div class="risco-badge ${risco.classe}">
        ${risco.icone} Nível de Risco: ${risco.nivel}
      </div>

      <p class="risco-descricao">${risco.descricao}</p>

      <h4>Empresas que este sócio participa (${totalEmpresas})</h4>
      <ul class="lista">${empresasHTML}</ul>
    `;

  } catch (erro) {
    conteudo.innerHTML = `<div class="erro">Erro ao carregar informações do sócio.</div>`;
  }
}

function calcularRisco(totalEmpresas) {
  if (totalEmpresas >= 4) {
    return {
      nivel: "ALTO",
      classe: "alto",
      icone: "▲",
      descricao: `Sócio com participação em ${totalEmpresas} empresas. Alto risco de dispersão de dívidas e dependência entre negócios.`
    };
  } else if (totalEmpresas >= 2) {
    return {
      nivel: "MÉDIO",
      classe: "medio",
      icone: "●",
      descricao: `Sócio com participação em ${totalEmpresas} empresas. Atenção para possíveis ligações entre os negócios.`
    };
  } else {
    return {
      nivel: "BAIXO",
      classe: "baixo",
      icone: "▼",
      descricao: `Sócio com participação em ${totalEmpresas} empresa. Nenhum fator crítico identificado.`
    };
  }
}

function fecharModal(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    modal.classList.remove("ativo");
  }
}

function fecharModalBtn() {
  document.getElementById("modal").classList.remove("ativo");
}

function adicionarAoHistorico(cnpj) {
  historicoPesquisas = historicoPesquisas.filter(item => item !== cnpj);
  historicoPesquisas.unshift(cnpj);

  if (historicoPesquisas.length > 4) {
    historicoPesquisas.pop();
  }

  atualizarHistorico();
}

function atualizarHistorico() {
  const listaHistorico = document.getElementById("listaHistorico");

  if (historicoPesquisas.length === 0) {
    listaHistorico.innerHTML = "<p>Nenhuma pesquisa realizada ainda.</p>";
    return;
  }

  listaHistorico.innerHTML = historicoPesquisas.map(cnpj => `
    <span onclick="pesquisarHistorico('${cnpj}')">${mascaraCNPJ(cnpj)}</span>
  `).join("");
}

function pesquisarHistorico(cnpj) {
  document.getElementById("cnpjInput").value = mascaraCNPJ(cnpj);
  consultarEmpresa();
}
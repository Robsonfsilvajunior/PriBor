// Dados dos carros
const carros = {
    carro1: {
        nome: "Carro Modelo X",
        ano: "2023",
        preco: "R$ 80.000,00",
        descricao: "Carro de última geração, excelente performance e conforto.",
        imagem: "https://via.placeholder.com/600",
        whatsapp: "https://wa.me/seunumerodewhatsapp"
    },
    carro2: {
        nome: "Carro Modelo Y",
        ano: "2022",
        preco: "R$ 70.000,00",
        descricao: "Veículo com alta economia de combustível e design moderno.",
        imagem: "https://via.placeholder.com/600",
        whatsapp: "https://wa.me/seunumerodewhatsapp"
    }
};

// Função para mostrar os detalhes do carro
function mostrarDetalhes(carroId) {
    const carro = carros[carroId];
    const conteudoDetalhes = `
        <h2>${carro.nome}</h2>
        <img src="${carro.imagem}" alt="Imagem do ${carro.nome}">
        <p>Ano: ${carro.ano}</p>
        <p>Preço: ${carro.preco}</p>
        <p>${carro.descricao}</p>
        <a href="${carro.whatsapp}" class="btn" target="_blank">Fale com o Vendedor</a>
    `;

    document.getElementById('conteudo-detalhes').innerHTML = conteudoDetalhes;
    // Esconder catálogo e mostrar detalhes
    document.getElementById('catalogo').style.display = 'none';
    document.getElementById('detalhes').style.display = 'block';
}

// Função para voltar ao catálogo
function voltar() {
    document.getElementById('detalhes').style.display = 'none';
    document.getElementById('catalogo').style.display = 'block';
}
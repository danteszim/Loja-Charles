// Sistema de gerenciamento do carrinho usando localStorage
const carrinhoManager = {
    // Obter itens do carrinho
    getItens: function() {
        const itens = localStorage.getItem('carrinho');
        return itens ? JSON.parse(itens) : [];
    },

    // Adicionar item ao carrinho
    adicionarItem: function(produto) {
        const carrinho = this.getItens();
        const itemExistente = carrinho.find(item => item.id === produto.id);
        
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: 1
            });
        }
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    },

    // Atualizar quantidade de um item específico
    atualizarQuantidade: function(id, quantidade) {
        const carrinho = this.getItens();
        const item = carrinho.find(item => item.id === id);
        if (item) {
            item.quantidade = Math.max(1, parseInt(quantidade));
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        }
    },

    // Remover um item do carrinho
    removerItem: function(id) {
        const carrinho = this.getItens();
        const index = carrinho.findIndex(item => item.id === id);
        if (index !== -1) {
            carrinho.splice(index, 1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        }
    }
};

// Função para inicializar os botões de adicionar produto na página de produtos
function inicializarBotoesProdutos() {
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar-carrinho');
    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', function() {
            const card = this.closest('.card');
            const produto = {
                id: card.dataset.produtoId,
                nome: card.querySelector('.card-title').textContent,
                preco: parseFloat(card.querySelector('.card-text').textContent.replace('R$', '').replace(',', '.')),
                imagem: card.querySelector('.card-img-top').src
            };
            
            carrinhoManager.adicionarItem(produto);
            alert('Produto adicionado ao carrinho!');
        });
    });
}

// Funções relacionadas ao cálculo e exibição de preços
const TAXA_FRETE = 15.00;

function formatarPreco(valor) {
    return `R$ ${valor.toFixed(2)}`;
}

function calcularTotalItem(produto) {
    return produto.preco * produto.quantidade;
}

// Atualiza os totais do carrinho na página de visualização do carrinho
function atualizarTotais() {
    const produtos = carrinhoManager.getItens();
    const subtotal = produtos.reduce((acc, produto) => acc + calcularTotalItem(produto), 0);
    const total = subtotal + TAXA_FRETE;

    document.getElementById('subtotal').textContent = formatarPreco(subtotal);
    document.getElementById('frete').textContent = formatarPreco(TAXA_FRETE);
    document.getElementById('total').textContent = formatarPreco(total);
}

// Renderiza os itens do carrinho na página de visualização do carrinho
function renderizarCarrinho() {
    const tbody = document.getElementById('carrinho-items');
    const produtos = carrinhoManager.getItens();
    tbody.innerHTML = '';

    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        const totalItem = calcularTotalItem(produto);

        tr.innerHTML = `
            <td>
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem">
                <p>${produto.nome}</p>
            </td>
            <td>
                <input type="number" 
                       value="${produto.quantidade}" 
                       min="1" 
                       class="quantidade-input">
            </td>
            <td>${formatarPreco(produto.preco)}</td>
            <td>${formatarPreco(totalItem)}</td>
            <td>
                <button class="remover-btn">Remover</button>
            </td>
        `;

        // Evento para atualizar quantidade
        tr.querySelector('.quantidade-input').addEventListener('change', (event) => {
            atualizarQuantidade(produto.id, event.target.value);
        });

        // Evento para remover o produto
        tr.querySelector('.remover-btn').addEventListener('click', () => {
            removerProduto(produto.id);
        });

        tbody.appendChild(tr);
    });

    atualizarTotais();
}

// Funções para atualizar quantidade e remover produto, chamadas diretamente pelos eventos no HTML
function atualizarQuantidade(id, novaQuantidade) {
    carrinhoManager.atualizarQuantidade(id, novaQuantidade);
    renderizarCarrinho();
}

function removerProduto(id) {
    carrinhoManager.removerItem(id);
    renderizarCarrinho();
}

// Função para enviar o pedido para o WhatsApp
function enviarParaWhatsApp() {
    const produtos = carrinhoManager.getItens();
    let mensagem = " *Pedido:*\n\n";
    
    produtos.forEach(produto => {
        const totalItem = calcularTotalItem(produto);
        mensagem += `${produto.nome}\n`;
        mensagem += `Quantidade: ${produto.quantidade}\n`;
        mensagem += `Subtotal: ${formatarPreco(totalItem)}\n\n`;
    });

    const subtotal = produtos.reduce((acc, produto) => acc + calcularTotalItem(produto), 0);
    const total = subtotal + TAXA_FRETE;

    mensagem += `\n *Resumo do Pedido:*\n`;
    mensagem += `_Subtotal:_ ${formatarPreco(subtotal)}\n`;
    mensagem += `_Frete:_ ${formatarPreco(TAXA_FRETE)}\n`;
    mensagem += `_Total:_ ${formatarPreco(total)}`;

    const numeroWhatsApp = "554799610033";
    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
    
    window.open(urlWhatsApp, '_blank');
}

// Inicialização das funcionalidades
if (document.querySelector('.lista-produtos')) {
    inicializarBotoesProdutos();
} else if (document.getElementById('carrinho-items')) {
    renderizarCarrinho();
    atualizarTotais();
}



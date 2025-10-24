// Função simples para mostrar uma mensagem ao clicar no botão
document.getElementById('alertButton').addEventListener('click', function() {
    alert('Olá! Esta é uma mensagem de JavaScript.');
});

// Exemplo de manipulação de DOM: alterar o texto do header ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header p');
    header.textContent = 'Página carregada com JavaScript!';
});
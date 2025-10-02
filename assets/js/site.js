// Marca o link de navegação ativo com base no pathname
document.addEventListener('DOMContentLoaded', function(){
  var links = document.querySelectorAll('nav a');
  var path = location.pathname.split('/').pop() || 'index.html';
  links.forEach(function(a){
    if(a.getAttribute('href') === path){
      a.classList.add('active');
    }
  });

  // Confirmação simples para formulários de exemplo
  var forms = document.querySelectorAll('form');
  forms.forEach(function(f){
    // Se o form tiver data-allow-submit="true", não interceptamos
    if(f.getAttribute('data-allow-submit') === 'true') return;
    f.addEventListener('submit', function(e){
      // Evita envio real em páginas estáticas; mostra mensagem
      e.preventDefault();
      var msg = f.dataset.confirm || 'Obrigado! Seus dados foram recebidos.';
      alert(msg);
    });
  });
});

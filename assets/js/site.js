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
  // Intercept only when a form explicitly opts-in with data-demo="true"
  var demoForms = document.querySelectorAll('form[data-demo="true"]');
  demoForms.forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var msg = f.dataset.confirm || 'Obrigado! Seus dados foram recebidos.';
      alert(msg);
    });
  });
});

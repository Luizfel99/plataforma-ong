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
  
  // Video source health check: if a <video> references a missing source, show a friendly placeholder
  // For videos that use data-src, show a user-initiated placeholder to avoid automatic network requests
  function setupVideoPlaceholders(){
    const videos = Array.from(document.querySelectorAll('video'));
    for (const v of videos) {
      const srcEl = v.querySelector('source');
      if (!srcEl) continue;
      const dataSrc = srcEl.getAttribute('data-src');
      if (!dataSrc) continue;

      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'video-fallback';
      const title = document.createElement('strong');
      title.textContent = 'Vídeo institucional (desativado)';
      const msg = document.createElement('p');
      msg.textContent = 'O vídeo institucional está desativado por enquanto. Entre em contato com o administrador para disponibilizá-lo.';
      placeholder.appendChild(title);
      placeholder.appendChild(msg);
      // If captions file exists, show a link to it
      const track = v.querySelector('track[kind="captions"]');
      if (track && track.getAttribute('src')){
        const link = document.createElement('a');
        link.href = track.getAttribute('src');
        link.textContent = 'Baixar legendas (SRT/VTT)';
        link.target = '_blank';
        placeholder.appendChild(link);
      }
      // Replace the video with static placeholder (no network requests)
      v.replaceWith(placeholder);
    }
  }
  setupVideoPlaceholders();
});

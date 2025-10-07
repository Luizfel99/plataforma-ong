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
  // Theme controls: toggle dark mode and let user pick a primary color
  (function setupThemeControls(){
    const THEME_KEY = 'plataforma_theme';
    const COLOR_KEY = 'plataforma_primary_color';

    function applyTheme(theme){
      if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
      else document.documentElement.removeAttribute('data-theme');
    }
    function applyPrimaryColor(hex){
      if(!hex) return;
      document.documentElement.style.setProperty('--color-primary-500', hex);
      // derive darker/lighter variants very simplistically
      try{
        const n = parseInt(hex.replace('#',''),16);
        const r = (n>>16)&255, g=(n>>8)&255, b=n&255;
        const darker = '#'+((1<<24) + ((r*0.85|0)<<16) + ((g*0.85|0)<<8) + (b*0.85|0)).toString(16).slice(1);
        const lighter = '#'+((1<<24) + ((Math.min(255,r*1.15)|0)<<16) + ((Math.min(255,g*1.15)|0)<<8) + (Math.min(255,b*1.15)|0)).toString(16).slice(1);
        document.documentElement.style.setProperty('--color-primary-600', darker);
        document.documentElement.style.setProperty('--color-primary-400', lighter);
      }catch(e){/* noop */}
    }

    // Read persisted prefs
    const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const savedColor = localStorage.getItem(COLOR_KEY) || null;
    applyTheme(savedTheme);
    if(savedColor) applyPrimaryColor(savedColor);

    // Inject controls in the page footer if not present
    const existing = document.getElementById('theme-controls');
    if(existing) return;

    const controls = document.createElement('div');
    controls.id = 'theme-controls';
    controls.style.position = 'fixed';
    controls.style.right = '12px';
    controls.style.bottom = '12px';
    controls.style.background = 'var(--surface)';
    controls.style.border = '1px solid var(--card-border)';
    controls.style.borderRadius = '8px';
    controls.style.padding = '8px';
    controls.style.zIndex = 9999;
    controls.style.boxShadow = 'var(--shadow-sm)';

    const toggle = document.createElement('button');
    toggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    toggle.title = 'Alternar tema (clique)';
    toggle.style.marginRight = '8px';
    toggle.addEventListener('click', function(){
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      toggle.textContent = next === 'dark' ? '🌙' : '☀️';
      localStorage.setItem(THEME_KEY, next);
    });

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.title = 'Escolher cor primária';
    colorInput.value = savedColor || '#2196F3';
    colorInput.addEventListener('input', function(){
      const val = colorInput.value;
      applyPrimaryColor(val);
      localStorage.setItem(COLOR_KEY, val);
    });

    const reset = document.createElement('button');
    reset.textContent = 'Reset';
    reset.style.marginLeft = '8px';
    reset.addEventListener('click', function(){
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(COLOR_KEY);
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.removeProperty('--color-primary-500');
      document.documentElement.style.removeProperty('--color-primary-600');
      document.documentElement.style.removeProperty('--color-primary-400');
      toggle.textContent = '☀️';
      colorInput.value = '#2196F3';
    });

    controls.appendChild(toggle);
    controls.appendChild(colorInput);
    controls.appendChild(reset);
    document.body.appendChild(controls);
  })();
});

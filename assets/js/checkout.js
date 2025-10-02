document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('checkoutForm');
  var result = document.getElementById('result');

  function formatCurrency(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var email = form.email.value.trim();
    var valor = parseFloat(form.valor.value) || 0;
    var recorrente = form.recorrente.value;

    // Basic validation
    if (!nome || !email || valor <= 0) {
      result.innerHTML = '<div class="notice notice-error">Preencha todos os campos corretamente.</div>';
      return;
    }

    // Show processing state
    result.innerHTML = '<div class="notice notice-info">Processando pagamento...&nbsp;<span class="dot">.</span></div>';
    var dots = 0;
    var interval = setInterval(function () {
      dots = (dots + 1) % 4;
      var span = result.querySelector('.dot');
      if (span) span.textContent = '.'.repeat(dots);
    }, 400);

    // Simulate async payment processing
    setTimeout(function () {
      clearInterval(interval);

      // Simulate success/failure randomly (90% success)
      var success = Math.random() < 0.9;
      if (success) {
        result.innerHTML = '<div class="notice notice-success">Obrigado, ' + escapeHtml(nome) + '!\nSua doação de ' + formatCurrency(valor) + ' foi recebida.\nEnviaremos um recibo para ' + escapeHtml(email) + '.</div>';
        // Redirect to a thank-you page after a short delay, passing sanitized params
        setTimeout(function(){
          // Persist donation to localStorage (simple demo storage)
          try {
            var storeKey = 'plataforma_doacoes';
            var existing = JSON.parse(localStorage.getItem(storeKey) || '[]');
            var record = {
              id: 'd_' + Date.now(),
              nome: nome,
              email: email,
              valor: Number(valor),
              recorrente: recorrente,
              ts: Date.now()
            };
            existing.unshift(record);
            // keep only last 50
            if (existing.length > 50) existing = existing.slice(0,50);
            localStorage.setItem(storeKey, JSON.stringify(existing));
          } catch (err) {
            // ignore storage errors
            console.warn('Could not save donation to localStorage', err);
          }

          var params = new URLSearchParams();
          params.set('nome', nome);
          params.set('valor', valor.toString());
          params.set('recorrente', recorrente);
          window.location.href = 'obrigado.html?' + params.toString();
        }, 1800);
      } else {
        result.innerHTML = '<div class="notice notice-error">Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.</div>';
      }

      // Reset form (optional)
      form.reset();
    }, 1800 + Math.random() * 1200);
  });

  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
  }
});
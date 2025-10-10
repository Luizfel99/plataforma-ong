/**
 * ============================================================================
 * SISTEMA DE COMPONENTES DE FEEDBACK - JAVASCRIPT
 * Atividade 2: CSS3 Avançado com Design System Profissional
 * ============================================================================
 */

class FeedbackSystem {
  constructor() {
    this.toastContainer = null;
    this.toastCounter = 0;
    this.init();
  }

  init() {
    this.createToastContainer();
    this.bindEvents();
  }

  /**
   * ========== TOAST SYSTEM ==========
   */
  
  createToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container top-right';
      this.toastContainer.id = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  }

  showToast(options = {}) {
    const {
      type = 'info',
      title = 'Notificação',
      message = '',
      duration = 5000,
      position = 'top-right',
      persistent = false,
      actions = []
    } = options;

    // Muda posição do container se necessário
    if (this.toastContainer.className !== `toast-container ${position}`) {
      this.toastContainer.className = `toast-container ${position}`;
    }

    const toastId = `toast-${++this.toastCounter}`;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = toastId;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    let actionsHtml = '';
    if (actions.length > 0) {
      actionsHtml = `
        <div class="toast-actions">
          ${actions.map(action => `
            <button class="toast-action-btn" onclick="${action.handler}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-title">
          <span class="toast-icon">${iconMap[type]}</span>
          ${title}
        </div>
        <button class="toast-close" onclick="feedbackSystem.hideToast('${toastId}')" aria-label="Fechar">
          ✕
        </button>
      </div>
      <div class="toast-body">
        ${message}
        ${actionsHtml}
      </div>
      ${!persistent ? '<div class="toast-progress"></div>' : ''}
    `;

    this.toastContainer.appendChild(toast);

    // Anima entrada
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Remove automaticamente se não for persistente
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.hideToast(toastId);
      }, duration);
    }

    return toastId;
  }

  hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  hideAllToasts() {
    const toasts = this.toastContainer.querySelectorAll('.toast');
    toasts.forEach(toast => {
      this.hideToast(toast.id);
    });
  }

  // Métodos de conveniência para diferentes types de toast
  showSuccess(title, message, options = {}) {
    return this.showToast({ ...options, type: 'success', title, message });
  }

  showError(title, message, options = {}) {
    return this.showToast({ ...options, type: 'error', title, message });
  }

  showWarning(title, message, options = {}) {
    return this.showToast({ ...options, type: 'warning', title, message });
  }

  showInfo(title, message, options = {}) {
    return this.showToast({ ...options, type: 'info', title, message });
  }

  /**
   * ========== MODAL SYSTEM ==========
   */

  showModal(options = {}) {
    const {
      title = 'Modal',
      content = '',
      size = 'md',
      closable = true,
      backdrop = true,
      keyboard = true,
      actions = [],
      onShow = null,
      onHide = null
    } = options;

    const modalId = `modal-${Date.now()}`;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = modalId;

    let actionsHtml = '';
    if (actions.length > 0) {
      actionsHtml = `
        <div class="modal-footer">
          ${actions.map(action => `
            <button class="btn ${action.class || 'btn-secondary'}" 
                    onclick="${action.handler}" 
                    ${action.id ? `id="${action.id}"` : ''}>
              ${action.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          ${closable ? `
            <button class="modal-close" onclick="feedbackSystem.hideModal('${modalId}')" aria-label="Fechar">
              ✕
            </button>
          ` : ''}
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${actionsHtml}
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    if (backdrop) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal(modalId);
        }
      });
    }

    if (keyboard) {
      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          this.hideModal(modalId);
          document.removeEventListener('keydown', keyHandler);
        }
      };
      document.addEventListener('keydown', keyHandler);
    }

    // Anima entrada
    setTimeout(() => {
      modal.classList.add('show');
      if (onShow) onShow(modalId);
    }, 10);

    // Previne scroll do body
    document.body.style.overflow = 'hidden';

    return modalId;
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        // Restaura scroll do body se não há outros modais
        if (!document.querySelector('.modal-overlay.show')) {
          document.body.style.overflow = '';
        }
      }, 300);
    }
  }

  /**
   * ========== ALERT SYSTEM ==========
   */

  createAlert(options = {}) {
    const {
      type = 'info',
      title = '',
      message = '',
      dismissible = true,
      size = '',
      actions = [],
      container = null
    } = options;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} ${size ? `alert-${size}` : ''} ${dismissible ? 'alert-dismissible' : ''}`;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    let actionsHtml = '';
    if (actions.length > 0) {
      actionsHtml = `
        <div class="alert-actions">
          ${actions.map(action => `
            <button class="alert-action-btn" onclick="${action.handler}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    alert.innerHTML = `
      <div class="alert-icon">${iconMap[type]}</div>
      <div class="alert-content">
        ${title ? `<div class="alert-title">${title}</div>` : ''}
        <div class="alert-description">${message}</div>
        ${actionsHtml}
      </div>
      ${dismissible ? `
        <button class="alert-close" onclick="this.closest('.alert').remove()" aria-label="Fechar">
          ✕
        </button>
      ` : ''}
    `;

    if (container) {
      container.appendChild(alert);
    }

    return alert;
  }

  /**
   * ========== LOADING STATES ==========
   */

  showLoading(element, type = 'spinner') {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.disabled = true;

    let loadingContent = '';
    switch (type) {
      case 'spinner':
        loadingContent = '<span class="loading-spinner"></span>';
        break;
      case 'dots':
        loadingContent = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        break;
      case 'pulse':
        element.classList.add('loading-pulse');
        return;
    }

    element.innerHTML = loadingContent;
  }

  hideLoading(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
      element.innerHTML = originalContent;
      element.disabled = false;
      element.classList.remove('loading-pulse');
      delete element.dataset.originalContent;
    }
  }

  /**
   * ========== PROGRESS SYSTEM ==========
   */

  updateProgress(progressElement, percentage) {
    const progressBar = progressElement.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
  }

  updateCircularProgress(circleElement, percentage) {
    const progressFill = circleElement.querySelector('.progress-fill');
    const progressText = circleElement.querySelector('.progress-circle-text');
    
    if (progressFill) {
      const circumference = 251.2; // 2 * PI * 40 (raio)
      const offset = circumference - (percentage / 100) * circumference;
      progressFill.style.strokeDashoffset = offset;
    }
    
    if (progressText) {
      progressText.textContent = `${Math.round(percentage)}%`;
    }
  }

  /**
   * ========== NOTIFICATION BADGE ==========
   */

  updateBadge(badgeElement, count) {
    badgeElement.setAttribute('data-count', count);
    if (count > 0) {
      badgeElement.classList.add('has-notification');
    } else {
      badgeElement.classList.remove('has-notification');
    }
  }

  /**
   * ========== EVENT BINDINGS ==========
   */

  bindEvents() {
    // Auto-dismiss alerts
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('alert-close')) {
        const alert = e.target.closest('.alert');
        if (alert) {
          alert.style.animation = 'var(--animation-scale-out)';
          setTimeout(() => alert.remove(), 200);
        }
      }
    });

    // Auto-hide toasts on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pausa todos os timers de toast quando a página não está visível
        const toasts = document.querySelectorAll('.toast .toast-progress');
        toasts.forEach(progress => {
          progress.style.animationPlayState = 'paused';
        });
      } else {
        // Retoma os timers
        const toasts = document.querySelectorAll('.toast .toast-progress');
        toasts.forEach(progress => {
          progress.style.animationPlayState = 'running';
        });
      }
    });
  }

  /**
   * ========== UTILITY METHODS ==========
   */

  // Método para demonstrar todos os componentes
  demo() {
    // Demonstra toasts
    this.showSuccess('Sucesso!', 'Operação realizada com sucesso');
    setTimeout(() => this.showError('Erro!', 'Algo deu errado'), 1000);
    setTimeout(() => this.showWarning('Atenção!', 'Verifique os dados'), 2000);
    setTimeout(() => this.showInfo('Informação', 'Nova atualização disponível'), 3000);

    // Demonstra modal
    setTimeout(() => {
      this.showModal({
        title: 'Confirmação',
        content: '<p>Deseja realmente excluir este item?</p>',
        actions: [
          {
            label: 'Cancelar',
            class: 'btn-secondary',
            handler: `feedbackSystem.hideModal(this.closest('.modal-overlay').id)`
          },
          {
            label: 'Excluir',
            class: 'btn-danger',
            handler: `feedbackSystem.hideModal(this.closest('.modal-overlay').id); feedbackSystem.showSuccess('Excluído!', 'Item removido com sucesso');`
          }
        ]
      });
    }, 4000);
  }
}

// Inicializa o sistema globalmente
const feedbackSystem = new FeedbackSystem();

// Export para módulos ES6 se disponível
if (typeof window !== 'undefined') {
  window.FeedbackSystem = FeedbackSystem;
  window.feedbackSystem = feedbackSystem;
}

/**
 * ========== EXEMPLOS DE USO ==========
 */

// Exemplos de como usar o sistema:

/*
// Toast simples
feedbackSystem.showSuccess('Sucesso!', 'Dados salvos com sucesso');

// Toast com ações
feedbackSystem.showInfo('Nova mensagem', 'Você tem uma nova mensagem', {
  actions: [
    { label: 'Ver', handler: 'abrirMensagem()' },
    { label: 'Ignorar', handler: 'ignorarMensagem()' }
  ]
});

// Modal com formulário
feedbackSystem.showModal({
  title: 'Editar Perfil',
  content: `
    <form id="editForm">
      <div class="form-group">
        <label>Nome:</label>
        <input type="text" class="form-control" value="João Silva">
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" class="form-control" value="joao@email.com">
      </div>
    </form>
  `,
  actions: [
    { label: 'Cancelar', class: 'btn-secondary', handler: 'feedbackSystem.hideModal(this.closest(".modal-overlay").id)' },
    { label: 'Salvar', class: 'btn-primary', handler: 'salvarPerfil()' }
  ]
});

// Loading em botão
const botao = document.getElementById('meuBotao');
feedbackSystem.showLoading(botao);
setTimeout(() => feedbackSystem.hideLoading(botao), 3000);

// Progress bar
const progress = document.getElementById('meuProgress');
let percent = 0;
const interval = setInterval(() => {
  percent += 10;
  feedbackSystem.updateProgress(progress, percent);
  if (percent >= 100) clearInterval(interval);
}, 500);
*/
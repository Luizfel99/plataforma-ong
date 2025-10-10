/**
 * ============================================================================
 * SISTEMA DE FORMULÁRIOS AVANÇADOS - JAVASCRIPT
 * Atividade 2: CSS3 Avançado com Design System Profissional
 * ============================================================================
 */

class FormSystem {
  constructor() {
    this.validators = new Map();
    this.currentStep = 0;
    this.totalSteps = 0;
    this.init();
  }

  init() {
    this.setupValidation();
    this.setupMultiStepForms();
    this.setupFileUploads();
    this.setupCustomSelects();
    this.setupAutoResize();
    this.setupFormEffects();
    this.bindEvents();
  }

  /**
   * ========== VALIDATION SYSTEM ==========
   */
  
  setupValidation() {
    // Validation rules
    this.validators.set('required', {
      validate: (value) => value && value.trim() !== '',
      message: 'Este campo é obrigatório'
    });

    this.validators.set('email', {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Por favor, insira um email válido'
    });

    this.validators.set('minLength', {
      validate: (value, min) => value && value.length >= min,
      message: (min) => `Mínimo de ${min} caracteres`
    });

    this.validators.set('maxLength', {
      validate: (value, max) => !value || value.length <= max,
      message: (max) => `Máximo de ${max} caracteres`
    });

    this.validators.set('pattern', {
      validate: (value, pattern) => new RegExp(pattern).test(value),
      message: 'Formato inválido'
    });

    this.validators.set('phone', {
      validate: (value) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value),
      message: 'Formato: (11) 99999-9999'
    });

    this.validators.set('cpf', {
      validate: (value) => this.validateCPF(value),
      message: 'CPF inválido'
    });

    this.validators.set('cnpj', {
      validate: (value) => this.validateCNPJ(value),
      message: 'CNPJ inválido'
    });

    this.validators.set('password', {
      validate: (value) => {
        const hasLength = value && value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
      },
      message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo especial'
    });

    this.validators.set('confirmPassword', {
      validate: (value, originalPassword) => value === originalPassword,
      message: 'As senhas não coincidem'
    });
  }

  validateField(field) {
    const value = field.value;
    const rules = field.dataset.validate ? field.dataset.validate.split('|') : [];
    const errors = [];

    // Remove previous validation states
    field.classList.remove('is-valid', 'is-invalid');
    this.hideFeedback(field);

    // Apply validation rules
    for (const rule of rules) {
      const [ruleName, param] = rule.split(':');
      const validator = this.validators.get(ruleName);
      
      if (validator) {
        let isValid = false;
        
        if (param) {
          isValid = validator.validate(value, param);
        } else if (ruleName === 'confirmPassword') {
          const passwordField = document.querySelector('[data-validate*="password"]:not([data-validate*="confirmPassword"])');
          isValid = validator.validate(value, passwordField ? passwordField.value : '');
        } else {
          isValid = validator.validate(value);
        }

        if (!isValid) {
          const message = typeof validator.message === 'function' 
            ? validator.message(param)
            : validator.message;
          errors.push(message);
        }
      }
    }

    // Apply validation state
    if (errors.length > 0) {
      field.classList.add('is-invalid');
      this.showFeedback(field, errors[0], 'invalid');
      return false;
    } else if (rules.length > 0) {
      field.classList.add('is-valid');
      this.showFeedback(field, 'Campo válido', 'valid');
      return true;
    }

    return true;
  }

  showFeedback(field, message, type) {
    let feedback = field.parentNode.querySelector(`.${type}-feedback`);
    
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = `form-feedback ${type}-feedback`;
      field.parentNode.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.classList.add('show');
  }

  hideFeedback(field) {
    const feedbacks = field.parentNode.querySelectorAll('.form-feedback');
    feedbacks.forEach(feedback => {
      feedback.classList.remove('show');
    });
  }

  validateForm(form) {
    const fields = form.querySelectorAll('[data-validate]');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * ========== MULTI-STEP FORMS ==========
   */
  
  setupMultiStepForms() {
    const multiStepForms = document.querySelectorAll('.multi-step-form');
    
    multiStepForms.forEach(form => {
      const steps = form.querySelectorAll('.form-step');
      const progressSteps = form.querySelectorAll('.form-progress-step');
      const nextBtns = form.querySelectorAll('[data-next-step]');
      const prevBtns = form.querySelectorAll('[data-prev-step]');
      
      this.totalSteps = steps.length;
      
      // Initialize first step
      if (steps.length > 0) {
        steps[0].classList.add('active');
        if (progressSteps.length > 0) {
          progressSteps[0].classList.add('active');
        }
      }

      // Next step handlers
      nextBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Validate current step
          const currentStepElement = steps[this.currentStep];
          const isStepValid = this.validateForm(currentStepElement);
          
          if (isStepValid && this.currentStep < this.totalSteps - 1) {
            this.goToStep(this.currentStep + 1, steps, progressSteps, 'next');
          } else if (!isStepValid) {
            this.showStepError('Por favor, corrija os erros antes de continuar');
          }
        });
      });

      // Previous step handlers
      prevBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1, steps, progressSteps, 'prev');
          }
        });
      });
    });
  }

  goToStep(stepIndex, steps, progressSteps, direction) {
    // Hide current step
    steps[this.currentStep].classList.remove('active');
    if (progressSteps[this.currentStep]) {
      progressSteps[this.currentStep].classList.remove('active');
    }

    // Mark previous steps as completed
    if (direction === 'next' && progressSteps[this.currentStep]) {
      progressSteps[this.currentStep].classList.add('completed');
    }

    // Show new step
    this.currentStep = stepIndex;
    steps[this.currentStep].classList.add('active');
    
    // Add animation class
    if (direction === 'next') {
      steps[this.currentStep].classList.add('slide-in-right');
    } else {
      steps[this.currentStep].classList.add('slide-in-left');
    }

    // Update progress
    if (progressSteps[this.currentStep]) {
      progressSteps[this.currentStep].classList.add('active');
    }

    // Remove animation class after animation
    setTimeout(() => {
      steps[this.currentStep].classList.remove('slide-in-right', 'slide-in-left');
    }, 500);

    // Update form navigation buttons
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    const prevBtns = document.querySelectorAll('[data-prev-step]');
    const nextBtns = document.querySelectorAll('[data-next-step]');
    const submitBtns = document.querySelectorAll('[type="submit"]');

    // Show/hide previous button
    prevBtns.forEach(btn => {
      btn.style.display = this.currentStep === 0 ? 'none' : 'inline-flex';
    });

    // Show next or submit button
    nextBtns.forEach(btn => {
      btn.style.display = this.currentStep === this.totalSteps - 1 ? 'none' : 'inline-flex';
    });

    submitBtns.forEach(btn => {
      btn.style.display = this.currentStep === this.totalSteps - 1 ? 'inline-flex' : 'none';
    });
  }

  showStepError(message) {
    // You can integrate with your toast/alert system here
    if (window.feedbackSystem) {
      window.feedbackSystem.showError('Erro na validação', message);
    } else {
      alert(message);
    }
  }

  /**
   * ========== FILE UPLOAD ==========
   */
  
  setupFileUploads() {
    const fileUploads = document.querySelectorAll('.file-upload');
    
    fileUploads.forEach(upload => {
      const input = upload.querySelector('.file-upload-input');
      const area = upload.querySelector('.file-upload-area');
      const fileList = upload.querySelector('.file-list') || this.createFileList(upload);
      
      // Click to select files
      area.addEventListener('click', () => input.click());
      
      // Drag and drop
      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
      });
      
      area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
      });
      
      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files, fileList, input);
      });
      
      // File input change
      input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        this.handleFiles(files, fileList, input);
      });
    });
  }

  createFileList(upload) {
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    upload.appendChild(fileList);
    return fileList;
  }

  handleFiles(files, fileList, input) {
    files.forEach(file => {
      this.addFileToList(file, fileList);
    });
  }

  addFileToList(file, fileList) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileSize = this.formatFileSize(file.size);
    const fileIcon = this.getFileIcon(file.type);
    
    fileItem.innerHTML = `
      <div class="file-info">
        <div class="file-icon">${fileIcon}</div>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${fileSize}</div>
        </div>
      </div>
      <button type="button" class="file-remove" title="Remover arquivo">
        ✕
      </button>
    `;
    
    // Remove file handler
    const removeBtn = fileItem.querySelector('.file-remove');
    removeBtn.addEventListener('click', () => {
      fileItem.remove();
    });
    
    fileList.appendChild(fileItem);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    return '📄';
  }

  /**
   * ========== CUSTOM SELECT ==========
   */
  
  setupCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(select => {
      const trigger = select.querySelector('.custom-select-trigger');
      const dropdown = select.querySelector('.custom-select-dropdown');
      const options = dropdown.querySelectorAll('.custom-select-option');
      const hiddenInput = select.querySelector('input[type="hidden"]') || this.createHiddenInput(select);
      
      let highlightedIndex = -1;
      
      // Toggle dropdown
      trigger.addEventListener('click', () => {
        const isOpen = select.classList.contains('open');
        this.closeAllSelects();
        if (!isOpen) {
          select.classList.add('open');
          this.focusSelect(select);
        }
      });
      
      // Option selection
      options.forEach((option, index) => {
        option.addEventListener('click', () => {
          this.selectOption(option, trigger, hiddenInput, select);
          select.classList.remove('open');
        });
        
        option.addEventListener('mouseenter', () => {
          this.highlightOption(options, index);
          highlightedIndex = index;
        });
      });
      
      // Keyboard navigation
      select.addEventListener('keydown', (e) => {
        if (!select.classList.contains('open')) return;
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
            this.highlightOption(options, highlightedIndex);
            break;
          case 'ArrowUp':
            e.preventDefault();
            highlightedIndex = Math.max(highlightedIndex - 1, 0);
            this.highlightOption(options, highlightedIndex);
            break;
          case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0) {
              options[highlightedIndex].click();
            }
            break;
          case 'Escape':
            select.classList.remove('open');
            break;
        }
      });
    });
    
    // Close selects when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select')) {
        this.closeAllSelects();
      }
    });
  }

  createHiddenInput(select) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = select.dataset.name || 'select';
    select.appendChild(input);
    return input;
  }

  selectOption(option, trigger, hiddenInput, select) {
    // Update UI
    trigger.querySelector('.custom-select-text').textContent = option.textContent;
    
    // Remove previous selection
    select.querySelectorAll('.custom-select-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    // Mark as selected
    option.classList.add('selected');
    
    // Update hidden input
    hiddenInput.value = option.dataset.value || option.textContent;
    
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    hiddenInput.dispatchEvent(changeEvent);
  }

  highlightOption(options, index) {
    options.forEach(opt => opt.classList.remove('highlighted'));
    if (index >= 0 && options[index]) {
      options[index].classList.add('highlighted');
      options[index].scrollIntoView({ block: 'nearest' });
    }
  }

  focusSelect(select) {
    select.tabIndex = -1;
    select.focus();
  }

  closeAllSelects() {
    document.querySelectorAll('.custom-select.open').forEach(select => {
      select.classList.remove('open');
    });
  }

  /**
   * ========== AUTO RESIZE TEXTAREA ==========
   */
  
  setupAutoResize() {
    const autoResizeTextareas = document.querySelectorAll('.form-textarea.auto-resize');
    
    autoResizeTextareas.forEach(textarea => {
      // Set initial height
      this.adjustTextareaHeight(textarea);
      
      // Adjust on input
      textarea.addEventListener('input', () => {
        this.adjustTextareaHeight(textarea);
      });
    });
  }

  adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  /**
   * ========== FORM EFFECTS ==========
   */
  
  setupFormEffects() {
    // Floating labels
    const floatingInputs = document.querySelectorAll('.form-floating .form-control');
    floatingInputs.forEach(input => {
      // Initial state check
      this.updateFloatingLabel(input);
      
      input.addEventListener('blur', () => this.updateFloatingLabel(input));
      input.addEventListener('focus', () => this.updateFloatingLabel(input));
      input.addEventListener('input', () => this.updateFloatingLabel(input));
    });

    // Form field animations
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
      control.addEventListener('focus', () => {
        control.parentNode.classList.add('focused');
      });
      
      control.addEventListener('blur', () => {
        control.parentNode.classList.remove('focused');
      });
    });
  }

  updateFloatingLabel(input) {
    const hasValue = input.value && input.value.trim() !== '';
    const label = input.nextElementSibling;
    
    if (label && label.classList.contains('form-label')) {
      if (hasValue || document.activeElement === input) {
        label.classList.add('floated');
      } else {
        label.classList.remove('floated');
      }
    }
  }

  /**
   * ========== EVENT BINDINGS ==========
   */
  
  bindEvents() {
    // Real-time validation
    document.addEventListener('input', (e) => {
      if (e.target.matches('[data-validate]')) {
        // Debounce validation
        clearTimeout(e.target.validationTimeout);
        e.target.validationTimeout = setTimeout(() => {
          this.validateField(e.target);
        }, 300);
      }
    });
    
    // Form submission
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.matches('form[data-validate-form]')) {
        e.preventDefault();
        
        const isValid = this.validateForm(form);
        if (isValid) {
          this.submitForm(form);
        } else {
          this.focusFirstInvalidField(form);
        }
      }
    });

    // Format inputs
    document.addEventListener('input', (e) => {
      const target = e.target;
      const format = target.dataset.format;
      
      if (format) {
        target.value = this.formatInput(target.value, format);
      }
    });

    // Password visibility toggle
    document.addEventListener('click', (e) => {
      if (e.target.matches('.password-toggle')) {
        const input = e.target.previousElementSibling;
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        e.target.textContent = type === 'password' ? '👁️' : '🙈';
      }
    });
  }

  /**
   * ========== UTILITY METHODS ==========
   */
  
  formatInput(value, format) {
    switch (format) {
      case 'phone':
        return value.replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
      
      case 'cpf':
        return value.replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      
      case 'cnpj':
        return value.replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      
      case 'cep':
        return value.replace(/\D/g, '')
          .replace(/(\d{5})(\d)/, '$1-$2');
      
      default:
        return value;
    }
  }

  validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }

  validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(cnpj.charAt(13));
  }

  submitForm(form) {
    // Add loading state to submit button
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn && window.feedbackSystem) {
      window.feedbackSystem.showLoading(submitBtn);
    }
    
    // Simulate form submission
    setTimeout(() => {
      if (submitBtn && window.feedbackSystem) {
        window.feedbackSystem.hideLoading(submitBtn);
        window.feedbackSystem.showSuccess('Sucesso!', 'Formulário enviado com sucesso');
      }
      
      // Reset form if needed
      if (form.dataset.resetOnSubmit === 'true') {
        form.reset();
        this.resetValidationStates(form);
      }
    }, 2000);
  }

  resetValidationStates(form) {
    const fields = form.querySelectorAll('.form-control');
    fields.forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');
      this.hideFeedback(field);
    });
  }

  focusFirstInvalidField(form) {
    const firstInvalid = form.querySelector('.form-control.is-invalid');
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * ========== PUBLIC API ==========
   */
  
  // Programmatically validate a field
  validateFieldById(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? this.validateField(field) : false;
  }

  // Go to specific step in multi-step form
  goToStepById(formId, stepIndex) {
    const form = document.getElementById(formId);
    if (form) {
      const steps = form.querySelectorAll('.form-step');
      const progressSteps = form.querySelectorAll('.form-progress-step');
      if (stepIndex >= 0 && stepIndex < steps.length) {
        this.goToStep(stepIndex, steps, progressSteps, stepIndex > this.currentStep ? 'next' : 'prev');
      }
    }
  }

  // Reset form
  resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      this.resetValidationStates(form);
      this.currentStep = 0;
      this.updateNavigationButtons();
    }
  }
}

// Initialize the form system
const formSystem = new FormSystem();

// Export for modules
if (typeof window !== 'undefined') {
  window.FormSystem = FormSystem;
  window.formSystem = formSystem;
}

/**
 * ========== EXEMPLOS DE USO ==========
 */

/*
// Validar campo específico
formSystem.validateFieldById('email-field');

// Ir para step específico
formSystem.goToStepById('multi-step-form', 2);

// Resetar formulário
formSystem.resetForm('contact-form');

// HTML de exemplo:
<form id="contact-form" data-validate-form>
  <div class="form-group">
    <label class="form-label required">Email</label>
    <input 
      type="email" 
      class="form-control" 
      data-validate="required|email"
      placeholder="seu@email.com"
    >
  </div>
  
  <div class="form-group">
    <label class="form-label required">Senha</label>
    <input 
      type="password" 
      class="form-control" 
      data-validate="required|password"
    >
  </div>
  
  <button type="submit" class="btn btn-primary">Enviar</button>
</form>
*/
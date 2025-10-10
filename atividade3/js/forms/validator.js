/**
 * VALIDATOR.JS - SISTEMA AVANÇADO DE VALIDAÇÃO DE FORMULÁRIOS
 * Sistema de verificação de consistência de dados com avisos ao usuário
 */

export class FormValidator {
    constructor(options = {}) {
        this.options = {
            realTimeValidation: true,
            showInlineErrors: true,
            focusFirstError: true,
            validateOnSubmit: true,
            validateOnBlur: true,
            validateOnInput: false,
            debounceTime: 300,
            ...options
        };
        
        this.forms = new Map();
        this.validationRules = new Map();
        this.customValidators = new Map();
        this.errorMessages = new Map();
        
        this.initializeDefaultValidators();
        this.initializeErrorMessages();
        
        console.log('✅ FormValidator inicializado');
    }

    /**
     * Inicializar validadores padrão
     */
    initializeDefaultValidators() {
        // Validador de email
        this.addCustomValidator('email', (value) => {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            return emailRegex.test(value);
        });

        // Validador de CPF
        this.addCustomValidator('cpf', (value) => {
            return this.validateCPF(value);
        });

        // Validador de CNPJ
        this.addCustomValidator('cnpj', (value) => {
            return this.validateCNPJ(value);
        });

        // Validador de telefone brasileiro
        this.addCustomValidator('phone', (value) => {
            const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
            return phoneRegex.test(value.replace(/\D/g, ''));
        });

        // Validador de CEP
        this.addCustomValidator('cep', (value) => {
            const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
            return cepRegex.test(value);
        });

        // Validador de data
        this.addCustomValidator('date', (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
        });

        // Validador de idade mínima
        this.addCustomValidator('minAge', (value, minAge) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age >= minAge;
        });

        // Validador de força de senha
        this.addCustomValidator('passwordStrength', (value) => {
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumbers = /\d/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            
            return value.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecial;
        });

        // Validador de confirmação de senha
        this.addCustomValidator('confirmPassword', (value, originalPassword) => {
            return value === originalPassword;
        });

        // Validador de URL
        this.addCustomValidator('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });
    }

    /**
     * Inicializar mensagens de erro padrão
     */
    initializeErrorMessages() {
        this.errorMessages.set('required', 'Este campo é obrigatório');
        this.errorMessages.set('email', 'Digite um e-mail válido');
        this.errorMessages.set('cpf', 'Digite um CPF válido');
        this.errorMessages.set('cnpj', 'Digite um CNPJ válido');
        this.errorMessages.set('phone', 'Digite um telefone válido (ex: (11) 99999-9999)');
        this.errorMessages.set('cep', 'Digite um CEP válido (ex: 12345-678)');
        this.errorMessages.set('date', 'Digite uma data válida');
        this.errorMessages.set('minAge', 'Idade mínima não atendida');
        this.errorMessages.set('passwordStrength', 'Senha deve ter ao menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo');
        this.errorMessages.set('confirmPassword', 'As senhas não coincidem');
        this.errorMessages.set('url', 'Digite uma URL válida');
        this.errorMessages.set('minLength', 'Mínimo de {min} caracteres');
        this.errorMessages.set('maxLength', 'Máximo de {max} caracteres');
        this.errorMessages.set('min', 'Valor mínimo: {min}');
        this.errorMessages.set('max', 'Valor máximo: {max}');
        this.errorMessages.set('pattern', 'Formato inválido');
    }

    /**
     * Registrar formulário para validação
     */
    registerForm(formElement, rules = {}) {
        if (typeof formElement === 'string') {
            formElement = document.querySelector(formElement);
        }

        if (!formElement) {
            throw new Error('Elemento de formulário não encontrado');
        }

        const formId = formElement.id || `form_${Date.now()}`;
        if (!formElement.id) {
            formElement.id = formId;
        }

        // Configurar regras de validação
        this.validationRules.set(formId, rules);

        // Configurar evento de submit
        const submitHandler = (event) => {
            if (this.options.validateOnSubmit) {
                if (!this.validateForm(formId)) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };

        formElement.addEventListener('submit', submitHandler);

        // Configurar validação em tempo real para cada campo
        this.setupRealTimeValidation(formElement, formId);

        // Armazenar referência do formulário
        this.forms.set(formId, {
            element: formElement,
            rules: rules,
            isValid: false,
            errors: new Map(),
            submitHandler
        });

        console.log(`📝 Formulário registrado: ${formId}`);
        return formId;
    }

    /**
     * Configurar validação em tempo real
     */
    setupRealTimeValidation(formElement, formId) {
        if (!this.options.realTimeValidation) return;

        const fields = formElement.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Validação no blur
            if (this.options.validateOnBlur) {
                field.addEventListener('blur', () => {
                    this.validateField(formId, field.name);
                });
            }

            // Validação no input (com debounce)
            if (this.options.validateOnInput) {
                const inputHandler = this.debounce(() => {
                    this.validateField(formId, field.name);
                }, this.options.debounceTime);

                field.addEventListener('input', inputHandler);
            }

            // Configurar máscaras se especificadas
            this.setupFieldMask(field);
        });
    }

    /**
     * Configurar máscara para campos
     */
    setupFieldMask(field) {
        const maskType = field.dataset.mask;
        
        if (!maskType) return;

        field.addEventListener('input', (event) => {
            const value = event.target.value.replace(/\D/g, '');
            let maskedValue = '';

            switch (maskType) {
                case 'cpf':
                    maskedValue = this.applyCPFMask(value);
                    break;
                case 'cnpj':
                    maskedValue = this.applyCNPJMask(value);
                    break;
                case 'phone':
                    maskedValue = this.applyPhoneMask(value);
                    break;
                case 'cep':
                    maskedValue = this.applyCEPMask(value);
                    break;
                default:
                    maskedValue = value;
            }

            event.target.value = maskedValue;
        });
    }

    /**
     * Aplicar máscara de CPF
     */
    applyCPFMask(value) {
        return value
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }

    /**
     * Aplicar máscara de CNPJ
     */
    applyCNPJMask(value) {
        return value
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }

    /**
     * Aplicar máscara de telefone
     */
    applyPhoneMask(value) {
        if (value.length <= 10) {
            return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    }

    /**
     * Aplicar máscara de CEP
     */
    applyCEPMask(value) {
        return value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    /**
     * Validar formulário completo
     */
    validateForm(formId) {
        const form = this.forms.get(formId);
        if (!form) {
            console.error(`❌ Formulário não encontrado: ${formId}`);
            return false;
        }

        const rules = this.validationRules.get(formId) || {};
        let isValid = true;
        const errors = new Map();

        // Validar cada campo
        Object.keys(rules).forEach(fieldName => {
            const fieldErrors = this.validateField(formId, fieldName, false);
            if (fieldErrors.length > 0) {
                isValid = false;
                errors.set(fieldName, fieldErrors);
            }
        });

        // Validações de consistência entre campos
        const consistencyErrors = this.validateConsistency(formId);
        if (consistencyErrors.length > 0) {
            isValid = false;
            consistencyErrors.forEach(error => {
                const existingErrors = errors.get(error.field) || [];
                errors.set(error.field, [...existingErrors, error.message]);
            });
        }

        // Atualizar estado do formulário
        form.isValid = isValid;
        form.errors = errors;

        // Mostrar erros na interface
        this.displayFormErrors(formId, errors);

        // Focar no primeiro campo com erro
        if (!isValid && this.options.focusFirstError) {
            this.focusFirstError(formId);
        }

        // Disparar evento de validação
        this.dispatchValidationEvent(formId, isValid, errors);

        console.log(`📊 Validação do formulário ${formId}:`, isValid ? '✅ Válido' : '❌ Inválido');
        
        return isValid;
    }

    /**
     * Validar campo individual
     */
    validateField(formId, fieldName, showError = true) {
        const form = this.forms.get(formId);
        const rules = this.validationRules.get(formId) || {};
        
        if (!form || !rules[fieldName]) {
            return [];
        }

        const field = form.element.querySelector(`[name="${fieldName}"]`);
        if (!field) {
            return [];
        }

        const value = field.value.trim();
        const fieldRules = rules[fieldName];
        const errors = [];

        // Validação de campo obrigatório
        if (fieldRules.required && !value) {
            errors.push(this.getErrorMessage('required', fieldRules));
        }

        // Se campo está vazio e não é obrigatório, pular outras validações
        if (!value && !fieldRules.required) {
            this.clearFieldError(field);
            return errors;
        }

        // Validações de comprimento
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors.push(this.getErrorMessage('minLength', fieldRules).replace('{min}', fieldRules.minLength));
        }

        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors.push(this.getErrorMessage('maxLength', fieldRules).replace('{max}', fieldRules.maxLength));
        }

        // Validações numéricas
        if (fieldRules.min !== undefined && parseFloat(value) < fieldRules.min) {
            errors.push(this.getErrorMessage('min', fieldRules).replace('{min}', fieldRules.min));
        }

        if (fieldRules.max !== undefined && parseFloat(value) > fieldRules.max) {
            errors.push(this.getErrorMessage('max', fieldRules).replace('{max}', fieldRules.max));
        }

        // Validação por padrão (regex)
        if (fieldRules.pattern) {
            const regex = typeof fieldRules.pattern === 'string' ? new RegExp(fieldRules.pattern) : fieldRules.pattern;
            if (!regex.test(value)) {
                errors.push(this.getErrorMessage('pattern', fieldRules));
            }
        }

        // Validadores customizados
        if (fieldRules.validator) {
            const validators = Array.isArray(fieldRules.validator) ? fieldRules.validator : [fieldRules.validator];
            
            validators.forEach(validatorName => {
                if (this.customValidators.has(validatorName)) {
                    const validator = this.customValidators.get(validatorName);
                    const isValid = validator(value, fieldRules.validatorParams);
                    
                    if (!isValid) {
                        errors.push(this.getErrorMessage(validatorName, fieldRules));
                    }
                }
            });
        }

        // Mostrar erro na interface
        if (showError) {
            if (errors.length > 0) {
                this.showFieldError(field, errors[0]);
            } else {
                this.clearFieldError(field);
            }
        }

        return errors;
    }

    /**
     * Validar consistência entre campos
     */
    validateConsistency(formId) {
        const form = this.forms.get(formId);
        const errors = [];

        if (!form) return errors;

        const formData = new FormData(form.element);
        
        // Validação de confirmação de senha
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');
        
        if (password && confirmPassword && password !== confirmPassword) {
            errors.push({
                field: 'confirm_password',
                message: this.getErrorMessage('confirmPassword')
            });
        }

        // Validação de data de nascimento vs idade
        const birthDate = formData.get('birth_date');
        const age = formData.get('age');
        
        if (birthDate && age) {
            const calculatedAge = this.calculateAge(birthDate);
            if (Math.abs(calculatedAge - parseInt(age)) > 1) {
                errors.push({
                    field: 'age',
                    message: 'Idade não confere com a data de nascimento'
                });
            }
        }

        // Validação de CEP vs cidade/estado (simulado)
        const cep = formData.get('cep');
        const city = formData.get('city');
        const state = formData.get('state');
        
        if (cep && (city || state)) {
            // Aqui seria feita validação com API de CEP
            // Por enquanto, apenas exemplo de estrutura
        }

        return errors;
    }

    /**
     * Mostrar erro em campo específico
     */
    showFieldError(field, message) {
        if (!this.options.showInlineErrors) return;

        // Remover erro anterior
        this.clearFieldError(field);

        // Adicionar classe de erro ao campo
        field.classList.add('error', 'invalid');

        // Criar elemento de erro
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');

        // Inserir elemento de erro
        const container = field.closest('.form-group') || field.parentNode;
        container.appendChild(errorElement);

        // Animar aparição do erro
        setTimeout(() => {
            errorElement.classList.add('show');
        }, 10);
    }

    /**
     * Limpar erro de campo
     */
    clearFieldError(field) {
        field.classList.remove('error', 'invalid');
        field.classList.add('valid');

        const container = field.closest('.form-group') || field.parentNode;
        const errorElement = container.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Mostrar erros do formulário
     */
    displayFormErrors(formId, errors) {
        const form = this.forms.get(formId);
        if (!form) return;

        // Limpar erros anteriores
        const errorElements = form.element.querySelectorAll('.field-error');
        errorElements.forEach(el => el.remove());

        // Remover classes de erro
        const fields = form.element.querySelectorAll('.error, .invalid');
        fields.forEach(field => field.classList.remove('error', 'invalid'));

        // Mostrar novos erros
        errors.forEach((fieldErrors, fieldName) => {
            const field = form.element.querySelector(`[name="${fieldName}"]`);
            if (field && fieldErrors.length > 0) {
                this.showFieldError(field, fieldErrors[0]);
            }
        });
    }

    /**
     * Focar no primeiro campo com erro
     */
    focusFirstError(formId) {
        const form = this.forms.get(formId);
        if (!form) return;

        const firstErrorField = form.element.querySelector('.error, .invalid');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Disparar evento de validação
     */
    dispatchValidationEvent(formId, isValid, errors) {
        const form = this.forms.get(formId);
        if (!form) return;

        const event = new CustomEvent('formValidation', {
            detail: {
                formId,
                isValid,
                errors: Object.fromEntries(errors),
                form: form.element
            }
        });

        form.element.dispatchEvent(event);
    }

    /**
     * Adicionar validador customizado
     */
    addCustomValidator(name, validatorFunction) {
        this.customValidators.set(name, validatorFunction);
    }

    /**
     * Obter mensagem de erro
     */
    getErrorMessage(type, fieldRules = {}) {
        if (fieldRules.message) {
            return fieldRules.message;
        }
        
        return this.errorMessages.get(type) || 'Valor inválido';
    }

    /**
     * Validar CPF
     */
    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        
        return remainder === parseInt(cpf.charAt(10));
    }

    /**
     * Validar CNPJ
     */
    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        let length = cnpj.length - 2;
        let numbers = cnpj.substring(0, length);
        let digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;

        length = length + 1;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return result === parseInt(digits.charAt(1));
    }

    /**
     * Calcular idade a partir da data de nascimento
     */
    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Destruir validator (cleanup)
     */
    destroy() {
        this.forms.forEach((form, formId) => {
            form.element.removeEventListener('submit', form.submitHandler);
        });
        
        this.forms.clear();
        this.validationRules.clear();
        
        console.log('🗑️ FormValidator destruído');
    }
}

// Exportar instância global
export const validator = new FormValidator();
/**
 * FORM-MANAGER.JS - GERENCIADOR DE FORMULÁRIOS
 * Sistema integrado de formulários com validação, máscaras e feedback visual
 */

import { validator } from './validator.js';

export class FormManager {
    constructor() {
        this.forms = new Map();
        this.notifications = null;
        this.loadingStates = new Map();
        
        this.initializeManager();
        console.log('✅ FormManager inicializado');
    }

    /**
     * Inicializar gerenciador
     */
    initializeManager() {
        // Aguardar carregamento do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupForms();
            });
        } else {
            this.setupForms();
        }
    }

    /**
     * Configurar todos os formulários da página
     */
    setupForms() {
        // Formulário de contato
        this.setupContactForm();
        
        // Formulário de voluntariado
        this.setupVolunteerForm();
        
        // Formulário de doação
        this.setupDonationForm();
        
        // Formulários do blog (comentários)
        this.setupBlogForms();
        
        // Formulário de newsletter
        this.setupNewsletterForm();
        
        console.log('📝 Formulários configurados');
    }

    /**
     * Configurar formulário de contato
     */
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        const rules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100,
                message: 'Nome deve ter entre 2 e 100 caracteres'
            },
            email: {
                required: true,
                validator: ['email'],
                message: 'Digite um e-mail válido'
            },
            phone: {
                required: false,
                validator: ['phone'],
                message: 'Digite um telefone válido'
            },
            subject: {
                required: true,
                minLength: 5,
                maxLength: 200,
                message: 'Assunto deve ter entre 5 e 200 caracteres'
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                message: 'Mensagem deve ter entre 10 e 1000 caracteres'
            },
            privacy_policy: {
                required: true,
                message: 'Você deve aceitar a política de privacidade'
            }
        };

        const formId = validator.registerForm(contactForm, rules);
        
        // Configurar submit
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            if (validator.validateForm(formId)) {
                await this.submitContactForm(contactForm);
            }
        });

        // Configurar máscaras
        this.setupFormMasks(contactForm);
        
        this.forms.set('contact', { element: contactForm, id: formId });
        console.log('📧 Formulário de contato configurado');
    }

    /**
     * Configurar formulário de voluntariado
     */
    setupVolunteerForm() {
        const volunteerForm = document.getElementById('volunteer-form');
        if (!volunteerForm) return;

        const rules = {
            full_name: {
                required: true,
                minLength: 3,
                maxLength: 100
            },
            email: {
                required: true,
                validator: ['email']
            },
            phone: {
                required: true,
                validator: ['phone']
            },
            cpf: {
                required: true,
                validator: ['cpf']
            },
            birth_date: {
                required: true,
                validator: ['date', 'minAge'],
                validatorParams: 16,
                message: 'Você deve ter pelo menos 16 anos'
            },
            address: {
                required: true,
                minLength: 10
            },
            cep: {
                required: true,
                validator: ['cep']
            },
            city: {
                required: true,
                minLength: 2
            },
            state: {
                required: true,
                minLength: 2
            },
            availability: {
                required: true
            },
            skills: {
                required: false,
                maxLength: 500
            },
            motivation: {
                required: true,
                minLength: 50,
                maxLength: 1000,
                message: 'Conte-nos sua motivação (mínimo 50 caracteres)'
            },
            terms: {
                required: true,
                message: 'Você deve aceitar os termos de voluntariado'
            }
        };

        const formId = validator.registerForm(volunteerForm, rules);
        
        volunteerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            if (validator.validateForm(formId)) {
                await this.submitVolunteerForm(volunteerForm);
            }
        });

        // Configurar integração CEP
        this.setupCEPIntegration(volunteerForm);
        
        this.setupFormMasks(volunteerForm);
        this.forms.set('volunteer', { element: volunteerForm, id: formId });
        console.log('🤝 Formulário de voluntariado configurado');
    }

    /**
     * Configurar formulário de doação
     */
    setupDonationForm() {
        const donationForm = document.getElementById('donation-form');
        if (!donationForm) return;

        const rules = {
            donor_name: {
                required: true,
                minLength: 2,
                maxLength: 100
            },
            donor_email: {
                required: true,
                validator: ['email']
            },
            donor_phone: {
                required: false,
                validator: ['phone']
            },
            donor_cpf: {
                required: false,
                validator: ['cpf']
            },
            donor_cnpj: {
                required: false,
                validator: ['cnpj']
            },
            donation_amount: {
                required: true,
                min: 5,
                max: 50000,
                message: 'Valor deve estar entre R$ 5,00 e R$ 50.000,00'
            },
            donation_type: {
                required: true
            },
            payment_method: {
                required: true
            },
            project_destination: {
                required: false
            },
            anonymous: {
                required: false
            },
            newsletter: {
                required: false
            }
        };

        const formId = validator.registerForm(donationForm, rules);
        
        donationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            if (validator.validateForm(formId)) {
                await this.submitDonationForm(donationForm);
            }
        });

        // Configurar cálculos dinâmicos
        this.setupDonationCalculations(donationForm);
        
        this.setupFormMasks(donationForm);
        this.forms.set('donation', { element: donationForm, id: formId });
        console.log('💰 Formulário de doação configurado');
    }

    /**
     * Configurar formulários do blog
     */
    setupBlogForms() {
        const commentForms = document.querySelectorAll('.comment-form');
        
        commentForms.forEach((form, index) => {
            const rules = {
                comment_name: {
                    required: true,
                    minLength: 2,
                    maxLength: 50
                },
                comment_email: {
                    required: true,
                    validator: ['email']
                },
                comment_content: {
                    required: true,
                    minLength: 10,
                    maxLength: 500,
                    message: 'Comentário deve ter entre 10 e 500 caracteres'
                }
            };

            const formId = validator.registerForm(form, rules);
            
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                if (validator.validateForm(formId)) {
                    await this.submitCommentForm(form);
                }
            });

            this.forms.set(`comment-${index}`, { element: form, id: formId });
        });

        if (commentForms.length > 0) {
            console.log(`💬 ${commentForms.length} formulários de comentário configurados`);
        }
    }

    /**
     * Configurar formulário de newsletter
     */
    setupNewsletterForm() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        
        newsletterForms.forEach((form, index) => {
            const rules = {
                newsletter_email: {
                    required: true,
                    validator: ['email']
                },
                newsletter_name: {
                    required: false,
                    minLength: 2,
                    maxLength: 50
                }
            };

            const formId = validator.registerForm(form, rules);
            
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                if (validator.validateForm(formId)) {
                    await this.submitNewsletterForm(form);
                }
            });

            this.forms.set(`newsletter-${index}`, { element: form, id: formId });
        });

        if (newsletterForms.length > 0) {
            console.log(`📬 ${newsletterForms.length} formulários de newsletter configurados`);
        }
    }

    /**
     * Configurar máscaras nos formulários
     */
    setupFormMasks(form) {
        // CPF
        const cpfFields = form.querySelectorAll('[data-mask="cpf"]');
        cpfFields.forEach(field => {
            field.setAttribute('maxlength', '14');
            field.setAttribute('placeholder', '000.000.000-00');
        });

        // CNPJ
        const cnpjFields = form.querySelectorAll('[data-mask="cnpj"]');
        cnpjFields.forEach(field => {
            field.setAttribute('maxlength', '18');
            field.setAttribute('placeholder', '00.000.000/0000-00');
        });

        // Telefone
        const phoneFields = form.querySelectorAll('[data-mask="phone"]');
        phoneFields.forEach(field => {
            field.setAttribute('maxlength', '15');
            field.setAttribute('placeholder', '(11) 99999-9999');
        });

        // CEP
        const cepFields = form.querySelectorAll('[data-mask="cep"]');
        cepFields.forEach(field => {
            field.setAttribute('maxlength', '9');
            field.setAttribute('placeholder', '12345-678');
        });
    }

    /**
     * Configurar integração com API de CEP
     */
    setupCEPIntegration(form) {
        const cepField = form.querySelector('[name="cep"]');
        const cityField = form.querySelector('[name="city"]');
        const stateField = form.querySelector('[name="state"]');
        const addressField = form.querySelector('[name="address"]');

        if (!cepField) return;

        cepField.addEventListener('blur', async () => {
            const cep = cepField.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                await this.loadAddressFromCEP(cep, cityField, stateField, addressField);
            }
        });
    }

    /**
     * Carregar endereço a partir do CEP
     */
    async loadAddressFromCEP(cep, cityField, stateField, addressField) {
        try {
            this.showFieldLoading(cityField);
            
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                this.showNotification('CEP não encontrado', 'warning');
                return;
            }

            // Preencher campos
            if (cityField) cityField.value = data.localidade;
            if (stateField) stateField.value = data.uf;
            if (addressField && data.logradouro) {
                addressField.value = `${data.logradouro}, ${data.bairro}`;
            }

            this.showNotification('Endereço carregado automaticamente', 'success');

        } catch (error) {
            console.error('❌ Erro ao buscar CEP:', error);
            this.showNotification('Erro ao buscar CEP', 'error');
        } finally {
            this.hideFieldLoading(cityField);
        }
    }

    /**
     * Configurar cálculos de doação
     */
    setupDonationCalculations(form) {
        const amountField = form.querySelector('[name="donation_amount"]');
        const typeField = form.querySelector('[name="donation_type"]');
        const feeDisplay = form.querySelector('.processing-fee');
        const totalDisplay = form.querySelector('.total-amount');

        if (!amountField) return;

        const calculateFees = () => {
            const amount = parseFloat(amountField.value) || 0;
            const type = typeField?.value || 'single';
            
            let fee = 0;
            if (type === 'recurring') {
                fee = amount * 0.02; // 2% para doações recorrentes
            } else {
                fee = amount * 0.035; // 3.5% para doações únicas
            }

            const total = amount + fee;

            if (feeDisplay) {
                feeDisplay.textContent = `R$ ${fee.toFixed(2)}`;
            }
            
            if (totalDisplay) {
                totalDisplay.textContent = `R$ ${total.toFixed(2)}`;
            }
        };

        amountField.addEventListener('input', calculateFees);
        typeField?.addEventListener('change', calculateFees);
    }

    /**
     * Submeter formulário de contato
     */
    async submitContactForm(form) {
        try {
            this.showFormLoading(form);
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Simular envio
            await this.simulateApiCall(2000);

            // Salvar no localStorage para simulação
            this.saveContactSubmission(data);

            this.showNotification('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
            form.reset();

        } catch (error) {
            console.error('❌ Erro ao enviar contato:', error);
            this.showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
        } finally {
            this.hideFormLoading(form);
        }
    }

    /**
     * Submeter formulário de voluntariado
     */
    async submitVolunteerForm(form) {
        try {
            this.showFormLoading(form);
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            await this.simulateApiCall(3000);

            this.saveVolunteerSubmission(data);

            this.showNotification('Inscrição de voluntariado enviada! Entraremos em contato.', 'success');
            form.reset();

        } catch (error) {
            console.error('❌ Erro ao enviar voluntariado:', error);
            this.showNotification('Erro ao enviar inscrição. Tente novamente.', 'error');
        } finally {
            this.hideFormLoading(form);
        }
    }

    /**
     * Submeter formulário de doação
     */
    async submitDonationForm(form) {
        try {
            this.showFormLoading(form);
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            await this.simulateApiCall(2500);

            this.saveDonationSubmission(data);

            this.showNotification('Doação processada com sucesso! Obrigado pelo apoio.', 'success');
            
            // Redirecionar para página de agradecimento
            setTimeout(() => {
                window.location.href = '#/obrigado';
            }, 2000);

        } catch (error) {
            console.error('❌ Erro ao processar doação:', error);
            this.showNotification('Erro ao processar doação. Tente novamente.', 'error');
        } finally {
            this.hideFormLoading(form);
        }
    }

    /**
     * Submeter formulário de comentário
     */
    async submitCommentForm(form) {
        try {
            this.showFormLoading(form);
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            await this.simulateApiCall(1500);

            this.saveCommentSubmission(data);

            this.showNotification('Comentário enviado! Será analisado antes da publicação.', 'success');
            form.reset();

        } catch (error) {
            console.error('❌ Erro ao enviar comentário:', error);
            this.showNotification('Erro ao enviar comentário. Tente novamente.', 'error');
        } finally {
            this.hideFormLoading(form);
        }
    }

    /**
     * Submeter formulário de newsletter
     */
    async submitNewsletterForm(form) {
        try {
            this.showFormLoading(form);
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            await this.simulateApiCall(1000);

            this.saveNewsletterSubmission(data);

            this.showNotification('Inscrição na newsletter realizada com sucesso!', 'success');
            form.reset();

        } catch (error) {
            console.error('❌ Erro ao inscrever newsletter:', error);
            this.showNotification('Erro ao inscrever na newsletter. Tente novamente.', 'error');
        } finally {
            this.hideFormLoading(form);
        }
    }

    /**
     * Salvar dados no localStorage (simulação)
     */
    saveContactSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem('contact_submissions', JSON.stringify(submissions));
    }

    saveVolunteerSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('volunteer_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now(),
            status: 'pending'
        });
        localStorage.setItem('volunteer_submissions', JSON.stringify(submissions));
    }

    saveDonationSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('donation_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now(),
            status: 'completed'
        });
        localStorage.setItem('donation_submissions', JSON.stringify(submissions));
    }

    saveCommentSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('comment_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now(),
            status: 'pending'
        });
        localStorage.setItem('comment_submissions', JSON.stringify(submissions));
    }

    saveNewsletterSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('newsletter_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem('newsletter_submissions', JSON.stringify(submissions));
    }

    /**
     * Mostrar loading no formulário
     */
    showFormLoading(form) {
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            const originalText = submitButton.textContent;
            submitButton.dataset.originalText = originalText;
            submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando...';
        }

        form.classList.add('submitting');
    }

    /**
     * Esconder loading do formulário
     */
    hideFormLoading(form) {
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.textContent = submitButton.dataset.originalText || 'Enviar';
        }

        form.classList.remove('submitting');
    }

    /**
     * Mostrar loading em campo específico
     */
    showFieldLoading(field) {
        if (!field) return;
        
        field.classList.add('loading');
        field.disabled = true;
    }

    /**
     * Esconder loading de campo
     */
    hideFieldLoading(field) {
        if (!field) return;
        
        field.classList.remove('loading');
        field.disabled = false;
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        // Implementação será feita no sistema de notificações
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Criar notificação visual simples
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    /**
     * Simular chamada de API
     */
    async simulateApiCall(delay = 1000) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Obter dados de submissões
     */
    getSubmissions(type) {
        return JSON.parse(localStorage.getItem(`${type}_submissions`) || '[]');
    }

    /**
     * Limpar todas as submissões
     */
    clearAllSubmissions() {
        const types = ['contact', 'volunteer', 'donation', 'comment', 'newsletter'];
        types.forEach(type => {
            localStorage.removeItem(`${type}_submissions`);
        });
        console.log('🗑️ Todas as submissões foram limpas');
    }

    /**
     * Destruir gerenciador
     */
    destroy() {
        this.forms.clear();
        this.loadingStates.clear();
        console.log('🗑️ FormManager destruído');
    }
}

// Exportar instância global
export const formManager = new FormManager();
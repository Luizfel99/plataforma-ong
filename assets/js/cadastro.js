// Cadastro.js - Funcionalidades específicas para o formulário de cadastro
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do formulário
    const form = document.getElementById('cadastroForm');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const cidadeInput = document.getElementById('cidade');
    const estadoSelect = document.getElementById('estado');
    
    // ========== MÁSCARAS DE INPUT ==========
    
    // Máscara para CPF (000.000.000-00)
    function aplicarMascaraCPF(input) {
        let valor = input.value.replace(/\D/g, '');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = valor;
    }
    
    // Máscara para telefone ((00) 00000-0000)
    function aplicarMascaraTelefone(input) {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length <= 10) {
            // Telefone fixo: (00) 0000-0000
            valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
            valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            // Celular: (00) 00000-0000
            valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
            valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
        }
        input.value = valor;
    }
    
    // Máscara para CEP (00000-000)
    function aplicarMascaraCEP(input) {
        let valor = input.value.replace(/\D/g, '');
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
        input.value = valor;
    }
    
    // Aplicar máscaras nos inputs
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            aplicarMascaraCPF(this);
        });
    }
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            aplicarMascaraTelefone(this);
        });
    }
    
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            aplicarMascaraCEP(this);
        });
        
        // Consulta CEP quando completo
        cepInput.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                consultarCEP(cep);
            }
        });
    }
    
    // ========== VALIDAÇÕES ==========
    
    // Validação de CPF
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        let dv1 = resto < 2 ? 0 : resto;
        
        if (parseInt(cpf.charAt(9)) !== dv1) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        let dv2 = resto < 2 ? 0 : resto;
        
        return parseInt(cpf.charAt(10)) === dv2;
    }
    
    // Consultar CEP via API ViaCEP
    function consultarCEP(cep) {
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        
        // Adicionar loading visual
        cepInput.style.opacity = '0.7';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                cepInput.style.opacity = '1';
                
                if (data.erro) {
                    mostrarErro(cepInput, 'CEP não encontrado');
                    return;
                }
                
                // Preencher campos automaticamente
                if (enderecoInput && data.logradouro) {
                    enderecoInput.value = data.logradouro;
                    limparErro(enderecoInput);
                }
                
                if (cidadeInput && data.localidade) {
                    cidadeInput.value = data.localidade;
                    limparErro(cidadeInput);
                }
                
                if (estadoSelect && data.uf) {
                    estadoSelect.value = data.uf;
                    limparErro(estadoSelect);
                }
                
                // Focar no próximo campo vazio
                if (!enderecoInput.value || enderecoInput.value === data.logradouro) {
                    enderecoInput.focus();
                }
                
                limparErro(cepInput);
            })
            .catch(error => {
                console.error('Erro ao consultar CEP:', error);
                cepInput.style.opacity = '1';
                mostrarErro(cepInput, 'Erro ao consultar CEP. Verifique sua conexão.');
            });
    }
    
    // Funções para mostrar/limpar erros
    function mostrarErro(input, mensagem) {
        const errorElement = document.getElementById(input.id + '-error');
        if (errorElement) {
            errorElement.textContent = mensagem;
            errorElement.style.display = 'block';
        }
        input.classList.add('error');
    }
    
    function limparErro(input) {
        const errorElement = document.getElementById(input.id + '-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        input.classList.remove('error');
    }
    
    // ========== VALIDAÇÃO EM TEMPO REAL ==========
    
    // Validação de CPF em tempo real
    if (cpfInput) {
        cpfInput.addEventListener('blur', function() {
            const cpf = this.value.replace(/\D/g, '');
            if (cpf.length > 0 && !validarCPF(cpf)) {
                mostrarErro(this, 'CPF inválido');
            } else {
                limparErro(this);
            }
        });
    }
    
    // Validação de idade mínima (16 anos)
    const dataNascimentoInput = document.getElementById('dataNascimento');
    if (dataNascimentoInput) {
        dataNascimentoInput.addEventListener('blur', function() {
            const dataNascimento = new Date(this.value);
            const hoje = new Date();
            const idade = hoje.getFullYear() - dataNascimento.getFullYear();
            const mesAtual = hoje.getMonth();
            const mesNascimento = dataNascimento.getMonth();
            
            let idadeReal = idade;
            if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataNascimento.getDate())) {
                idadeReal--;
            }
            
            if (idadeReal < 16) {
                mostrarErro(this, 'Idade mínima de 16 anos');
            } else {
                limparErro(this);
            }
        });
    }
    
    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let formularioValido = true;
            const campos = form.querySelectorAll('input[required], select[required]');
            
            // Validar todos os campos obrigatórios
            campos.forEach(campo => {
                if (!campo.value.trim()) {
                    mostrarErro(campo, 'Este campo é obrigatório');
                    formularioValido = false;
                } else {
                    limparErro(campo);
                }
            });
            
            // Validação específica do CPF
            if (cpfInput && cpfInput.value) {
                const cpf = cpfInput.value.replace(/\D/g, '');
                if (!validarCPF(cpf)) {
                    mostrarErro(cpfInput, 'CPF inválido');
                    formularioValido = false;
                }
            }
            
            // Validação do termo de consentimento
            const termosCheckbox = document.getElementById('termos');
            if (termosCheckbox && !termosCheckbox.checked) {
                alert('Você deve aceitar os termos de uso e política de privacidade para continuar.');
                formularioValido = false;
            }
            
            // Verificar se pelo menos uma área de interesse foi selecionada
            const interessesCheckboxes = document.querySelectorAll('input[name="interesses[]"]:checked');
            if (interessesCheckboxes.length === 0) {
                alert('Selecione pelo menos uma área de interesse.');
                formularioValido = false;
            }
            
            if (formularioValido) {
                // Simular envio do formulário
                const formData = new FormData(form);
                const dados = Object.fromEntries(formData.entries());
                
                // Coletar checkboxes múltiplos
                const interesses = Array.from(interessesCheckboxes).map(cb => cb.value);
                dados.interesses = interesses;
                
                console.log('Dados do formulário:', dados);
                
                // Mostrar mensagem de sucesso
                alert('Cadastro realizado com sucesso! Entraremos em contato em breve.');
                
                // Opcional: limpar formulário
                // form.reset();
            } else {
                // Focar no primeiro campo com erro
                const primeiroErro = form.querySelector('.error');
                if (primeiroErro) {
                    primeiroErro.focus();
                    primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
    
    // ========== MELHORIAS DE UX ==========
    
    // Contador de caracteres para textarea
    const experienciaTextarea = document.getElementById('experiencia');
    if (experienciaTextarea) {
        const maxLength = experienciaTextarea.getAttribute('maxlength');
        const helpText = experienciaTextarea.nextElementSibling;
        
        experienciaTextarea.addEventListener('input', function() {
            const remaining = maxLength - this.value.length;
            helpText.textContent = `${this.value.length}/${maxLength} caracteres`;
            
            if (remaining < 50) {
                helpText.style.color = '#e74c3c';
            } else {
                helpText.style.color = '#666';
            }
        });
    }
    
    // Animação suave para revelar seções ao rolar
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar seções do formulário
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(group);
    });
    
    // Auto-save em localStorage (opcional)
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Carregar dados salvos
        const savedValue = localStorage.getItem(`cadastro_${input.name}`);
        if (savedValue && input.type !== 'checkbox') {
            input.value = savedValue;
        }
        
        // Salvar dados ao digitar
        input.addEventListener('input', function() {
            if (this.type !== 'checkbox') {
                localStorage.setItem(`cadastro_${this.name}`, this.value);
            }
        });
    });
    
    // Limpar localStorage quando formulário for enviado com sucesso
    form.addEventListener('submit', function() {
        inputs.forEach(input => {
            localStorage.removeItem(`cadastro_${input.name}`);
        });
    });
});
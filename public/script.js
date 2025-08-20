const API_BASE_URL = 'http://localhost:3000/carros';

// --- Funções Utilitárias de Formatação ---
function formatPrice(price) {
    if (price === undefined || price === null) return 'Preço não informado';
    // Garante 2 casas decimais para exibição do preço
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

function formatKm(km) {
    if (km === undefined || km === null) return 'KM não informado';
    // Para KM, geralmente não queremos decimais, apenas pontos de milhar
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(km) + ' km';
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR');
}

// --- Funções da API ---
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- Funções de Validação e Feedback ---

let formFields = {};

function initializeFormFields() {
    formFields = {
        nome: { input: document.getElementById('nome'), error: document.getElementById('nome-error') },
        placa: { input: document.getElementById('placa'), error: document.getElementById('placa-error') },
        chassi: { input: document.getElementById('chassi'), error: document.getElementById('chassi-error') },
        especificacao: { input: document.getElementById('especificacao'), error: document.getElementById('especificacao-error') },
        ano: { input: document.getElementById('ano'), error: document.getElementById('ano-error') },
        km: { input: document.getElementById('km'), error: document.getElementById('km-error') },
        preco: { input: document.getElementById('preco'), error: document.getElementById('preco-error') },
        imagens: { input: document.getElementById('imagens'), error: document.getElementById('imagens-error') },
    };
    addValidationListeners();
}

function showFieldError(inputElement, errorElement, message) {
    if (!inputElement || !errorElement) return;
    errorElement.textContent = message;
    inputElement.classList.add('invalid');
    inputElement.setAttribute('aria-invalid', 'true');
}

function clearFieldError(inputElement, errorElement) {
    if (!inputElement || !errorElement) return;
    errorElement.textContent = '';
    inputElement.classList.remove('invalid');
    inputElement.setAttribute('aria-invalid', 'false');
}

// Validação de Chassi
const validateChassi = () => {
    const input = formFields.chassi.input;
    const error = formFields.chassi.error;
    if (!input || !error) return true;

    const chassiValue = input.value.trim().toUpperCase();
    const chassiPattern = /^[A-HJ-NPR-Z0-9]{6}$/;

    if (input.required && chassiValue === '') {
        showFieldError(input, error, 'O campo Chassi é obrigatório.');
        return false;
    }
    if (chassiValue !== '' && !chassiPattern.test(chassiValue)) {
        showFieldError(input, error, 'O chassi deve ter exatamente 6 caracteres alfanuméricos válidos.');
        return false;
    }
    clearFieldError(input, error);
    input.value = chassiValue;
    return true;
};

// Validação de Ano
const validateAno = () => {
    const input = formFields.ano.input;
    const error = formFields.ano.error;
    if (!input || !error) return true;

    const anoValue = input.value.trim();
    const currentYear = new Date().getFullYear();

    if (input.required && anoValue === '') {
        showFieldError(input, error, 'O campo Ano é obrigatório.');
        return false;
    }
    if (anoValue !== '' && (!/^(19|20)\d{2}$/.test(anoValue) || parseInt(anoValue) < 1900 || parseInt(anoValue) > currentYear + 1)) {
        showFieldError(input, error, `Por favor, insira um ano válido com 4 dígitos (entre 1900 e ${currentYear + 1}).`);
        return false;
    }
    clearFieldError(input, error);
    return true;
};

// Formatação de números enquanto o usuário digita
const formatNumberInput = (input, isCurrency = false) => {
    let value = input.value;

    value = value.replace(/[^0-9,.]/g, '');

    if (isCurrency) {
        value = value.replace(/\./g, '');
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }
        if (value.includes(',')) {
            let [integerPart, decimalPart] = value.split(',');
            decimalPart = decimalPart.substring(0, 2);
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            input.value = integerPart + ',' + decimalPart;
        } else {
            input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
    } else {
        value = value.replace(/\./g, '');
        value = value.replace(/,/g, '');
        input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
};

// Validação de Valores Numéricos (Quilometragem e Preço)
const validateNumericField = (input, error, fieldName, allowDecimals, required) => {
    if (!input || !error) return true;

    let value = input.value.trim();

    if (required && value === '') {
        showFieldError(input, error, `O campo ${fieldName} é obrigatório.`);
        return false;
    }

    if (!required && value === '') {
        clearFieldError(input, error);
        return true;
    }

    const cleanedValue = value.replace(/\./g, '').replace(',', '.');

    const numericPattern = allowDecimals ? /^\d+(\.\d{1,2})?$/ : /^\d+$/;

    if (!numericPattern.test(cleanedValue)) {
        showFieldError(input, error, `Por favor, insira um ${fieldName} válido. Use vírgula para decimais (ex: 50.000,50).`);
        return false;
    }

    const numericValue = parseFloat(cleanedValue);

    if (isNaN(numericValue) || numericValue < 0) {
        showFieldError(input, error, `O campo ${fieldName} deve ser um número positivo.`);
        return false;
    }

    if (!allowDecimals && numericValue % 1 !== 0) {
          showFieldError(input, error, `O campo ${fieldName} deve ser um número inteiro.`);
          return false;
    }

    clearFieldError(input, error);
    return true;
};

// Validação de URLs de Imagem
const validateImageUrls = () => {
    const input = formFields.imagens.input;
    const error = formFields.imagens.error;
    if (!input || !error) return true;

    const urls = input.value.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    const imagePattern = /\.(jpeg|jpg|gif|png|webp|svg)$/i;

    for (const url of urls) {
        if (!imagePattern.test(url)) {
            showFieldError(input, error, `A URL '${url}' não parece ser um link direto de imagem.`);
            return false;
        }
    }
    clearFieldError(input, error);
    return true;
};


// Validação de Nome e Placa (apenas obrigatoriedade)
const validateRequiredText = (input, error, fieldName) => {
    if (!input || !error) return true;

    if (input.required && input.value.trim() === '') {
        showFieldError(input, error, `O campo ${fieldName} é obrigatório.`);
        return false;
    }
    clearFieldError(input, error);
    return true;
};

// Validação de Especificação (opcional)
const validateEspecificacao = () => {
    const input = formFields.especificacao.input;
    const error = formFields.especificacao.error;
    if (!input || !error) return true;

    // Campo é opcional, então sempre retorna true
    clearFieldError(input, error);
    return true;
};

// Adiciona event listeners para validação em tempo real
function addValidationListeners() {
    if (formFields.nome && formFields.nome.input) formFields.nome.input.addEventListener('input', () => validateRequiredText(formFields.nome.input, formFields.nome.error, 'Nome/Modelo'));
    if (formFields.placa && formFields.placa.input) formFields.placa.input.addEventListener('input', () => validateRequiredText(formFields.placa.input, formFields.placa.error, 'Placa'));
    if (formFields.chassi && formFields.chassi.input) formFields.chassi.input.addEventListener('input', validateChassi);
    if (formFields.ano && formFields.ano.input) formFields.ano.input.addEventListener('input', validateAno);

    if (formFields.km && formFields.km.input) {
        formFields.km.input.addEventListener('input', () => {
            formatNumberInput(formFields.km.input, false);
            validateNumericField(formFields.km.input, formFields.km.error, 'Quilometragem', false, true);
        });
        formFields.km.input.addEventListener('blur', () => validateNumericField(formFields.km.input, formFields.km.error, 'Quilometragem', false, true));
    }

    if (formFields.preco && formFields.preco.input) {
        formFields.preco.input.addEventListener('input', () => {
            formatNumberInput(formFields.preco.input, true);
            validateNumericField(formFields.preco.input, formFields.preco.error, 'Preço', true, true);
        });
        formFields.preco.input.addEventListener('blur', () => {
            const cleanedValue = formFields.preco.input.value.replace(/\./g, '').replace(',', '.');
            if (!isNaN(parseFloat(cleanedValue)) && cleanedValue.trim() !== '') {
                formFields.preco.input.value = parseFloat(cleanedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            validateNumericField(formFields.preco.input, formFields.preco.error, 'Preço', true, true);
        });
    }

    if (formFields.imagens && formFields.imagens.input) {
        formFields.imagens.input.addEventListener('input', validateImageUrls);
        formFields.imagens.input.addEventListener('blur', validateImageUrls);
    }
}


// Função para validar todo o formulário antes do envio
function validateForm() {
    const isNomeValid = validateRequiredText(formFields.nome.input, formFields.nome.error, 'Nome/Modelo');
    const isPlacaValid = validateRequiredText(formFields.placa.input, formFields.placa.error, 'Placa');
    const isChassiValid = validateChassi();
    const isEspecificacaoValid = validateEspecificacao();
    const isAnoValid = validateAno();
    const isKmValid = validateNumericField(formFields.km.input, formFields.km.error, 'Quilometragem', false, true); // KM deve ser inteiro
    const isPrecoValid = validateNumericField(formFields.preco.input, formFields.preco.error, 'Preço', true, true); // Preço pode ter decimais
    const areImagesValid = validateImageUrls();

    const allFieldsValid = isNomeValid && isPlacaValid && isChassiValid && isEspecificacaoValid && isAnoValid && isKmValid && isPrecoValid && areImagesValid;

    if (!allFieldsValid) {
        console.error('Por favor, preencha todos os campos obrigatórios e corrija os erros.');
        const firstInvalid = document.querySelector('.invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    return allFieldsValid;
}


// --- Lógica de Roteamento de Páginas e Funções Principais ---

// Página inicial - Lista de veículos
if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', loadVehicles);
}

async function loadVehicles() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const vehiclesEl = document.getElementById('vehicles');

    try {
        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (vehiclesEl) vehiclesEl.innerHTML = '';

        const vehicles = await apiRequest(API_BASE_URL);

        if (vehicles && vehicles.length === 0) {
            if (vehiclesEl) {
                vehiclesEl.innerHTML = `
                    <div class="empty-state">
                        <p>Nenhum veículo cadastrado</p>
                        <button onclick="window.location.href='add.html'" class="btn-add">
                            Adicionar primeiro veículo
                        </button>
                    </div>
                `;
            }
        } else if (vehiclesEl) {
            vehiclesEl.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle)).join('');
        }
    } catch (error) {
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Erro ao carregar veículos. Verifique a conexão com a API.';
        }
        console.error('Falha ao carregar veículos:', error);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

// Melhoria na criação do card para lidar com a exibição da imagem e do placeholder
function createVehicleCard(vehicle) {
    const imageUrl = (vehicle.imagens && vehicle.imagens.length > 0)
        ? vehicle.imagens[0]
        : null;

    let imageContent = '<div class="no-image">Sem imagem</div>';

    if (imageUrl) {
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = vehicle.nome;
        imgElement.style.display = 'none'; // Esconde a imagem até que ela carregue

        // Tenta carregar a imagem e adiciona o conteúdo correto ao DOM
        const tempImage = new Image();
        tempImage.onload = () => {
            const cardImageContainer = document.querySelector(`.vehicle-card[data-id="${vehicle._id}"] .vehicle-image-container img`);
            if (cardImageContainer) {
                cardImageContainer.style.display = 'block'; // Mostra a imagem
            }
        };
        tempImage.onerror = () => {
            // Se a imagem falhar ao carregar, o placeholder "Sem imagem" permanece
            const cardImageContainer = document.querySelector(`.vehicle-card[data-id="${vehicle._id}"] .vehicle-image-container`);
            if (cardImageContainer) {
                cardImageContainer.innerHTML = '<div class="no-image">Sem imagem</div>';
            }
        };
        tempImage.src = imageUrl; // Inicia o carregamento

        imageContent = `<img src="${imageUrl}" alt="${vehicle.nome}" style="display: none;">`;
    }

    // Calcula dias no estoque (simulado - você pode ajustar conforme sua lógica de negócio)
    const diasNoEstoque = Math.floor(Math.random() * 30) + 1; // Simulação de 1 a 30 dias

    return `
        <div class="vehicle-card" data-id="${vehicle._id}">
            <!-- Coluna da Imagem -->
            <a href="view.html?id=${vehicle._id}" class="vehicle-image-container">
                ${imageContent}
            </a>

            <!-- Coluna de Informações do Veículo -->
            <div class="vehicle-info">
                <h3>
                    <span>${vehicle.nome.toUpperCase()}</span>
                    <a href="edit.html?id=${vehicle._id}" class="icon-btn edit-icon" title="Editar veículo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4136" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </a>
                </h3>
                <p>${vehicle.chassi || 'Modelo não informado'}</p>
                <p>${vehicle.especificacao || 'Especificação não informada'}</p>
                
                <!-- Ações do veículo -->
                <div class="vehicle-actions-icons">
                    <button class="icon-btn print-icon" title="Imprimir" onclick="printVehicle('${vehicle._id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4136" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>
                    <button class="icon-btn delete-icon" title="Excluir" onclick="deleteVehicle('${vehicle._id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4136" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Coluna de Especificações -->
            <div class="vehicle-specs">
                <div class="specs-row">
                    <div class="spec-item">
                        <span class="spec-label">KM</span>
                        <span class="spec-value">${formatKm(vehicle.km)}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Placa</span>
                        <span class="spec-value">${vehicle.placa}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Ano</span>
                        <span class="spec-value">${vehicle.ano}</span>
                    </div>
                </div>
                <div class="specs-row">
                    <span class="dias-estoque">Dias no estoque: ${diasNoEstoque}</span>
                </div>
            </div>

            <!-- Coluna de Preço -->
            <div class="vehicle-price-container">
                <span class="price-value">${formatPrice(vehicle.preco)}</span>
                <a href="edit.html?id=${vehicle._id}" class="icon-btn edit-icon" title="Editar preço">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4136" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

function viewVehicle(id) {
    window.location.href = `view.html?id=${id}`;
}

function editVehicle(id) {
    window.location.href = `edit.html?id=${id}`;
}

async function deleteVehicle(id) {
    console.warn('Confirmação de exclusão ignorada, mas a lógica de exclusão está aqui.');

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        loadVehicles();
    } catch (error) {
        console.error('Erro ao excluir veículo:', error);
    }
}

// --- Página de Adicionar Veículo ---
if (window.location.pathname === '/add.html') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeFormFields();
        const precoInput = document.getElementById('preco');
        if (precoInput) precoInput.setAttribute('required', 'true');

        const form = document.getElementById('vehicleForm');
        if (form) {
            form.addEventListener('submit', handleAddVehicle);
        }
    });
}

async function handleAddVehicle(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const chassiValue = formFields.chassi.input.value.trim().toUpperCase();
    const vehicleData = {
        nome: formFields.nome.input.value.trim(),
        placa: formFields.placa.input.value.trim(),
        chassi: chassiValue,
        especificacao: formFields.especificacao.input.value.trim(),
        ano: parseInt(formFields.ano.input.value.trim()),
        km: parseFloat(formFields.km.input.value.replace(/\./g, '').replace(',', '.')),
        preco: parseFloat(formFields.preco.input.value.replace(/\./g, '').replace(',', '.')),
        imagens: formFields.imagens.input.value.split('\n').map(url => url.trim()).filter(url => url.length > 0)
    };

    try {
        await apiRequest(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });

        console.log('Veículo adicionado com sucesso!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Falha ao adicionar veículo:', error);
    }
}

// --- Página de Editar Veículo ---
if (window.location.pathname === '/edit.html') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeFormFields();
        const precoInput = document.getElementById('preco');
        if (precoInput) precoInput.setAttribute('required', 'true');

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            loadVehicleForEdit(id);
        } else {
            console.error('ID do veículo não fornecido para edição.');
            window.location.href = 'index.html';
        }
    });
}

async function loadVehicleForEdit(id) {
    const loadingEl = document.getElementById('loading');
    const form = document.getElementById('vehicleForm');
    const errorEl = document.getElementById('error');

    try {
        if (loadingEl) loadingEl.style.display = 'block';
        if (form) form.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';

        const vehicle = await apiRequest(`${API_BASE_URL}/${id}`);

        if (formFields.nome.input) formFields.nome.input.value = vehicle.nome;
        if (formFields.placa.input) formFields.placa.input.value = vehicle.placa;
        if (formFields.chassi.input) formFields.chassi.input.value = vehicle.chassi;
        if (formFields.especificacao.input) formFields.especificacao.input.value = vehicle.especificacao || '';
        if (formFields.ano.input) formFields.ano.input.value = vehicle.ano;

        if (formFields.km.input) {
            formFields.km.input.value = vehicle.km ? vehicle.km.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '';
        }
        if (formFields.preco.input) {
            formFields.preco.input.value = vehicle.preco ? vehicle.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
        }

        if (formFields.imagens.input) formFields.imagens.input.value = vehicle.imagens ? vehicle.imagens.join('\n') : '';

        if (form) {
            form.addEventListener('submit', (e) => handleEditVehicle(e, id));
        }

        if (loadingEl) loadingEl.style.display = 'none';
        if (form) form.style.display = 'block';
    } catch (error) {
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Erro ao carregar veículo para edição. Verifique o ID ou a conexão.';
        }
        console.error('Falha ao carregar veículo para edição:', error);
        window.location.href = 'index.html';
    }
}

async function handleEditVehicle(e, id) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const chassiValue = formFields.chassi.input.value.trim().toUpperCase();
    const vehicleData = {
        nome: formFields.nome.input.value.trim(),
        placa: formFields.placa.input.value.trim(),
        chassi: chassiValue,
        especificacao: formFields.especificacao.input.value.trim(),
        ano: parseInt(formFields.ano.input.value.trim()),
        km: parseFloat(formFields.km.input.value.replace(/\./g, '').replace(',', '.')),
        preco: parseFloat(formFields.preco.input.value.replace(/\./g, '').replace(',', '.')),
        imagens: formFields.imagens.input.value.split('\n').map(url => url.trim()).filter(url => url.length > 0)
    };

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vehicleData)
        });

        console.log('Veículo atualizado com sucesso!');
        window.location.href = `view.html?id=${id}`;
    } catch (error) {
        console.error('Falha ao atualizar veículo:', error);
    }
}


// --- Página de Visualizar Veículo ---
if (window.location.pathname === '/view.html') {
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            loadVehicleDetails(id);
        } else {
            console.error('ID do veículo não fornecido para visualização.');
            window.location.href = 'index.html';
        }
    });
}

// Melhoria na galeria de imagens para a página de detalhes
async function loadVehicleDetails(id) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const detailsEl = document.getElementById('vehicleDetails');
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    try {
        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (detailsEl) detailsEl.style.display = 'none';

        const vehicle = await apiRequest(`${API_BASE_URL}/${id}`);

        if (document.getElementById('vehicleName')) document.getElementById('vehicleName').textContent = vehicle.nome;
        if (document.getElementById('vehiclePlate')) document.getElementById('vehiclePlate').textContent = vehicle.placa;
        if (document.getElementById('vehicleChassi')) document.getElementById('vehicleChassi').textContent = vehicle.chassi;
        if (document.getElementById('vehicleYear')) document.getElementById('vehicleYear').textContent = vehicle.ano;
        if (document.getElementById('vehicleKm')) document.getElementById('vehicleKm').textContent = formatKm(vehicle.km);
        if (document.getElementById('vehiclePrice')) document.getElementById('vehiclePrice').textContent = formatPrice(vehicle.preco);
        if (document.getElementById('vehicleCreated')) document.getElementById('vehicleCreated').textContent = formatDate(vehicle.createdAt);
        if (document.getElementById('vehicleUpdated')) document.getElementById('vehicleUpdated').textContent = formatDate(vehicle.updatedAt);

        const imageGallery = document.getElementById('imageGallery');
        if (imageGallery) {
            if (vehicle.imagens && vehicle.imagens.length > 0) {
                const validImageUrls = vehicle.imagens.filter(url => /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url));

                if (validImageUrls.length > 0) {
                    imageGallery.innerHTML = ''; // Limpa o conteúdo
                    validImageUrls.forEach(imgUrl => {
                        const imgElement = document.createElement('img');
                        imgElement.src = imgUrl;
                        imgElement.alt = vehicle.nome;

                        imgElement.onerror = () => {
                            // Se a imagem falhar, a substitui por um placeholder
                            const placeholder = document.createElement('div');
                            placeholder.className = 'no-image-details';
                            placeholder.textContent = 'Imagem não carregada';
                            imgElement.replaceWith(placeholder);
                        };

                        imageGallery.appendChild(imgElement);
                    });
                } else {
                    imageGallery.innerHTML = '<div class="no-images"><p>Nenhuma imagem válida disponível</p></div>';
                }
            } else {
                imageGallery.innerHTML = '<div class="no-images"><p>Nenhuma imagem disponível</p></div>';
            }
        }

        if (editBtn) editBtn.onclick = () => window.location.href = `edit.html?id=${id}`;
        if (deleteBtn) deleteBtn.onclick = () => handleDeleteFromDetails(id);

        if (loadingEl) loadingEl.style.display = 'none';
        if (detailsEl) detailsEl.style.display = 'grid';
    } catch (error) {
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Erro ao carregar detalhes do veículo. Verifique o ID ou a conexão.';
        }
        console.error('Falha ao carregar detalhes do veículo:', error);
        window.location.href = 'index.html';
    }
}

async function handleDeleteFromDetails(id) {
    console.warn('Confirmação de exclusão ignorada, mas a lógica de exclusão está aqui.');

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        console.log('Veículo excluído com sucesso!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Falha ao excluir veículo:', error);
    }
}

function goBack() {
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Função para imprimir veículo (pode ser implementada conforme necessário)
function printVehicle(id) {
    console.log(`Imprimindo veículo ${id}`);
    // Implementar lógica de impressão
    alert('Funcionalidade de impressão será implementada em breve!');
}

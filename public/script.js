const API_BASE_URL = 'http://localhost:5000/carros';

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
    const chassiPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

    if (input.required && chassiValue === '') {
        showFieldError(input, error, 'O campo Chassi é obrigatório.');
        return false;
    }
    if (chassiValue !== '' && !chassiPattern.test(chassiValue)) {
        showFieldError(input, error, 'O chassi deve ter exatamente 17 caracteres alfanuméricos válidos.');
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

// --- NOVA/AJUSTADA FUNÇÃO: Formatação de números enquanto o usuário digita ---
const formatNumberInput = (input, isCurrency = false) => {
    let value = input.value;
    
    // 1. Remove tudo que não for dígito, vírgula ou ponto (apenas para permitir entrada inicial)
    value = value.replace(/[^0-9,.]/g, '');

    if (isCurrency) {
        // Para moeda, tratamos a vírgula como separador decimal
        // Remove todos os pontos, substitui a primeira vírgula por ponto, e remove outras vírgulas
        value = value.replace(/\./g, ''); // Remove pontos de milhar para processamento
        const parts = value.split(',');
        if (parts.length > 2) { // Evita múltiplas vírgulas
            value = parts[0] + ',' + parts.slice(1).join('');
        }

        // Se houver vírgula, garante no máximo 2 casas decimais
        if (value.includes(',')) {
            let [integerPart, decimalPart] = value.split(',');
            decimalPart = decimalPart.substring(0, 2); // Limita a 2 decimais
            // Adiciona pontos de milhar na parte inteira
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            input.value = integerPart + ',' + decimalPart;
        } else {
            // Se não tem vírgula, apenas adiciona pontos de milhar
            input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
    } else {
        // Para quilometragem (não é moeda, apenas números inteiros com pontos de milhar)
        value = value.replace(/\./g, ''); // Remove todos os pontos para reformatar
        value = value.replace(/,/g, ''); // Remove vírgulas também
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

    // Remove pontos de milhares e troca vírgula por ponto para validação interna e conversão numérica
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

// Adiciona event listeners para validação em tempo real
function addValidationListeners() {
    if (formFields.nome && formFields.nome.input) formFields.nome.input.addEventListener('input', () => validateRequiredText(formFields.nome.input, formFields.nome.error, 'Nome/Modelo'));
    if (formFields.placa && formFields.placa.input) formFields.placa.input.addEventListener('input', () => validateRequiredText(formFields.placa.input, formFields.placa.error, 'Placa'));
    if (formFields.chassi && formFields.chassi.input) formFields.chassi.input.addEventListener('input', validateChassi);
    if (formFields.ano && formFields.ano.input) formFields.ano.input.addEventListener('input', validateAno);

    if (formFields.km && formFields.km.input) {
        formFields.km.input.addEventListener('input', () => {
            formatNumberInput(formFields.km.input, false); // Não é moeda
            validateNumericField(formFields.km.input, formFields.km.error, 'Quilometragem', true, true);
        });
        formFields.km.input.addEventListener('blur', () => validateNumericField(formFields.km.input, formFields.km.error, 'Quilometragem', true, true));
    }
    
    if (formFields.preco && formFields.preco.input) {
        formFields.preco.input.addEventListener('input', () => {
            formatNumberInput(formFields.preco.input, true); // É moeda
            validateNumericField(formFields.preco.input, formFields.preco.error, 'Preço', true, true);
        });
        formFields.preco.input.addEventListener('blur', () => {
            // Ao sair do campo de preço, se for um número válido, formata para 2 casas decimais e pontos/vírgulas
            const cleanedValue = formFields.preco.input.value.replace(/\./g, '').replace(',', '.');
            if (!isNaN(parseFloat(cleanedValue)) && cleanedValue.trim() !== '') {
                formFields.preco.input.value = parseFloat(cleanedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            validateNumericField(formFields.preco.input, formFields.preco.error, 'Preço', true, true);
        });
    }
}


// Função para validar todo o formulário antes do envio
function validateForm() {
    const isNomeValid = validateRequiredText(formFields.nome.input, formFields.nome.error, 'Nome/Modelo');
    const isPlacaValid = validateRequiredText(formFields.placa.input, formFields.placa.error, 'Placa');
    const isChassiValid = validateChassi();
    const isAnoValid = validateAno();
    const isKmValid = validateNumericField(formFields.km.input, formFields.km.error, 'Quilometragem', true, true);
    const isPrecoValid = validateNumericField(formFields.preco.input, formFields.preco.error, 'Preço', true, true);

    const allFieldsValid = isNomeValid && isPlacaValid && isChassiValid && isAnoValid && isKmValid && isPrecoValid;

    if (!allFieldsValid) {
        alert('Por favor, preencha todos os campos obrigatórios e corrija os erros.');
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

function createVehicleCard(vehicle) {
    const imageHtml = vehicle.imagens && vehicle.imagens.length > 0
        ? `<img src="${vehicle.imagens[0]}" alt="${vehicle.nome}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\">Sem imagem</div>'">`
        : '<div class="no-image">Sem imagem</div>';

    return `
        <div class="vehicle-card">
            <div class="vehicle-image">
                ${imageHtml}
            </div>

            <div class="vehicle-info">
                <h3>${vehicle.nome}</h3>
                <p class="plate">${vehicle.placa}</p>
                <p class="km">${formatKm(vehicle.km)}</p>
                <p class="year">${vehicle.ano}</p>
                <p class="price">${formatPrice(vehicle.preco)}</p>
            </div>

            <div class="vehicle-actions">
                <button onclick="viewVehicle('${vehicle._id}')" class="btn-view">Ver</button>
                <button onclick="editVehicle('${vehicle._id}')" class="btn-edit">Editar</button>
                <button onclick="deleteVehicle('${vehicle._id}')" class="btn-delete">Excluir</button>
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
    if (!confirm('Tem certeza que deseja excluir este veículo?')) {
        return;
    }

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        loadVehicles();
    } catch (error) {
        alert('Erro ao excluir veículo');
        console.error('Falha ao excluir veículo:', error);
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
    
    const vehicleData = {
        nome: formFields.nome.input.value.trim(),
        placa: formFields.placa.input.value.trim(),
        chassi: formFields.chassi.input.value.trim().toUpperCase(),
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

        alert('Veículo adicionado com sucesso!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Erro ao adicionar veículo. ' + (error.message || 'Verifique os dados e tente novamente.'));
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
            alert('ID do veículo não fornecido para edição.');
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
        if (formFields.ano.input) formFields.ano.input.value = vehicle.ano;
        
        if (formFields.km.input) {
            formFields.km.input.value = vehicle.km ? vehicle.km.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''; // Km sem decimais
        }
        if (formFields.preco.input) {
            formFields.preco.input.value = vehicle.preco ? vehicle.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''; // Preço com 2 decimais
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
        alert('Erro ao carregar veículo para edição. Redirecionando...');
        console.error('Falha ao carregar veículo para edição:', error);
        window.location.href = 'index.html';
    }
}

async function handleEditVehicle(e, id) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }
    
    const vehicleData = {
        nome: formFields.nome.input.value.trim(),
        placa: formFields.placa.input.value.trim(),
        chassi: formFields.chassi.input.value.trim().toUpperCase(),
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
        
        alert('Veículo atualizado com sucesso!');
        window.location.href = `view.html?id=${id}`;
    } catch (error) {
        alert('Erro ao atualizar veículo. ' + (error.message || 'Verifique os dados e tente novamente.'));
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
            alert('ID do veículo não fornecido para visualização.');
            window.location.href = 'index.html';
        }
    });
}

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
                imageGallery.innerHTML = vehicle.imagens.map(img => 
                    `<img src="${img}" alt="${vehicle.nome}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\"no-image\\">Imagem não carregada</div>'">`
                ).join('');
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
        alert('Erro ao carregar detalhes do veículo. Redirecionando...');
        window.location.href = 'index.html';
    }
}

async function handleDeleteFromDetails(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) {
        return;
    }

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        alert('Veículo excluído com sucesso!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Erro ao excluir veículo.');
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
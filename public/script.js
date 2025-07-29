const API_BASE_URL = 'http://localhost:5000/carros';

// Funções utilitárias
function formatPrice(price) {
    if (!price) return 'Preço não informado';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function formatKm(km) {
    return new Intl.NumberFormat('pt-BR').format(km) + ' km';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// Funções da API
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Página inicial - Lista de veículos
if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
    loadVehicles();
}

async function loadVehicles() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const vehiclesEl = document.getElementById('vehicles');

    try {
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        vehiclesEl.innerHTML = '';

        const vehicles = await apiRequest(API_BASE_URL);
        
        if (vehicles.length === 0) {
            vehiclesEl.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum veículo cadastrado</p>
                    <button onclick="window.location.href='add.html'" class="btn-add">
                        Adicionar primeiro veículo
                    </button>
                </div>
            `;
        } else {
            vehiclesEl.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle)).join('');
        }
    } catch (error) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Erro ao carregar veículos';
    } finally {
        loadingEl.style.display = 'none';
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
    }
}

// Página de adicionar veículo
if (window.location.pathname === '/add.html') {
    const form = document.getElementById('vehicleForm');
    form.addEventListener('submit', handleAddVehicle);
}

async function handleAddVehicle(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const vehicleData = {
        nome: formData.get('nome'),
        placa: formData.get('placa'),
        chassi: formData.get('chassi'),
        ano: parseInt(formData.get('ano')),
        km: parseInt(formData.get('km')),
        preco: formData.get('preco') ? parseFloat(formData.get('preco')) : undefined,
        imagens: formData.get('imagens').split('\n').map(url => url.trim()).filter(url => url.length > 0)
    };

    try {
        await apiRequest(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
        
        window.location.href = 'index.html';
    } catch (error) {
        alert('Erro ao adicionar veículo');
    }
}

// Página de editar veículo
if (window.location.pathname === '/edit.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        loadVehicleForEdit(id);
    }
}

async function loadVehicleForEdit(id) {
    const loadingEl = document.getElementById('loading');
    const form = document.getElementById('vehicleForm');

    try {
        loadingEl.style.display = 'block';
        form.style.display = 'none';

        const vehicle = await apiRequest(`${API_BASE_URL}/${id}`);
        
        // Preencher formulário
        document.getElementById('nome').value = vehicle.nome;
        document.getElementById('placa').value = vehicle.placa;
        document.getElementById('chassi').value = vehicle.chassi;
        document.getElementById('ano').value = vehicle.ano;
        document.getElementById('km').value = vehicle.km;
        document.getElementById('preco').value = vehicle.preco || '';
        document.getElementById('imagens').value = vehicle.imagens.join('\n');

        // Configurar submit
        form.addEventListener('submit', (e) => handleEditVehicle(e, id));
        
        loadingEl.style.display = 'none';
        form.style.display = 'block';
    } catch (error) {
        alert('Erro ao carregar veículo');
        window.location.href = 'index.html';
    }
}

async function handleEditVehicle(e, id) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const vehicleData = {
        nome: formData.get('nome'),
        placa: formData.get('placa'),
        chassi: formData.get('chassi'),
        ano: parseInt(formData.get('ano')),
        km: parseInt(formData.get('km')),
        preco: formData.get('preco') ? parseFloat(formData.get('preco')) : undefined,
        imagens: formData.get('imagens').split('\n').map(url => url.trim()).filter(url => url.length > 0)
    };

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(vehicleData)
        });
        
        window.location.href = `view.html?id=${id}`;
    } catch (error) {
        alert('Erro ao atualizar veículo');
    }
}

// Página de visualizar veículo
if (window.location.pathname === '/view.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        loadVehicleDetails(id);
    }
}

async function loadVehicleDetails(id) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const detailsEl = document.getElementById('vehicleDetails');

    try {
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        detailsEl.style.display = 'none';

        const vehicle = await apiRequest(`${API_BASE_URL}/${id}`);
        
        // Preencher informações
        document.getElementById('vehicleName').textContent = vehicle.nome;
        document.getElementById('vehiclePlate').textContent = vehicle.placa;
        document.getElementById('vehicleChassi').textContent = vehicle.chassi;
        document.getElementById('vehicleYear').textContent = vehicle.ano;
        document.getElementById('vehicleKm').textContent = formatKm(vehicle.km);
        document.getElementById('vehiclePrice').textContent = formatPrice(vehicle.preco);
        document.getElementById('vehicleCreated').textContent = formatDate(vehicle.createdAt);
        document.getElementById('vehicleUpdated').textContent = formatDate(vehicle.updatedAt);

        // Configurar galeria de imagens
        const imageGallery = document.getElementById('imageGallery');
        if (vehicle.imagens && vehicle.imagens.length > 0) {
            imageGallery.innerHTML = vehicle.imagens.map(img => 
                `<img src="${img}" alt="${vehicle.nome}" onerror="this.style.display='none'">`
            ).join('');
        } else {
            imageGallery.innerHTML = '<div class="no-images"><p>Nenhuma imagem disponível</p></div>';
        }

        // Configurar botões
        document.getElementById('editBtn').onclick = () => window.location.href = `edit.html?id=${id}`;
        document.getElementById('deleteBtn').onclick = () => handleDeleteFromDetails(id);
        
        loadingEl.style.display = 'none';
        detailsEl.style.display = 'grid';
    } catch (error) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Erro ao carregar veículo';
    }
}

async function handleDeleteFromDetails(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) {
        return;
    }

    try {
        await apiRequest(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        window.location.href = 'index.html';
    } catch (error) {
        alert('Erro ao excluir veículo');
    }
}

// Função para voltar
function goBack() {
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
} 
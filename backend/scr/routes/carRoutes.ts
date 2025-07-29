import express from 'express';

const router = express.Router();

// Armazenamento em memória (simula banco de dados)
let vehicles: any[] = [];
let nextId = 1;

// Listar todos os veículos
router.get('/', (req, res) => {
  res.json(vehicles);
});

// Criar veículo
router.post('/', (req, res) => {
  try {
    const vehicle = {
      _id: nextId.toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    vehicles.push(vehicle);
    nextId++;
    
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao cadastrar veículo', detalhes: err });
  }
});

// Buscar veículo por ID
router.get('/:id', (req, res) => {
  try {
    const vehicle = vehicles.find(v => v._id === req.params.id);
    if (!vehicle) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ erro: 'ID inválido' });
  }
});

// Atualizar veículo
router.put('/:id', (req, res) => {
  try {
    const index = vehicles.findIndex(v => v._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    
    vehicles[index] = {
      ...vehicles[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(vehicles[index]);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar', detalhes: err });
  }
});

// Deletar veículo
router.delete('/:id', (req, res) => {
  try {
    const index = vehicles.findIndex(v => v._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    
    vehicles.splice(index, 1);
    res.json({ mensagem: 'Veículo removido com sucesso' });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao deletar', detalhes: err });
  }
});

export default router;

import express from 'express';
import { Car } from '../models/car';

const router = express.Router();

// Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const vehicles = await Car.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar veículos', detalhes: err });
  }
});

// Criar veículo
router.post('/', async (req, res) => {
  try {
    const vehicle = new Car(req.body);
    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (err: any) {
    if (err.code === 11000) {
      // Erro de duplicação (placa ou chassi já existe)
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ 
        erro: `${field === 'placa' ? 'Placa' : 'Chassi'} já cadastrada no sistema` 
      });
    } else {
      res.status(400).json({ erro: 'Erro ao cadastrar veículo', detalhes: err.message });
    }
  }
});

// Buscar veículo por ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Car.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ erro: 'ID inválido' });
  }
});

// Atualizar veículo
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Car.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    
    res.json(vehicle);
  } catch (err: any) {
    if (err.code === 11000) {
      // Erro de duplicação (placa ou chassi já existe)
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ 
        erro: `${field === 'placa' ? 'Placa' : 'Chassi'} já cadastrada no sistema` 
      });
    } else {
      res.status(400).json({ erro: 'Erro ao atualizar', detalhes: err.message });
    }
  }
});

// Deletar veículo
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Car.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    
    res.json({ mensagem: 'Veículo removido com sucesso' });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao deletar', detalhes: err });
  }
});

export default router;

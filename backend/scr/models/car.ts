import mongoose from 'mongoose';

const CarSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  placa: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  chassi: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ano: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  km: {
    type: Number,
    required: true,
    min: 0
  },
  preco: {
    type: Number,
    required: false,
    min: 0
  },
  imagens: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const Car = mongoose.model('Car', CarSchema);

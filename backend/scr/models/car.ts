import mongoose from "mongoose"

const carSchema = new mongoose.Schema({
  modelo: String,
  marca: String,
  ano: Number,
  preco: Number,
  descricao: String,
  imagens: [String]
})

export default mongoose.model("Car", carSchema)

import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI
    if (!mongoURI) {
      console.error("Variável de ambiente MONGO_URI não definida.")
      process.exit(1)
    }

    await mongoose.connect(mongoURI)
    console.log("MongoDB conectado com sucesso")
  } catch (err) {
    console.error("Erro ao conectar no MongoDB:", err)
    process.exit(1)
  }
}
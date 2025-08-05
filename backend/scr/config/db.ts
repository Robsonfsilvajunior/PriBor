import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || mongodb+srv://Robertin:123456@cluster0.aktpx.mongodb.net/

    await mongoose.connect(mongoURI)
    console.log("MongoDB conectado com sucesso")
  } catch (err) {
    console.error("Erro ao conectar no MongoDB", err)
    console.log("Certifique-se de que o MongoDB está rodando localmente ou configure a variável MONGO_URI")
    process.exit(1)
  }
}

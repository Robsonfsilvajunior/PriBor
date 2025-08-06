import express from "express"
import cors from "cors"
//import dotenv from "dotenv"
import path from "path"
import { connectDB } from "./config/db"
import carRoutes from "./routes/carRoutes"

//dotenv.config({ path: path.resolve(__dirname, '../../.env') })
process.env.MONGO_URI = 'mongodb+srv://Robertin:123456@cluster0.aktpx.mongodb.net/'
process.env.PORT = '3000'
console.log("Valor de MONGO_URI lido:", process.env.MONGO_URI);

const app = express()

// Conectar ao MongoDB
connectDB()

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../../public')))

const PORT = process.env.PORT || 3000

// Rotas da API
app.use('/carros', carRoutes)

// Rota para servir a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'))
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Acesse: http://localhost:${PORT}`)
})

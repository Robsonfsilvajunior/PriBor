import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db"
import carRoutes from "./routes/carRoutes"

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use("/api/cars", carRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

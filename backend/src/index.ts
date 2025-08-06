import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose"; // Importar mongoose diretamente
import carRoutes from "./routes/carRoutes";

// A string de conexão diretamente aqui, como testamos com sucesso
const MONGO_URI = 'mongodb+srv://Chocolate:tropadotpl@cluster0.aktpx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const PORT = process.env.PORT || 3000; // Define a porta, usando 3000 como padrão

// Instância do Express
const app = express();

// Função para conectar ao MongoDB
async function connectToMongoDB() {
    try {
        if (!MONGO_URI) {
            console.error('Erro: A variável de ambiente MONGO_URI não está definida.');
            // Se a URI não estiver definida, a aplicação não pode continuar.
            // Em um ambiente de produção, você pode querer um tratamento de erro mais robusto.
            process.exit(1); 
        }
        await mongoose.connect(MONGO_URI);
        console.log('Conexão bem-sucedida com o MongoDB!');
    } catch (error) {
        console.error('Erro ao conectar no MongoDB:', error);
        // Em caso de falha na conexão, a aplicação não pode continuar.
        process.exit(1); 
    }
}

// Configurar CORS para permitir requisições do seu frontend
app.use(cors({
    origin: 'http://localhost:3000', // Permite requisições do seu frontend
    credentials: true // Permite o envio de cookies e cabeçalhos de autorização
}));

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../../public')));

// Rotas da API para carros
app.use('/carros', carRoutes);

// Rota para servir a página inicial (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Inicia o servidor e, em seguida, tenta conectar ao MongoDB
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    connectToMongoDB(); // Chama a função de conexão após o servidor iniciar
});
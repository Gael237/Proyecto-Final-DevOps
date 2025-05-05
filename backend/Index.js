const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/products')
const cartRoutes = require('./routes/cart')
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);


// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
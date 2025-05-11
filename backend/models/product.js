const mongoose = require('mongoose');

// Definimos el esquema del producto
const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio']
  },
  imagen: {
    type: String,
    required: [true, 'La imagen es obligatoria']
  },
  stock: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 }
  }
});

// Creamos el modelo
const Product = mongoose.model('Product', productSchema);

// Exportamos el modelo para usarlo en rutas/controladores
module.exports = Product;
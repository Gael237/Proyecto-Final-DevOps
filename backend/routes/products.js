const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET: Obtener todos los productos
router.get('/', async (req, res) => {
  const productos = await Product.find();
  res.json(productos);
});

// POST: Agregar un nuevo producto
router.post('/', async (req, res) => {
  const { nombre, precio, imagen } = req.body;

  // Validación manual por si viene vacío
  if (!nombre || !precio || !imagen) {
    return res.status(400).json({
      message: 'Se requiere nombre, precio e imagen del producto'
    });
  }

  try {
    const nuevoProducto = new Product({ nombre, precio, imagen });
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (err) {
    console.error('Error al crear producto:', err.message);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
});
  
  module.exports = router;
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
  

// PATCH: Disminuir el stock de un producto por talla
router.patch('/:id/decrement-stock', async (req, res) => {
  const { talla, cantidad } = req.body;

  if (!talla || typeof cantidad !== 'number') {
    return res.status(400).json({ message: 'Talla y cantidad son obligatorios' });
  }

  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verifica si hay stock por talla (stock es un objeto como { "M": 3, "L": 2 })
    if (!producto.stock[talla] || producto.stock[talla] < cantidad) {
      return res.status(400).json({ message: 'Stock insuficiente para esta talla' });
    }

    // Disminuir stock
    producto.stock[talla] -= cantidad;

    await producto.save();

    res.json({ message: 'Stock actualizado', producto });
  } catch (err) {
    console.error('Error al actualizar stock:', err.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


  module.exports = router;
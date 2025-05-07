const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // <-- cambio de nombre para evitar conflicto

// Simulación de carrito (en memoria, aún no persistente)
const cart = {};

// POST /api/cart/add - Agregar producto al carrito
router.post('/add', async (req, res) => {
    const { productId, talla } = req.body;

    // Aquí se deberá autenticar al usuario y obtener su ID
    if (!productId || !talla) {
        return res.status(400).json({ message: 'Se requiere productId y talla' });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si "stock" es un objeto, accedemos directamente con corchetes
        if (!product.stock[talla] || product.stock[talla] <= 0) {
            return res.status(400).json({ message: 'No hay stock disponible para la talla solicitada' });
        }

        const userId = 'usuario_temporal'; // Reemplazar más adelante con autenticación

        if (!cart[userId]) {
            cart[userId] = [];
        }

        const existingItem = cart[userId].find(
            item => item.productId === productId && item.talla === talla
        );

        if (existingItem) {
            existingItem.cantidad++;
        } else {
            cart[userId].push({ productId, talla, cantidad: 1 });
        }

        res.json({ message: 'Producto agregado al carrito', cart: cart[userId] });

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
});

// GET /api/cart - Obtener el carrito del usuario
router.get('/', (req, res) => {
    const userId = 'usuario_temporal'; // Simulación de usuario
    res.json(cart[userId] || []);
});

module.exports = router;

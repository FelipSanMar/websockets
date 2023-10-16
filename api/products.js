//products.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const {io} = require('../src/index.js');

const pathProducts = './data/productos.json'



function obtenerProductos() {
    if (fs.existsSync(pathProducts)) {
      return JSON.parse(fs.readFileSync(pathProducts, 'utf-8'));
    } else {
      return [];
    }
  }


//Lista todos los productos de la base (Incluye la limitacion ?limit)
// Ruta raíz GET /products/
router.get('/', (req, res) => {
    if (!fs.existsSync(pathProducts)) {
        //Verifica que exista el archivo

        res.status(404).json({ status: 'error', error: 'Archivo productos no encontrado' })
    } else {
        const products = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))

        //Verifica si se proporciono un limite
        const limit = req.query.limit

        if (limit) {
            //Devuelve solo el numero de productos solicitados
            res.json(products.slice(0, limit))
        } else {
            //Devuelve todos los productos
            res.json(products)
        }
    }
})

//Muestra solo el producto con el id proporcionado
// Ruta GET /products/:pid
router.get('/:pid', (req, res) => {
    const productId = req.params.pid
    const products = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))
    const product = products.find(p => p.id === productId)

    if (product) {
        res.json(product)
    } else {
        res.status(404).json({ error: 'Producto no encontrado' })
    }
})

//Agrega un nuevo producto
// Ruta POST /products/  (AGREGAR PRODUCTO)
router.post('/', (req, res) => {
    if (!fs.existsSync(pathProducts)) {
        res.status(404).json({ status: 'error', error: 'Archivo productos no encontrado' })
    } else {
        const { title, description, code, price, stock, category } = req.body

        if (!title || !description || !code || !price || !stock || !category) {
            res.status(400).json({ status: 'error', error: 'Faltan campos obligatorios' })
        } else {
            const products = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))

            const newProduct = {
                id: products.length + 1,
                ...req.body,
                status: true,
            }

            products.push(newProduct)

            fs.writeFileSync(pathProducts, JSON.stringify(products, null, 2))
            res.json(newProduct)
            
            // Emitir un evento al socket cuando se agrega un producto
            io.emit('nuevoProducto', newProduct);
             
  
        }
    }
})

//Actualiza un producto
// Ruta PUT /products/:pid
router.put('/:pid', (req, res) => {
    if (!fs.existsSync(pathProducts)) {
        res.status(404).json({ status: 'error', error: 'Archivo productos no encontrado' })
    } else {
        const productId = parseInt(req.params.pid, 10) //El id es number por lo que se debe parsear para que sea encontrado por findIndex

        const products = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))
        const productIndex = products.findIndex(p => p.id === productId)

        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...req.body }

            fs.writeFileSync(pathProducts, JSON.stringify(products, null, 2))
            res.json(products[productIndex])
        } else {
            res.status(400).json({ status: 'error', error: 'ID no encontrado' })
        }
    }
})

//Elimina el producto indicado
// Ruta DELETE /products/:pid
router.delete('/:pid', (req, res) => {
    if (!fs.existsSync(pathProducts)) {
        res.status(404).json({ status: 'error', error: 'Archivo productos no encontrado' })
    } else {
        const productId = parseInt(req.params.pid, 10)
        let products = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))
        const productIndex = products.findIndex(p => p.id === productId)

        if (productIndex !== -1) {
            products = products.filter(p => p.id !== productId)

            fs.writeFileSync(pathProducts, JSON.stringify(products, null, 2))
            res.json({ message: 'Producto eliminado exitosamente' })
                 
            // Emitir un evento al socket cuando se elimina un producto
            io.emit('eliminarProducto', productId);

        } else {
            res.status(400).json({ status: 'error', error: 'ID no encontrado' })
        }
    }
})

module.exports = { router, obtenerProductos};
  
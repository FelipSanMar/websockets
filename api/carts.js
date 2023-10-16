//carts.js

const express = require('express')
const router = express.Router()
const fs = require('fs')

const pathCarts = './data/carrito.json'
const pathProducts = './data/productos.json'

//Crea un nuevo carrito
//Ruta raiz POST /carts/
router.post('/', (req, res) => {
    if (!fs.existsSync(pathCarts)) {
        res.status(404).json({ status: 'error', error: 'Archivo productos no encontrado' })
    } else {
        const carts = JSON.parse(fs.readFileSync(pathCarts, 'utf-8'))

        const newCarts = {
            id: carts.length + 1,
            products: [],
        }

        carts.push(newCarts)

        fs.writeFileSync(pathCarts, JSON.stringify(carts, null, 2))
        res.json(newCarts)
    }
})

//Lista los productos del carro
// Ruta GET carts/:cid
router.get('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10)
    const carts = JSON.parse(fs.readFileSync(pathCarts, 'utf-8'))
    const cart = carts.find(c => c.id === cartId)

    if (cart) {
        const products = []
        const cartProducts = cart.products

        const productsData = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))

        cartProducts.forEach(item => {
            const product = productsData.find(p => p.id === parseInt(item.product, 10)) //En caso que el id sea string hay que cambiar esta conversion tambien

            if (product) {
                products.push({
                    ...product,
                    quantity: item.quantity,
                })
            }
        })

        res.json(products)
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' })
    }
})

//Agrega Productos al carro
// Ruta POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10)
    const productId = parseInt(req.params.pid, 10)
    const quantity = req.body.quantity || 1

    let carts = JSON.parse(fs.readFileSync(pathCarts, 'utf-8'))
    let updated = 0

    // const createdProduct = JSON.parse(fs.readFileSync(pathProducts,'utf-8'));

    carts = carts.map(cart => {
        if (cart.id === cartId) {
            //Si el carro exite, luego superviso que el producto exista
            const createdProduct = JSON.parse(fs.readFileSync(pathProducts, 'utf-8'))
            const product = createdProduct.find(p => p.id === productId) //Supervisa que exista el producto antes de agregarlo

            if (!product) {
                return (updated = -1)
            }

            const existingProduct = cart.products.find(p => p.product === productId)

            if (existingProduct) {
                existingProduct.quantity += quantity
            } else {
                cart.products.push({ product: productId, quantity })
            }
            updated = 1
        }
        return cart
    })

    if (updated == 1) {
        fs.writeFileSync(pathCarts, JSON.stringify(carts, null, 2))
        res.status(200).json({ status: 'Producto agregado exitosamente' })
    } else if (updated == 0) {
        res.status(400).json({ status: 'solicitud incorrecta', error: 'Carrito no encontrado' })
    } else {
        res.status(400).json({ status: 'solicitud incorrecta', error: 'El producto no existe' })
    }
})

module.exports = router

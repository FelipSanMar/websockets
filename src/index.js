const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const { obtenerProductos } = require('../api/products');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 8080;

app.engine('handlebars', exphbs.engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'src/views'))

app.use(express.json());

//Importar rutas http
const httpRoutes = require('./routes/http');
httpRoutes(app, io);


const cartsRouter = require('../api/carts');
app.use('/carts', cartsRouter);

const productsRouter = require('../api/products');
app.use('/products', productsRouter.router);

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = { app, io, obtenerProductos };

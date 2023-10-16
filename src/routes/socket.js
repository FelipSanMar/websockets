const  obtenerProductos  = require('../../api/products');
const { io } = require('../index');

io.on('connection', socket => {
  console.log('Cliente Conectado');

  socket.on('nuevoProducto', producto => {
    const products = obtenerProductos();
    products.push(producto);
  });

  socket.on('eliminarProducto', productoId => {
    const products = obtenerProductos();
    const index = products.findIndex(p => p.id === productoId);
    if (index !== -1) {
      products.splice(index, 1);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

module.exports = io;

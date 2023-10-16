//http.js

const {obtenerProductos} = require('../../api/products'); // Importa la función de obtenerProductos

module.exports = (app) => {
 
    app.get('/', (req, res) => {
    const products = obtenerProductos(); 
    res.render('home.handlebars', { products });
  });

  app.get('/realtimeproducts', (req, res) => {
    const products = obtenerProductos(); 
    res.render('realTimeProducts.handlebars', { products });
  });


};

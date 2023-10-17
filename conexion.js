const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: process.env.HOST, 
    user: process.env.USER,              
    password: process.env.PASSWORD,           
    database: process.env.DATABASE            
});

// Conectar a la base de datos
connection.connect((error) => {
    if (error) {
        console.error('Error en la conexión a la base de datos:', error);
    } else {
        console.log('Conexión exitosa a la base de datos MySQL');
    }
});

module.exports = connection;

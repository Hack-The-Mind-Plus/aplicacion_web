const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'brlgxguwx7dkkpw9dn50-mysql.services.clever-cloud.com',
    user: 'ufcazzoen9xcbzsl',
    password: 'CsmPJLXJS0ST6TvSNJk6',
    database: 'brlgxguwx7dkkpw9dn50'
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

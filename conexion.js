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

// Función para obtener el userId desde la base de datos
function obtenerUserId(username, callback) {
    console.log('Obteniendo userId para el usuario:', username);
    connection.query('SELECT id_user FROM Usuarios WHERE user_name = ?', [username], (error, results) => {
        if (error) {
            console.error('Error al obtener el userId:', error);
            callback(error, null);
        } else if (results.length > 0) {
            const userId = results[0].id_user; // Asegúrate de que la columna sea 'id_user'
            console.log('UserId obtenido:', userId);
            callback(null, userId);
        } else {
            console.log('Usuario no encontrado para:', username);
            callback(null, null);
        }
    });
}


module.exports = connection;
module.exports.obtenerUserId = obtenerUserId;
    

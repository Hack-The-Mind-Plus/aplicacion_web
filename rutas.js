const express = require('express');
const bcrypt = require('bcrypt');
const sessionMiddleware = require('./session'); // Importar la configuración de sesiones
const connection = require('./conexion'); // Importar la conexión a la base de datos

const app = express();
const saltRounds = 10;


// Middleware para analizar y acceder a los datos del formulario HTML.
app.use(express.urlencoded({ extended: true }));

// Configuración de express-sessión
app.use(sessionMiddleware);

/*/Middleware de autenticación, protege archivos o páginas que se muestran solo estando logeado
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        // El usuario está autenticado, permite que continúe
        console.log("El ususario esta autenticado");
        return next();
    } else {
        // El usuario no está autenticado, redirige al inicio de sesión
        console.log("El usuario no esta autenticado")
        res.redirect('/login.html');
    }
}
*/


// Configurar una ruta estática para servir archivos CSS y otros archivos estáticos
// __dirname se refiere a la ubicación actual del archivo JS
app.use(express.static(__dirname));


//Ruta para la página de logeo
app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

//Ruta para la página de registro.
app.get('/registro.html', (req,res) => {
  res.sendFile(__dirname + '/registro.html');
});



// Ruta para procesar el registro de usuarios
app.post('/registrar', (req, res) => {
    const { new_username, new_password } = req.body; // Obtener datos del formulario

    if (!new_username || !new_password) {
        return res.status(400).send('Por favor, ingresa nombre de usuario y contraseña.');
    }

    // Consulta SQL para verificar si el usuario ya existe
    const checkUserSql = 'SELECT user_name FROM datosUsuarios WHERE user_name = ?';
    connection.query(checkUserSql, [new_username], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error al verificar el usuario:', checkError);
            res.status(500).send('Error al verificar el usuario. Por favor, inténtalo de nuevo.');
        } else if (checkResults.length > 0) {
            // El usuario ya existe
            res.send('El usuario ya existe. Por favor, elige otro nombre de usuario.<a href = "/registro.html">Volver a intentarlo</a>');
        } else {
            // El usuario no existe, procede con el registro
            bcrypt.hash(new_password, saltRounds, (hashError, hash) => {
                if (hashError) {
                    console.error('Error al hashear la contraseña:', hashError);
                    res.status(500).send('Error al registrar el usuario, inténtalo de nuevo');
                } else {
                    // Consulta SQL para insertar el nuevo usuario
                    const insertUserSql = 'INSERT INTO datosUsuarios (user_name, password) VALUES (?, ?)';
                    const values = [new_username, hash];

                    connection.query(insertUserSql, values, (insertError, results) => {
                        if (insertError) {
                            console.error('Error al registrar el usuario:', insertError);
                            res.status(500).send('Error al registrar el usuario. Por favor, inténtalo de nuevo.');
                        } else {
                            console.log('Usuario registrado con éxito');
                            res.send('Registro exitoso. Inicia sesión <a href="/login.html">aquí</a>.');
                        }
                    });
                }
            });
        }
    });
});



// Ruta para procesar el inicio de sesión de usuarios
app.post('/inicio_sesion', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Por favor, ingresa nombre de usuario y contraseña.');
    }

    // Consulta SQL para obtener la contraseña almacenada para el usuario
    const sql = 'SELECT password FROM datosUsuarios WHERE user_name = ?';
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Error al buscar el usuario:', error);
            res.status(500).json({ authenticated: false });
        } else if (results.length === 0) {
            // Usuario no encontrado
            console.log(req.session.authenticated);
            res.json({ authenticated: false });
        } else {
            // Comparar la contraseña ingresada con la contraseña almacenada
            const storedHash = results[0].password;
            bcrypt.compare(password, storedHash, (err, match) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    res.status(500).json({ authenticated: false });
                } else if (match) {
                    // Las contraseñas coinciden, autenticación exitosa
                    console.log("las contraseñas coincidieron")
                    req.session.authenticated = true;
                    res.redirect('/holamundo.html');
                    console.log(req.session.authenticated);
                } else {
                    // Las contraseñas no coinciden
                    console.log("las contraseñas no coincidieron")
                    req.session.authenticated = false;
                    res.json({ authenticated: false });
                    console.log(req.session.authenticated);
                }
            });
        }
    });
});
   
//Ruta Protegida
app.get('/holamundo.html',(req,res) => {
    if(req.session && req.session.authenticated){
         //solo usuarios autenticados pueden acceder
        console.log("Acceso a la página protegida");
        res.sendFile(__dirname + '/holamundo.html');
    } else {
        //usuario no autenticado
        console.log("El usuario no está autenticado");
        res.sendFile(__dirname + '/login.html');
    }
   
});

// Ruta para cerrar la sesión
app.get('/cerrar_sesion', (req, res) => {
    // Puedes destruir la sesión para cerrarla
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).send('Error al cerrar sesión');
        } else {
            // Redirigir al usuario a la página de inicio de sesión o a donde desees
            res.redirect('/login.html');
        }
    });
});
        

// Puerto de escucha
const PORT = 3005;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

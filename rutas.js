const express = require('express');
const bcrypt = require('bcrypt');
const sessionMiddleware = require('./session'); // Importar la configuración de sesiones
const connection = require('./conexion'); // Importar la conexión a la base de datos
const { obtenerUserId } = require('./conexion'); // Importa la fúncion de obtener el userid
const path = require('path'); //Contruye rutas  hacia otros directorios
const tareas = require('./tareas');
const router = express.Router();

const app = express();
const saltRounds = 10;


// Middleware para analizar y acceder a los datos del formulario HTML.
app.use(express.urlencoded({ extended: true }));
//Acceder a objetos JSON
app.use(express.json());
// Configuración de express-sessión
app.use(sessionMiddleware);

// Ruta para proteger los archivos de backend
app.use(['/conexion.js', '/rutas.js', '/session.js', '/tareas.js', '/.env','/error400.html','/error401.html','/error404.html','/error500.html','/error503.html','/mensajes.css','/mensajes.js'], (req, res, next) => {
    res.status(404);
    res.sendFile(__dirname + '/error404.html');
});


// Manejador de errores para solicitudes no autorizadas
app.use((err, req, res, next) => {
    // Loguear el error no autorizado
    console.error('Solicitud no autorizada:', req.method, req.originalUrl);

    res.status(500);
    res.sendFile(__dirname + '/error500.html');
});



// Configurar una ruta estática para servir archivos CSS y otros archivos estáticos
// __dirname se refiere a la ubicación actual del archivo JS
app.use(express.static(__dirname));

//Ruta para servir archivos estáticos desde un directorio diferente
// Configura una ruta estática para servir archivos CSS y recursos para la página "index.html"
app.use('/index-static', express.static(path.join(__dirname, '..', 'Aplicación', 'aplicacion_web', 'ListaDeTareasAjax')));


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
        return res.status(400),
        res.sendFile(__dirname +'/error400.html');
    }

    // Consulta SQL para verificar si el usuario ya existe
    const checkUserSql = 'SELECT user_name FROM Usuarios WHERE user_name = ?';
    connection.query(checkUserSql, [new_username], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error al verificar el usuario:', checkError);
            res.status(500);
            res.sendFile(__dirname + '/error500.html');
        } else if (checkResults.length > 0) {
            // El usuario ya existe
            res.send('El usuario ya existe. Por favor, elige otro nombre de usuario.<a href = "/login.html">Volver a intentarlo</a>');
        } else {
            // El usuario no existe, procede con el registro
            bcrypt.hash(new_password, saltRounds, (hashError, hash) => {
                if (hashError) {
                    console.error('Error al hashear la contraseña:', hashError);
                    res.status(500);
                    res.sendFile(__dirname + '/error500.html');
                } else {
                    // Consulta SQL para insertar el nuevo usuario
                    const insertUserSql = 'INSERT INTO Usuarios (user_name, password) VALUES (?, ?)';
                    const values = [new_username, hash];

                    connection.query(insertUserSql, values, (insertError, results) => {
                        if (insertError) {
                            console.error('Error al registrar el usuario:', insertError);
                            res.status(500);
                            res.sendFile(__dirname + '/error500.html');
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
        return res.status(400),
        res.sendFile(__dirname +'/error400.html');
    }

    // Consulta SQL para obtener la contraseña almacenada para el usuario
    const sql = 'SELECT password FROM Usuarios WHERE user_name = ?';
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Error al buscar el usuario:', error);
            res.status(500);
            res.sendFile(__dirname + '/error500.html');
        } else if (results.length === 0) {
            // Usuario no encontrado
            console.log(req.session.authenticated);
            res.status(401); 
            res.sendFile(__dirname + '/error401.html');
        } else {
            // El usuario fue encontrado, se procede a comparar la contraseña ingresada con la contraseña almacenada
            const storedHash = results[0].password;
            bcrypt.compare(password, storedHash, (err, match) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    res.status(500);
                    res.sendFile(__dirname + '/error500.html');
                } else if (match) {
                    // Las contraseñas coinciden, autenticación exitosa
                    console.log("las contraseñas coincidieron")
                    
                     // Ahora, se obtiene el userId desde la base de datos
                     obtenerUserId(username, (dbError, userId) => {
                        if (dbError) {
                            // Manejar el error de la base de datos
                            res.status(500);
                            res.sendFile(__dirname + '/error500.html');
                        } else if (userId) {
                            // Asignar el userId a la sesión
                            req.session.userId = userId;
                            req.session.authenticated = true;
                            req.session.username = username;
                            res.redirect('/index.html');
                            
                        } else {
                            // El usuario no fue encontrado
                            res.status(500);
                            res.sendFile(__dirname + '/error500.html');
                        }
                    });
                } else {
                    // Las contraseñas no coinciden
                    console.log("las contraseñas no coincidieron")
                    req.session.authenticated = false;
                    res.status(401); 
                    res.sendFile(__dirname + '/error401.html');
                    console.log(req.session.authenticated);
                }
            });
        }
    });
});
   
//Rutas Protegida
app.get('/index.html',(req,res) => {
    if(req.session && req.session.authenticated){
         //solo usuarios autenticados pueden acceder
        console.log("Acceso a la página protegida");
        const indexPath = path.join(__dirname, '..','Aplicación','aplicacion_web', 'ListaDeTareasAjax','index.html');
        res.sendFile(indexPath);
    } else {
        //usuario no autenticado
        console.log("El usuario no está autenticado");
        res.status(401); 
        res.sendFile(__dirname + '/error401.html');
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
    
//Ruta para obtener el nombre de usuario
app.get('/api/username', (req, res) => {
    if (req.session && req.session.authenticated) {
        // El usuario está autenticado, devuelve el nombre de usuario
        res.json({ username: req.session.username });
    } else {
        // El usuario no está autenticado, devuelve un valor nulo u otro indicador
        res.json({ username: null });
    }
});


//Ruta para obtener las peticiones de las tareas
app.use('/api', tareas);


// Manejador de errores 404
app.use((req, res, next) => {
    res.status(404);
    res.sendFile(__dirname + '/404.html');
  });

// Puerto de escucha
const PORT = 3006;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


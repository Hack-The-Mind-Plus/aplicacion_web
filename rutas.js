const express = require('express');
const bcrypt = require('bcrypt');
const sessionMiddleware = require('./session'); // Importar la configuración de sesiones
const connection = require('./conexion'); // Importar la conexión a la base de datos
const { obtenerUserId } = require('./conexion'); // Importa la fúncion de obtener el userid
const path = require('path'); //Contruye rutas  hacia otros directorios
const tareas = require('./tareas');

const app = express();
const saltRounds = 10;


// Middleware para analizar y acceder a los datos del formulario HTML.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Configuración de express-sessión
app.use(sessionMiddleware);


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
        return res.status(400).send('Por favor, ingresa nombre de usuario y contraseña.');
    }

    // Consulta SQL para verificar si el usuario ya existe
    const checkUserSql = 'SELECT user_name FROM Usuarios WHERE user_name = ?';
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
                    const insertUserSql = 'INSERT INTO Usuarios (user_name, password) VALUES (?, ?)';
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
    const sql = 'SELECT password FROM Usuarios WHERE user_name = ?';
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Error al buscar el usuario:', error);
            res.status(500).json({ authenticated: false });
        } else if (results.length === 0) {
            // Usuario no encontrado
            console.log(req.session.authenticated);
            res.status(500).send('Contraseña o usuario incorrectos, por favor, intentalo de nuevo: <a href="/login.html">aquí</a>.');
        } else {
            // El usuario fue encontrado, se procede a comparar la contraseña ingresada con la contraseña almacenada
            const storedHash = results[0].password;
            bcrypt.compare(password, storedHash, (err, match) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    res.status(500).json({ authenticated: false });
                } else if (match) {
                    // Las contraseñas coinciden, autenticación exitosa
                    console.log("las contraseñas coincidieron")
                    
                     // Ahora, se obtiene el userId desde la base de datos
                     obtenerUserId(username, (dbError, userId) => {
                        if (dbError) {
                            // Manejar el error de la base de datos
                            res.status(500).json({ authenticated: false });
                        } else if (userId) {
                            // Asignar el userId a la sesión
                            req.session.userId = userId;
                            req.session.authenticated = true;
                            req.session.username = username;
                            res.redirect('/index.html');
                        } else {
                            // El usuario no fue encontrado
                            res.status(500).send('Usuario no encontrado: por favor ingresa de nuevo: <a href="/login.html">aquí</a>.');
                        }
                    });
                } else {
                    // Las contraseñas no coinciden
                    console.log("las contraseñas no coincidieron")
                    req.session.authenticated = false;
                    res.status(500).send('Contraseña o usuario incorrectos, por favor, intentalo de nuevo: <a href="/login.html">aquí</a>.');
                    console.log(req.session.authenticated);
                }
            });
        }
    });
});
   
//Ruta Protegida
app.get('/index.html',(req,res) => {
    if(req.session && req.session.authenticated){
         //solo usuarios autenticados pueden acceder
        console.log("Acceso a la página protegida");
        const indexPath = path.join(__dirname, '..','Aplicación','aplicacion_web', 'ListaDeTareasAjax','index.html');
        res.sendFile(indexPath);
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



// Puerto de escucha
const PORT = 3006;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


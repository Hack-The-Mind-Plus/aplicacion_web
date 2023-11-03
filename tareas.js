const express = require('express');
const router = express.Router();
const sessionMiddleware = require('./session'); // Importa la configuración de sesiones
const connection = require('./conexion'); // Importa la conexión a la base de datos




//Ruta post para crear una tarea
router.post('/crear_tarea', sessionMiddleware,  (req, res) => {
  console.log('Solicitud POST para crear tarea recibida'); // Agregar esta línea al inicio
  const { category, content, done, endDate} = req.body;
  const userId = req.session.userId; // Asumiendo que has almacenado el ID del usuario en la sesión

  // Verifica que  los datos requeridos se hayan introducido correctamente
  if (!content || !category || !endDate || !userId) {
     // Agregar impresiones en la consola
     console.log('Datos recibidos en la solicitud POST:', req.body);
     console.log('content:', content);
     console.log('category:', category);
     console.log('endDate:', endDate);
     console.log('done:', done);
     console.log('userId:', userId);
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Crea una nueva tarea
  const nuevaTarea = {
    userId, // Asigna el ID del usuario a la tarea  
    content,
    createdAt: new Date(), // Fecha actual
    endDate,
    category,
    done 
  };

  // Inserta la tarea en la base de datos
  const query = 'INSERT INTO Tareas (id_user, description,fecha_creacion, fecha_vencimiento, estado, categoria) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nuevaTarea.userId, nuevaTarea.content,nuevaTarea.createdAt, nuevaTarea.endDate, nuevaTarea.done, nuevaTarea.category];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al insertar la tarea:', error);
      return res.status(500).json({ error: 'No se pudo crear la tarea' });
    }

    nuevaTarea.id = results.insertId;
    return res.status(201).json(nuevaTarea);
  });
});


  

  //Ruta para obtener las tareas de la base de datos.
  router.get('/obtener_tareas', sessionMiddleware, (req, res) => {
    const userId = req.session.userId; // Asumiendo que has almacenado el ID del usuario en la sesión
  
    // A continuación, debes realizar una consulta a la base de datos para obtener las tareas del usuario con el userId.
    // Puedes usar la variable userId para filtrar las tareas del usuario.
  
    const query = 'SELECT * FROM Tareas WHERE id_user = ?';
    const values = [userId];
  
    connection.query(query, values, (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al obtener las tareas' });
      }

      if (results.length === 0) {
          // Si no se encontraron tareas, envía un mensaje que indique que no hay tareas aún.
          return res.json({ mensaje: 'Aún no hay tareas.' });
      }

      // Los resultados de la consulta deben ser enviados como respuesta en formato JSON.
      res.json(results);
  });
});

  module.exports = router;
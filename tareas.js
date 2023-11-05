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
  
    //Consulta a la base de datos para obtener las tareas del usuario con el userId.
    //La variable userId se usa para filtrar las tareas del usuario.
  
    const query = 'SELECT id_tarea, description, fecha_creacion, fecha_vencimiento, estado, categoria FROM Tareas WHERE id_user = ?';
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
      console.log("resultados:", results);
  });
});

//Ruta para actualizar el estado de la tarea.
router.post('/actualizar_estado_tarea', sessionMiddleware, (req, res) => {
  const { content, done } = req.body;
  const userId = req.session.userId; // Asumiendo que has almacenado el ID del usuario en la sesión

  // Actualiza el estado de la tarea en la base de datos
  const query = 'UPDATE Tareas SET estado = ? WHERE id_user = ? AND description = ?';
  const values = [done ? '1' : '0', userId, content]; // Convierte el valor booleano a '1' (completado) o '0' (pendiente)

  connection.query(query, values, (error) => {
      if (error) {
          console.error('Error updating todo status:', error);
          return res.status(500).json({ error: 'No se pudo actualizar el estado de la tarea' });
      }

      return res.status(200).json({ message: 'Estado de tarea actualizado correctamente' });
  });
});

// Ruta para actualizar una tarea existente
router.put('/editar_tarea/:taskId', sessionMiddleware, (req, res) => {
  const taskId = req.params.taskId; // Obtén el ID de la tarea desde la URL
  const { content } = req.body; // Obtén el nuevo contenido de la tarea desde el cuerpo de la solicitud

  // Realiza la actualización en la base de datos, por ejemplo:
  const query = 'UPDATE Tareas SET description = ? WHERE id_tarea = ?';
  const values = [content, taskId];

  connection.query(query, values, (error, results) => {
      if (error) {
          console.error('Error al actualizar la tarea:', error);
          return res.status(500).json({ error: 'No se pudo actualizar la tarea' });
      }

      // La tarea se actualizó correctamente
      res.status(200).json({ message: 'Tarea actualizada con éxito' });
  });
});

// Ruta para eliminar una tarea
router.delete('/eliminar_tarea/:taskId', sessionMiddleware, (req, res) => {
  const taskId = req.params.taskId; // Obtén el ID de la tarea desde la URL
  const userId = req.session.userId; // Asumiendo que has almacenado el ID del usuario en la sesión

  // Realiza la eliminación en la base de datos
  const query = 'DELETE FROM Tareas WHERE id_tarea = ? AND id_user = ?';
  const values = [taskId, userId];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al eliminar la tarea:', error);
      return res.status(500).json({ error: 'No se pudo eliminar la tarea' });
    }

    // La tarea se eliminó correctamente
    res.status(200).json({ message: 'Tarea eliminada con éxito' });
  });
});

  module.exports = router;
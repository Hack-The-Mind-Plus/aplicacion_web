// Variables Globales
let todos = [];

//funciones para los tipos de datos.
function convertDateToDatetime(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  }

function convertDatetimeToDate(datetime) {
    const dateObject = new Date(datetime);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}
// ################# Peticiones al Endpoint #######################

function fetchUserName() {
    const usernameElement = document.querySelector('#username');
    fetch('/api/username')
    .then(response => response.json())
    .then(data => {
        const username = data.username;

        if (username) {
            // Si se obtiene un nombre de usuario, muéstralo en la página
            usernameElement.textContent = username;
        } else {
            // Si no se obtiene un nombre de usuario:
            // Redirigir al usuario a la página de inicio de sesión
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        // Maneja cualquier error en la solicitud AJAX
        console.error('Error al obtener el nombre de usuario:', error);
    });
}

function fetchTodos() {
    fetch('/api/obtener_tareas')
        .then(response => response.json())
        .then(data => {
            todos = data.map(item => ({
                id: item.id_tarea,
                content: item.description,
                endDate: convertDatetimeToDate(item.fecha_vencimiento),
                done: item.estado === "1", // Convierte a boolean (si "estado" es "1", done es true)
                category: item.categoria,
                // ... otras propiedades si las tienes
            }));
            console.log("datos devueltos:",todos);
            DisplayTodos();
        })
        .catch(error => {
            console.error('Error fetching todos:', error);
        });
}

function saveTodoToServer(todo) {
    const { content, category, endDate, done } = todo; 
    const requestData = { content, category, endDate, done };

    console.log('Datos a enviar al servidor:', requestData); 
     fetch('/api/crear_tarea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.status === 201) {
            // La tarea se creó correctamente
            return response.json();
        } else {
            // Hubo un error al crear la tarea
            throw new Error(response.statusText);
        }
    })
    .then(data => {
        console.log('Tarea creada en el servidor:', data);

        // Agregar la tarea a la lista local
        todos.push(data);

        // Crear el elemento de la tarea en la interfaz
        const todoElement = createTodoElement(data);

        // Agregar el elemento de la tarea a la lista en la interfaz
        const todoList = document.querySelector('#todo-list');
        todoList.appendChild(todoElement);

        // Formatear la fecha en el elemento de la tarea
        const endDateElement = todoElement.querySelector('.todo-content span');
        endDateElement.textContent = `(Fecha de término: ${convertDatetimeToDate(data.endDate)})`;
    })
    .catch(error => {
        console.error('Error saving todo:', error);
    });
}

function updateTodoStatus(content, done) {
    const requestData = { content, done };

    fetch('/api/actualizar_estado_tarea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.status === 200) {
            // El estado de la tarea se actualizó correctamente en la base de datos
        } else {
            // Hubo un error al actualizar el estado de la tarea
            throw new Error(response.statusText);
        }
    })
    .catch(error => {
        console.error('Error updating todo status:', error);
    });
}

function saveEditarTarea(todo) {
    // Realiza una solicitud al servidor para actualizar la tarea
    fetch(`/api/editar_tarea/${todo.id}`, {
        method: 'PUT', // Utiliza el método PUT para actualizar
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
    })
    .then(response => {
        if (response.status === 200) {
            // Los cambios se guardaron correctamente en el servidor
            console.log('Tarea actualizada en el servidor:', todo);
            // Actualiza la tarea en la interfaz de usuario
            DisplayTodos();
        } else {
            // Hubo un error al actualizar la tarea
            console.error('Error al actualizar la tarea:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error al guardar la tarea:', error);
    });
}

function deleteTarea(todo) {
    return fetch(`/api/eliminar_tarea/${todo.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 200) {
          // La tarea se eliminó correctamente en el servidor
          console.log('Tarea eliminada en el servidor:', todo);
        } else {
          // Hubo un error al eliminar la tarea
          console.error('Error al eliminar la tarea:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error al eliminar la tarea:', error);
      });
  }


  

// ################# Fin de Peticiones al Endpoint #######################

function createTodoElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-item');

    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');
    const content = document.createElement('div');
    const actions = document.createElement('div');
    const edit = document.createElement('button');
    const deleteButton = document.createElement('button');

    input.type = 'checkbox';
    input.checked = todo.done;
    span.classList.add('bubble', todo.category);

    content.classList.add('todo-content');
    actions.classList.add('actions');
    edit.classList.add('edit');
    deleteButton.classList.add('delete');



    content.innerHTML = `
        <input type="text" value="${todo.content}" readonly>
        <span> (Fecha de término: ${new Date(todo.endDate + 'T00:00').toLocaleDateString()})</span>
    `;
    edit.innerHTML = 'Editar';
    deleteButton.innerHTML = 'Eliminar';

    label.appendChild(input);
    label.appendChild(span);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);
    todoItem.appendChild(label);
    todoItem.appendChild(content);
    todoItem.appendChild(actions);

    if (todo.done) {
        todoItem.classList.add('done');
    }

    if (new Date(todo.endDate) < new Date()) {
        todoItem.classList.add('expired');
        const bubbleSpan = todoItem.querySelector('.bubble');
        const editBtn = todoItem.querySelector('.edit');
        bubbleSpan.setAttribute('disabled', 'disabled');
        editBtn.setAttribute('disabled', 'disabled');
    }

    return todoItem;
}

function handleTodoCheckboxChange(event) {
    const checkbox = event.target;
    const todoItem = checkbox.closest('.todo-item');
    const todo = todos.find(t => t.content === todoItem.querySelector('input[type="text"]').value);

    todo.done = checkbox.checked;
    if (todo.done) {
        todoItem.classList.add('done');
    } else {
        todoItem.classList.remove('done');
    }

    // Actualizar en servidor (Si se requiere)
}

function handleTodoEditClick(event) {
    const editButton = event.target;
    const todoItem = editButton.closest('.todo-item');
    const input = todoItem.querySelector('input[type="text"]');
    const todo = todos.find(t => t.content === input.value);

    input.removeAttribute('readonly');
    input.focus();

    editButton.addEventListener('click', () => {
        todo.content = input.value;
        input.setAttribute('readonly', true);
        
        // Asegúrate de que el ID de la tarea esté presente en el objeto todo
        // Puedes utilizarlo para identificar la tarea que se está editando
        saveEditarTarea(todo);
    });
} 



function handleTodoDeleteClick(event) {
    const deleteButton = event.target;
    const todoItem = deleteButton.closest('.todo-item');
    const todoContent = todoItem.querySelector('input[type="text"]').value;
  
    const todo = todos.find(t => t.content === todoContent);
  
    if (!todo) {
      console.error('No se encontró la tarea para eliminar');
      return;
    }
  
    // Realiza la solicitud al servidor para eliminar la tarea
    deleteTarea(todo)
      .then(() => {
        // La tarea se eliminó en el servidor, ahora actualiza la lista local y la interfaz de usuario
        todos = todos.filter(t => t.id !== todo.id); // Elimina la tarea de la lista local
        DisplayTodos();
      });
  }

function DisplayTodos() {
    const todoList = document.querySelector('#todo-list');
    todoList.innerHTML = "";


    if (Array.isArray(todos)) {
        // Verifica si `todos` es un array
        todos.forEach(todo => {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
            console.log("lista:", todoElement);
        });
    } else {
        todos=[];
        // Si `todos` no es un array, no hay tareas para mostrar
        const message = document.createElement('p');
        message.textContent = 'No hay tareas para mostrar.';
        todoList.appendChild(message);
    }
}

window.addEventListener('load', () => {
    const newTodoForm = document.querySelector('#new-todo-form');
    const todoList = document.querySelector('#todo-list');
    const logoutButton = document.getElementById('logoutButton');

    todos = [];

    fetchUserName();
    fetchTodos();

    

    newTodoForm.addEventListener('submit', e => {
        e.preventDefault();
    
        const content = e.target.elements.content.value;
        const category = e.target.elements.category.value;
        const inputEndDate = e.target.elements.endDate.value;
    
        // Verifica si alguno de los campos obligatorios está vacío
        if (!content || !category || !inputEndDate) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }
    
        const currentDateTime = new Date();
        const formattedCurrentDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
    
        const todo = {
            content,
            category,
            endDate: convertDateToDatetime(inputEndDate),
            done: false,
            createdAt: formattedCurrentDateTime
        };
    
        // Verificar si los datos se obtienen correctamente
        console.log('Contenido:', todo.content);
        console.log('Categoría:', todo.category);
        console.log('Fecha de término:', todo.endDate);
        console.log('hecho:',todo.done);
        console.log('fecha de inicio', todo.createdAt);
    
        saveTodoToServer(todo);
        e.target.reset();
    });

    todoList.addEventListener('change', event => {
        if (event.target.matches('input[type="checkbox"]')) {
            const checkbox = event.target;
            const todoItem = checkbox.closest('.todo-item');
            const todo = todos.find(t => t.content === todoItem.querySelector('input[type="text"]').value);
    
            todo.done = checkbox.checked;
            if (todo.done) {
                todoItem.classList.add('done');
            } else {
                todoItem.classList.remove('done');
            }
            updateTodoStatus(todo.content, todo.done);
        }
    });

    todoList.addEventListener('click', event => {
        if (event.target.matches('.edit') || event.target.matches('.save')) {
            handleTodoEditClick(event);
        } else if (event.target.matches('.delete')) {
            handleTodoDeleteClick(event);
        }
    });

    document.getElementById('logoutButton').addEventListener('click', () => {
        window.location.href = '/cerrar_sesion';
    });
});

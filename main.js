// Variables Globales
let todos = [];
//funciones para los tipos de datos.
function convertDateToDatetime(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  }

function convertDoneToVarchar(done) {
  return done ? 'true' : 'false';
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
            todos = data;
            DisplayTodos();
        })
        .catch(error => {
            console.error('Error fetching todos:', error);
        });
}

function saveTodoToServer(todo) {
    const { content, category, endDate, done } = todo; // Extraer solo los campos necesarios
    const requestData = { content, category, endDate, done };
    console.log('Datos a enviar al servidor:', requestData); // Agregar esta línea
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
        todos.push(data);
        DisplayTodos();
    })
    .catch(error => {
        console.error('Error saving todo:', error);
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
    input.addEventListener('blur', () => {
        input.setAttribute('readonly', true);
        todo.content = input.value;
        DisplayTodos();
    });
}

function handleTodoDeleteClick(event) {
    const deleteButton = event.target;
    const todoItem = deleteButton.closest('.todo-item');
    const todoContent = todoItem.querySelector('input[type="text"]').value;

    todos = todos.filter(t => t.content !== todoContent);
    DisplayTodos();
}

function DisplayTodos() {
    const todoList = document.querySelector('#todo-list');
    todoList.innerHTML = "";

    if (Array.isArray(todos)) {
        // Verifica si `todos` es un array
        todos.forEach(todo => {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
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

        const inputEndDate = e.target.elements.endDate.value; // Supongo que inputEndDate es una cadena en formato "YYYY-MM-DD"
        const currentDateTime = new Date();
        const formattedCurrentDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');

        const todo = {
            content: e.target.elements.content.value,
            category: e.target.elements.category.value,
            endDate: `${inputEndDate}T00:00:00`, // Agrega la hora y los minutos necesarios
            done: false,
            createdAt: currentDateTime.toISOString().slice(0, 19).replace('T', ' ')
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
            handleTodoCheckboxChange(event);
        }
    });

    todoList.addEventListener('click', event => {
        if (event.target.matches('.edit')) {
            handleTodoEditClick(event);
        } else if (event.target.matches('.delete')) {
            handleTodoDeleteClick(event);
        }
    });

    document.getElementById('logoutButton').addEventListener('click', () => {
        window.location.href = '/cerrar_sesion';
    });
});

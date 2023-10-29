// Variables Globales
let todos = [];

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
    fetch('/ruta al endpoint de la api para obtener los todos')
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
    fetch('/ruta al endpoint de la api para guardar todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'//Ajustar los headers
        },
        body: JSON.stringify(todo)
    })
    .then(response => response.json())
    .then(data => {
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
    todos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

window.addEventListener('load', () => {
    const nameInput = document.querySelector('#name');
    const newTodoForm = document.querySelector('#new-todo-form');
    const todoList = document.querySelector('#todo-list');
    const logoutButton = document.getElementById('logoutButton');

    fetchUserName();
    fetchTodos();

    nameInput.addEventListener('change', (e) => {
        localStorage.setItem('username', e.target.value);
    });

    newTodoForm.addEventListener('submit', e => {
        e.preventDefault();

        const todo = {
            content: e.target.elements.content.value,
            category: e.target.elements.category.value,
            endDate: e.target.elements.endDate.value,
            done: false,
            createdAt: new Date().getTime()
        };

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

    logoutButton.addEventListener('click', () => {
        window.location.href = '../../../Back/cerrar_sesion';
    });
});

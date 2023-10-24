class TodoApp {
    constructor() {
        this.todos = [];
        this.todoListElement = document.querySelector('#todo-list');
        this.init();
    }

    // Métodos para gestionar peticiones al servidor
    fetchFromServer(endpoint, options = {}) {
        return fetch(endpoint, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error fetching from ${endpoint}:`, error);
            });
    }

    fetchUserName() {
        this.fetchFromServer('/ruta al endpoint de la api para usuario')
            .then(data => {
                const nameInput = document.querySelector('#name');
                nameInput.value = data.username;
            });
    }

    fetchTodos() {
        this.fetchFromServer('/ruta al endpoint de la api para obtener los todos')
            .then(data => {
                this.todos = data;
                this.displayTodos();
            });
    }

    saveTodoToServer(todo) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo)
        };
        this.fetchFromServer('/ruta al endpoint de la api para guardar todos', options)
            .then(data => {
                this.todos.push(data);
                this.addTodoElement(data);
            });
    }

    // Métodos para gestionar elementos de tareas
    createTodoElement(todo) {
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
        content.textContent = todo.content;
        actions.classList.add('actions');
        edit.classList.add('edit');
        edit.textContent = 'Edit';
        deleteButton.classList.add('delete');
        deleteButton.textContent = 'Delete';

        actions.appendChild(edit);
        actions.appendChild(deleteButton);
        label.appendChild(input);
        label.appendChild(span);
        todoItem.appendChild(label);
        todoItem.appendChild(content);
        todoItem.appendChild(actions);

        return todoItem;
    }

    handleTodoCheckboxChange(event) {
        const checkbox = event.target;
        const todoItem = checkbox.closest('.todo-item');
        const todoContent = todoItem.querySelector('.todo-content').textContent;
        const todo = this.todos.find(t => t.content === todoContent);
        if (todo) {
            todo.done = checkbox.checked;
        }

    }

    handleTodoEditClick(event) {
        const editButton = event.target;
        const todoItem = editButton.closest('.todo-item');
        const contentDiv = todoItem.querySelector('.todo-content');
        const currentText = contentDiv.textContent;
        const newText = prompt('Edit Todo:', currentText);
        if (newText) {
            contentDiv.textContent = newText;
            const todo = this.todos.find(t => t.content === currentText);
            if (todo) {
                todo.content = newText;
            }

        }
    }

    handleTodoDeleteClick(event) {
        const deleteButton = event.target;
        const todoItem = deleteButton.closest('.todo-item');
        const todoContent = todoItem.querySelector('.todo-content').textContent;

        this.todos = this.todos.filter(t => t.content !== todoContent);
        this.deleteTodoElement(todoContent);

    }

    displayTodos() {
        this.todoListElement.innerHTML = '';
        this.todos.forEach(todo => this.addTodoElement(todo));
    }

    addTodoElement(todo) {
        const todoElement = this.createTodoElement(todo);
        this.todoListElement.appendChild(todoElement);
    }

    deleteTodoElement(content) {
        const todoItems = Array.from(this.todoListElement.children);
        const todoToDelete = todoItems.find(item => item.querySelector('.todo-content').textContent === content);
        if (todoToDelete) {
            this.todoListElement.removeChild(todoToDelete);
        }
    }

    // Delegación de Eventos
    setupEventListeners() {
        const nameInput = document.querySelector('#name');
        nameInput.addEventListener('change', (e) => {
            localStorage.setItem('username', e.target.value);
        });

        const newTodoForm = document.querySelector('#new-todo-form');
        newTodoForm.addEventListener('submit', e => {
            e.preventDefault();
            const todo = {
                content: e.target.elements.content.value,
                category: e.target.elements.category.value,
                endDate: e.target.elements.endDate.value,
                done: false,
                createdAt: new Date().getTime()
            };
            this.saveTodoToServer(todo);
            e.target.reset();
        });

        this.todoListElement.addEventListener('change', event => {
            if (event.target.matches('input[type="checkbox"]')) {
                this.handleTodoCheckboxChange(event);
            }
        });

        this.todoListElement.addEventListener('click', event => {
            if (event.target.matches('.edit')) {
                this.handleTodoEditClick(event);
            } else if (event.target.matches('.delete')) {
                this.handleTodoDeleteClick(event);
            }
        });

        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', () => {
            window.location.href = '/cerrar_sesion';
        });
    }

    // Método de inicialización
    init() {
        this.fetchUserName();
        this.fetchTodos();
        this.setupEventListeners();
    }
}

// Instancia de la aplicación
const app = new TodoApp();

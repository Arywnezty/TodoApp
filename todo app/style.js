document.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector("input[type='text']");
    const addBtn = document.getElementById("add-btn");
    const root = document.getElementById("root");
    const filterAll = document.getElementById("filter-all");
    const filterDone = document.getElementById("filter-done");
    const filterUndone = document.getElementById("filter-undone");

    let TODOS = JSON.parse(localStorage.getItem('todos')) || [];
    let currentlyEditing = null;
    let currentFilter = 'all';

    function saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(TODOS));
            console.log('ذخیره شد:', TODOS);
        } catch (e) {
            console.error('خطا در ذخیره‌سازی:', e);
        }
    }

    function handleAddTodo() {
        const inputVal = input.value.trim();
        if (!inputVal) return;

        const newTodo = {
            id: Date.now(),
            title: inputVal,
            isDone: false
        };

        TODOS.push(newTodo);
        input.value = "";
        saveToLocalStorage();
        renderTodos();
    }

    function handleDeleteTodo(targetId) {
        TODOS = TODOS.filter(item => item.id !== targetId);
        saveToLocalStorage();
        renderTodos();
    }

    function handleEditTodo(targetId) {
        if (currentlyEditing && currentlyEditing !== targetId) {
            saveEdit(currentlyEditing);
        }

        currentlyEditing = targetId;
        
        const todoItem = document.querySelector(`li[data-id="${targetId}"]`);
        const todo = TODOS.find(item => item.id === targetId);
        
        if (!todo) return;
        
        todoItem.innerHTML = `
            <input 
                type="text" 
                class="edit-input" 
                value="${todo.title}" 
                data-id="${targetId}"
                autofocus
            >
            <button onclick="saveEdit(${targetId})" class="save-btn">ذخیره</button>
            <button onclick="cancelEdit(${targetId})" class="cancel-btn">لغو</button>
        `;
        
        const input = todoItem.querySelector('.edit-input');
        input.focus();
        
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') saveEdit(targetId);
            if (e.key === 'Escape') cancelEdit(targetId);
        });
    }

    function saveEdit(targetId) {
        const input = document.querySelector(`.edit-input[data-id="${targetId}"]`);
        if (!input) return;
        
        const newText = input.value.trim();
        if (!newText) return;
        
        const todoIndex = TODOS.findIndex(item => item.id === targetId);
        if (todoIndex === -1) return;
        
        TODOS[todoIndex].title = newText;
        saveToLocalStorage();
        currentlyEditing = null;
        renderTodos();
    }

    function cancelEdit(targetId) {
        currentlyEditing = null;
        renderTodos();
    }

    function toggleTodoStatus(targetId) {
        const todoIndex = TODOS.findIndex(item => item.id === targetId);
        if (todoIndex === -1) return;
        
        TODOS[todoIndex].isDone = !TODOS[todoIndex].isDone;
        saveToLocalStorage();
        renderTodos();
    }

    function getFilteredTodos() {
        switch(currentFilter) {
            case 'done':
                return TODOS.filter(todo => todo.isDone);
            case 'undone':
                return TODOS.filter(todo => !todo.isDone);
            default:
                return TODOS;
        }
    }

    function renderTodos() {
        const filteredTodos = getFilteredTodos();
        
        root.innerHTML = `
            <div class="filter-buttons">
                <button class="${currentFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">All items</button>
                <button class="${currentFilter === 'done' ? 'active' : ''}" onclick="setFilter('done')">done</button>
                <button class="${currentFilter === 'undone' ? 'active' : ''}" onclick="setFilter('undone')">not done</button>
            </div>
            <ul>
                ${filteredTodos.map(todo => `
                    <li data-id="${todo.id}" class="${todo.isDone ? 'done' : ''}">
                        <span>${todo.title}</span>
                        <button onclick="toggleTodoStatus(${todo.id})">${todo.isDone ? 'انجام نشده' : 'انجام شده'}</button>
                        <button onclick="handleDeleteTodo(${todo.id})">حذف</button>
                        <button onclick="handleEditTodo(${todo.id})">ویرایش</button>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    function setFilter(filter) {
        currentFilter = filter;
        renderTodos();
    }

    function handleKeyPress(evt) {
        if (evt.key === "Enter") {
            handleAddTodo();
        }
    }
    addBtn.addEventListener("click", handleAddTodo);
    input.addEventListener("keypress", handleKeyPress);

    window.handleDeleteTodo = handleDeleteTodo;
    window.handleEditTodo = handleEditTodo;
    window.saveEdit = saveEdit;
    window.cancelEdit = cancelEdit;
    window.toggleTodoStatus = toggleTodoStatus;
    window.setFilter = setFilter;

    renderTodos();
});
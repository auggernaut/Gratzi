(function () {
    "use strict";
    function Stat()
    {
        this.todoLeft = 0, this.todoCompleted = 0, this.totalTodo = 0
    }

    function windowLoadHandler()

    {
        remoteStorage.claimAccess({ tasks: "rw" }).then(
          function () {
              remoteStorage.displayWidget("remotestorage-connect"), paintAll(), addEventListeners(), remoteStorage.tasks.onChange(paintAll), remoteStorage.onWidget("disconnect", paintAll)
          })
    }

    function addEventListeners() {
        document.getElementById("new-todo").addEventListener("keypress", newTodoKeyPressHandler, !1), document.getElementById("toggle-all").addEventListener("change", toggleAllChangeHandler, !1)
    }

    function inputEditTodoKeyPressHandler(event) {
        var inputEditTodo = event.target, trimmedText = inputEditTodo.value.trim(), todoId = event.target.id.slice(6);
        trimmedText ? event.keyCode === ENTER_KEY && remoteStorage.tasks.setTodoText(todoId, trimmedText) : remoteStorage.tasks.removeTodo(todoId)
    }

    function inputEditTodoBlurHandler(event) {
        var inputEditTodo = event.target, todoId = event.target.id.slice(6); remoteStorage.tasks.setTodoText(todoId, inputEditTodo.value)
    }

    function newTodoKeyPressHandler(event) {
        var trimmedText = document.getElementById("new-todo").value.trim();
        event.keyCode === ENTER_KEY && trimmedText && remoteStorage.tasks.addTodo(trimmedText)
    }

    function toggleAllChangeHandler(event) {
        remoteStorage.tasks.setAllTodosCompleted(event.target.checked)
    }


    function spanDeleteClickHandler(event) {
        remoteStorage.tasks.removeTodo(event.target.getAttribute("data-todo-id"))
    }

    function hrefClearClickHandler() {
        remoteStorage.tasks.removeAllCompletedTodos()
    }


    function todoContentHandler(event) {
        var todoId = event.target.getAttribute("data-todo-id"), div = document.getElementById("li_" + todoId), inputEditTodo = document.getElementById("input_" + todoId);
        div.className = "editing", inputEditTodo.focus()
    }

    function checkboxChangeHandler(event) {
        var checkbox = event.target;
        remoteStorage.tasks.setTodoCompleted(checkbox.getAttribute("data-todo-id"), checkbox.checked)
    }

    function paintAll() {
        remoteStorage.tasks.getTodos().then(
            function (todosMap) {
                var todosArr = [], i; for (i in todosMap) todosArr.push(todosMap[i]); computeStats(todosArr), redrawTodosUI(todosArr), redrawStatsUI(todosArr), changeToggleAllCheckboxState(todosArr)
            })
    }

    function computeStats(todos) {
        var i, l; stat = new Stat, stat.totalTodo = todos.length;
        for (i = 0, l = todos.length; i < l; i++) todos[i].completed && stat.todoCompleted++; stat.todoLeft = stat.totalTodo - stat.todoCompleted
    } 
    
    function redrawTodosUI(todos) {
        var todo, checkbox, label, deleteLink, divDisplay, inputEditTodo, li, i, l, ul = document.getElementById("todo-list");
        document.getElementById("main").style.display = todos.length ? "block" : "none", ul.innerHTML = "", document.getElementById("new-todo").value = "";
        for (i = 0, l = todos.length; i < l; i++)
            todo = todos[i], checkbox = document.createElement("input"), checkbox.className = "toggle", checkbox.setAttribute("data-todo-id", todo.id), checkbox.type = "checkbox", checkbox.addEventListener("change", checkboxChangeHandler), label = document.createElement("label"), label.setAttribute("data-todo-id", todo.id), label.appendChild(document.createTextNode(todo.title)), label.addEventListener("dblclick", todoContentHandler), deleteLink = document.createElement("button"), deleteLink.className = "destroy", deleteLink.setAttribute("data-todo-id", todo.id), deleteLink.addEventListener("click", spanDeleteClickHandler), divDisplay = document.createElement("div"), divDisplay.className = "view", divDisplay.setAttribute("data-todo-id", todo.id), divDisplay.appendChild(checkbox), divDisplay.appendChild(label), divDisplay.appendChild(deleteLink), inputEditTodo = document.createElement("input"), inputEditTodo.id = "input_" + todo.id, inputEditTodo.className = "edit", inputEditTodo.value = todo.title, inputEditTodo.addEventListener("keypress", inputEditTodoKeyPressHandler), inputEditTodo.addEventListener("blur", inputEditTodoBlurHandler), li = document.createElement("li"), li.id = "li_" + todo.id, li.appendChild(divDisplay), li.appendChild(inputEditTodo), todo.completed && (li.className += "complete", checkbox.checked = !0), ul.appendChild(li)
    }

    function changeToggleAllCheckboxState(todos) {
        var toggleAll = document.getElementById("toggle-all");
        toggleAll.checked = stat.todoCompleted === todos.length
    }

    function redrawStatsUI(todos) {
        removeChildren(document.getElementsByTagName("footer")[0]), document.getElementById("footer").style.display = todos.length ? "block" : "none", stat.todoCompleted && drawTodoClear(), stat.totalTodo && drawTodoCount()
    }

    function drawTodoCount() {
        var number = document.createElement("strong"), remaining = document.createElement("span"), text = " " + (stat.todoLeft === 1 ? "item" : "items") + " left";
        number.innerHTML = stat.todoLeft, remaining.id = "todo-count", remaining.appendChild(number), remaining.appendChild(document.createTextNode(text)), document.getElementsByTagName("footer")[0].appendChild(remaining)
    }

    function drawTodoClear() {
        var buttonClear = document.createElement("button");
        buttonClear.id = "clear-completed", buttonClear.addEventListener("click", hrefClearClickHandler), buttonClear.innerHTML = "Clear completed (" + stat.todoCompleted + ")", document.getElementsByTagName("footer")[0].appendChild(buttonClear)
    }

    function removeChildren(node) {
        node.innerHTML = ""
    }

    var stat = {}, ENTER_KEY = 13;
    window.addEventListener("load", windowLoadHandler, !1)

})();



remoteStorage.defineModule("tasks", function (privateClient) {
    function getUuid() {
        var i, random, uuid = ""; for (i = 0; i < 32; i++) { random = Math.random() * 16 | 0; if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-"; uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16) } return uuid
    }

    function Todo(title) {
        this.id = getUuid(), this.title = title, this.completed = !1
    } return {
        exports: {
            getTodos: function () {
                return console.log("in getTodos, calling getAll"), privateClient.getAll("todos/")
            }, addTodo: function (text) {
                var todo = new Todo(text);
                privateClient.storeObject("todo-list-item", "todos/" + todo.id, todo)
            }, setTodo: function (id, todo) {
                console.log("setTodo", id, todo), privateClient.storeObject("todo-list-item", "todos/" + id, todo)
            }, setTodoText: function (id, text) {
                privateClient.getObject("todos/" + id).then(function (obj) {
                    console.log("updating text of item " + id + ' from "' + obj.text + '" to "' + text + '"'), obj.title = text, privateClient.storeObject("todo-list-item", "todos/" + id, obj)
                })
            }, setTodoCompleted: function (id, value) {
                privateClient.getObject("todos/" + id).then(function (obj) {
                    obj.completed = value, privateClient.storeObject("todo-list-item", "todos/" + id, obj)
                })
            }, setAllTodosCompleted: function (value) {
                privateClient.getAll("todos/").then(function (objs) {
                    for (var i in objs) objs[i].completed != value && (objs[i].completed = value, privateClient.storeObject("todo-list-item", "todos/" + i, objs[i]))
                })
            }, removeTodo: function (id) {
                privateClient.remove("todos/" + id)
            }, removeAllCompletedTodos: function () {
                privateClient.getAll("todos/").then(function (objs) {
                    for (var i in objs) objs[i].completed && privateClient.remove("todos/" + i)
                })
            }, onChange: function (cb) {
                privateClient.on("change", function (event) {
                    console.log("change", event), cb(event.oldValue, event.newValue)
                })
            }
        }
    }
});
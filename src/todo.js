"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const tb = require("../node_modules/taco-bell/index");
const ENTER_KEY_CODE = 13;
var TodoState;
(function (TodoState) {
    TodoState[TodoState["ACTIVE"] = 0] = "ACTIVE";
    TodoState[TodoState["COMPLETED"] = 1] = "COMPLETED";
})(TodoState || (TodoState = {}));
var TodoFilter;
(function (TodoFilter) {
    TodoFilter[TodoFilter["ALL"] = 0] = "ALL";
    TodoFilter[TodoFilter["ACTIVE"] = 1] = "ACTIVE";
    TodoFilter[TodoFilter["COMPLETED"] = 2] = "COMPLETED";
})(TodoFilter || (TodoFilter = {}));
let Todo = class Todo {
    constructor(description, state = TodoState.ACTIVE) {
        this.editing = new tb.ModelElement(false);
        this.description = new tb.ModelElement(description);
        this.state = new tb.ModelElement(state);
    }
};
Todo = __decorate([
    tb.persist
], Todo);
let TodoModel = class TodoModel {
    constructor(title = "todos", initialFilter = TodoFilter.ALL) {
        this.title = new tb.ModelElement(title);
        this.todos = new tb.ModelArray();
        this.filter = new tb.ModelElement(initialFilter);
    }
    serialize() {
        let plainObject = {
            todos: function () {
                let plainTodos = [];
                for (let todo of this.todos.get()) {
                    plainTodos.push({
                        description: todo.get().description.get(),
                        state: todo.get().state.get()
                    });
                }
                return plainTodos;
            }.bind(this)(),
            filter: this.filter.get()
        };
        return JSON.stringify(plainObject);
    }
    deserialize(todoModel, serialized) {
        let plainObject = JSON.parse(serialized);
        setTimeout(function () {
            todoModel.filter.set(plainObject["filter"]);
            for (let plainTodo of plainObject["todos"]) {
                todoModel.todos.add(new Todo(plainTodo["description"], plainTodo["state"]));
            }
        }, 100);
        return todoModel;
    }
};
TodoModel = __decorate([
    tb.persistentModel
], TodoModel);
const model = new TodoModel();
class FilterHandle extends tb.Component {
    constructor(label, filter) {
        super("li");
        this.child(new tb.Component("a")
            .withText(label)
            .withClass(new tb.Binding(model.filter, function (currentFilter) {
            return currentFilter == filter ? "selected" : "";
        }))
            .on("click", function () {
            model.filter.set(filter);
        })
            .reinit()).reinit();
    }
}
new tb.Component("section", document.getElementById("app-root"))
    .withClass("todoapp")
    .child(new tb.Component("header")
    .withClass("header")
    .child(new tb.Component("h1")
    .withText(model.title)
    .reinit(), new tb.Component("input")
    .withClass("new-todo")
    .withAttribute("type", "text")
    .withAttribute("placeholder", "What needs to be done?")
    .on("keyup", function (event) {
    if (event.keyCode === ENTER_KEY_CODE) {
        let input = event.currentTarget;
        model.todos.add(new Todo(input.value));
        input.value = "";
    }
})
    .reinit(), new tb.Component("section")
    .withClass("main")
    .child(new tb.Component("input")
    .withAttribute("type", "checkbox")
    .withClass("toggle-all")
    .on("click", function (event) {
    let state = event.currentTarget.checked ? TodoState.COMPLETED : TodoState.ACTIVE;
    for (let todo of model.todos.get())
        todo.get().state.set(state);
})
    .reinit()).reinit(), new tb.Collection("ul")
    .withClass("todo-list")
    .children(model.todos, function (todo) {
    let label = new tb.Component("label")
        .withText(todo.get().description)
        .on("click", function () {
        todo.get().editing.set(true);
        input.focus();
        this.hide();
    })
        .reinit();
    let input = new tb.Component("input")
        .withAttribute("type", "text")
        .withClass(new tb.Binding(todo.get().editing, function (nowEditing) {
        return nowEditing ? "edit" : "edit hidden";
    }))
        .withValue(todo.get().description)
        .on("focusout", function (event) {
        this.hide();
        todo.get().editing.set(false);
        let newDescription = event.currentTarget.value;
        todo.get().description.set(newDescription);
        label.show();
    })
        .reinit();
    function getTodoCssClass() {
        let todoState = todo.get().state.get();
        let editing = todo.get().editing.get();
        let filter = model.filter.get();
        return "todo " + ((filter == TodoFilter.ALL
            || (filter == TodoFilter.ACTIVE && todoState == TodoState.ACTIVE)
            || (filter == TodoFilter.COMPLETED) && todoState == TodoState.COMPLETED)
            ? ((todoState == TodoState.COMPLETED ? "completed " : "") + (editing ? "editing " : "")) : "hidden");
    }
    return new tb.Component("li")
        .withClass(new tb.Binding(todo.get().state, getTodoCssClass), new tb.Binding(model.filter, getTodoCssClass), new tb.Binding(todo.get().editing, getTodoCssClass))
        .child(new tb.Component("input")
        .withAttribute("type", "checkbox")
        .withClass("toggle")
        .withValue(new tb.TwoWayBinding(todo.get().state, function (newState) {
        return newState == TodoState.COMPLETED;
    }, function (isChecked) {
        return isChecked ? TodoState.COMPLETED : TodoState.ACTIVE;
    }))
        .reinit(), label, input, new tb.Component("button")
        .withClass("destroy")
        .on("click", function () {
        model.todos.remove(todo);
    })
        .reinit())
        .reinit();
}).reinit()).reinit(), new tb.Component("footer")
    .withClass("footer", new tb.Binding(model.todos.size, function (currentSize) {
    return currentSize == 0 ? "hidden" : "";
}))
    .child(new tb.Component("span")
    .withClass("todo-count")
    .withText(new tb.Binding(model.todos.size, function (newSize) {
    return newSize + " items left";
}))
    .reinit(), new tb.Component("ul")
    .withClass("filters")
    .child(new FilterHandle("All", TodoFilter.ALL), new FilterHandle("Active", TodoFilter.ACTIVE), new FilterHandle("Completed", TodoFilter.COMPLETED)).reinit()).reinit()).reinit();
window["model"] = model;

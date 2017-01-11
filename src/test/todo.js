var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../Component", "../ModelElement", "../ModelArray", "../Collection", "../Binding"], function (require, exports) {
    "use strict";
    // test application implementing todo.mvc requirements
    const Component_1 = require("../Component");
    const ModelElement_1 = require("../ModelElement");
    const ModelArray_1 = require("../ModelArray");
    const Collection_1 = require("../Collection");
    const Binding_1 = require("../Binding");
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
            this.editing = new ModelElement_1.default(false);
            this.description = new ModelElement_1.default(description);
            this.state = new ModelElement_1.default(state);
        }
    };
    Todo = __decorate([
        Binding_1.persist
    ], Todo);
    let TodoModel = class TodoModel {
        constructor(title = "todos", initialFilter = TodoFilter.ALL) {
            this.title = new ModelElement_1.default(title);
            this.todos = new ModelArray_1.default();
            this.filter = new ModelElement_1.default(initialFilter);
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
        Binding_1.persistentModel
    ], TodoModel);
    const model = new TodoModel();
    class FilterHandle extends Component_1.default {
        constructor(label, filter) {
            super("li");
            this.child(new Component_1.default("a")
                .withText(label)
                .withClass(new Binding_1.Binding(model.filter, function (currentFilter) {
                return currentFilter == filter ? "selected" : "";
            }))
                .on("click", function () {
                model.filter.set(filter);
            })
                .reinit()).reinit();
        }
    }
    new Component_1.default("section", document.getElementById("app-root"))
        .withClass("todoapp")
        .child(new Component_1.default("header")
        .withClass("header")
        .child(new Component_1.default("h1")
        .withText(model.title)
        .reinit(), new Component_1.default("input")
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
        .reinit(), new Component_1.default("section")
        .withClass("main")
        .child(new Component_1.default("input")
        .withAttribute("type", "checkbox")
        .withClass("toggle-all")
        .on("click", function (event) {
        let state = event.currentTarget.checked ? TodoState.COMPLETED : TodoState.ACTIVE;
        for (let todo of model.todos.get())
            todo.get().state.set(state);
    })
        .reinit()).reinit(), new Collection_1.default("ul")
        .withClass("todo-list")
        .children(model.todos, function (todo) {
        let label = new Component_1.default("label")
            .withText(todo.get().description)
            .on("click", function () {
            todo.get().editing.set(true);
            input.focus();
            this.hide();
        })
            .reinit();
        let input = new Component_1.default("input")
            .withAttribute("type", "text")
            .withClass(new Binding_1.Binding(todo.get().editing, function (nowEditing) {
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
        return new Component_1.default("li")
            .withClass(new Binding_1.Binding(todo.get().state, getTodoCssClass), new Binding_1.Binding(model.filter, getTodoCssClass), new Binding_1.Binding(todo.get().editing, getTodoCssClass))
            .child(new Component_1.default("input")
            .withAttribute("type", "checkbox")
            .withClass("toggle")
            .withValue(new Binding_1.TwoWayBinding(todo.get().state, function (newState) {
            return newState == TodoState.COMPLETED;
        }, function (isChecked) {
            return isChecked ? TodoState.COMPLETED : TodoState.ACTIVE;
        }))
            .reinit(), label, input, new Component_1.default("button")
            .withClass("destroy")
            .on("click", function () {
            model.todos.remove(todo);
        })
            .reinit())
            .reinit();
    }).reinit()).reinit(), new Component_1.default("footer")
        .withClass("footer", new Binding_1.Binding(model.todos.size, function (currentSize) {
        return currentSize == 0 ? "hidden" : "";
    }))
        .child(new Component_1.default("span")
        .withClass("todo-count")
        .withText(new Binding_1.Binding(model.todos.size, function (newSize) {
        return newSize + " items left";
    }))
        .reinit(), new Component_1.default("ul")
        .withClass("filters")
        .child(new FilterHandle("All", TodoFilter.ALL), new FilterHandle("Active", TodoFilter.ACTIVE), new FilterHandle("Completed", TodoFilter.COMPLETED)).reinit()).reinit()).reinit();
    // uncomment to allow global inspection of model state
    window["model"] = model;
});

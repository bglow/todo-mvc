// test application implementing todo.mvc requirements
import Component from "../Component";
import ModelElement from "../ModelElement";
import ModelArray from "../ModelArray";
import Collection from "../Collection";
import {Binding, TwoWayBinding, persistentModel, persist, Serializable, Persistence} from "../Binding";

const ENTER_KEY_CODE = 13;

enum TodoState {
    ACTIVE,
    COMPLETED
}

enum TodoFilter {
    ALL,
    ACTIVE,
    COMPLETED
}

@persist
class Todo {
    readonly description: ModelElement<string>;
    readonly state: ModelElement<TodoState>;
    readonly editing: ModelElement<boolean> = new ModelElement<boolean>(false);

    constructor(description: string, state = TodoState.ACTIVE) {
        this.description = new ModelElement<string>(description);
        this.state = new ModelElement<TodoState>(state);
    }
}

@persistentModel
class TodoModel implements Serializable<TodoModel> {
    readonly title: ModelElement<string>;
    readonly todos: ModelArray<Todo>;
    readonly filter: ModelElement<TodoFilter>;
    constructor(title = "todos", initialFilter = TodoFilter.ALL) {
        this.title = new ModelElement<string>(title);
        this.todos = new ModelArray<Todo>();
        this.filter = new ModelElement<TodoFilter>(initialFilter);
    }

    serialize(): string {
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

    deserialize(todoModel: TodoModel, serialized: string): TodoModel {
        let plainObject = JSON.parse(serialized);
        setTimeout(function () {
            todoModel.filter.set(plainObject["filter"]);
            for (let plainTodo of plainObject["todos"]) {
                todoModel.todos.add(new Todo(plainTodo["description"], plainTodo["state"]));
            }
        },100);
        return todoModel;
    }
}

const model = new TodoModel();

class FilterHandle extends Component {
    constructor(label: string, filter: TodoFilter) {
        super("li");
        this.child(
            new Component("a")
                .withText(label)
                .withClass(new Binding<TodoFilter,string>(model.filter, function (currentFilter: TodoFilter): string {
                    return currentFilter == filter ? "selected" : "";
                }))
                .on("click", function (): void {
                    model.filter.set(filter);
                })
                .reinit()
        ).reinit();
    }
}

new Component("section", document.getElementById("app-root"))
.withClass("todoapp")
.child(
    new Component("header")
        .withClass("header")
        .child(
            new Component("h1")
                .withText(model.title)
                .reinit(),
            new Component("input")
                .withClass("new-todo")
                .withAttribute("type", "text")
                .withAttribute("placeholder", "What needs to be done?")
                .on("keyup", function (this: Component, event: Event) {
                    if ((event as KeyboardEvent).keyCode === ENTER_KEY_CODE) {
                        let input = event.currentTarget as HTMLInputElement;
                        model.todos.add(new Todo(input.value));
                        input.value = "";
                    }
                })
                .reinit(),
            new Component("section")
                .withClass("main")
                .child(
                    new Component("input")
                        .withAttribute("type", "checkbox")
                        .withClass("toggle-all")
                        .on("click", function (event: Event) {
                            let state = (event.currentTarget as HTMLInputElement).checked ? TodoState.COMPLETED : TodoState.ACTIVE;
                            for (let todo of model.todos.get())
                                todo.get().state.set(state);
                        })
                        .reinit()
                ).reinit(),
            new Collection("ul")
                .withClass("todo-list")
                .children(model.todos, function(todo: ModelElement<Todo>) {

                    let label = new Component("label")
                        .withText(todo.get().description)
                        .on("click", function (this: Component) {
                            todo.get().editing.set(true);
                            input.focus();
                            this.hide();
                        })
                        .reinit();

                    let input = new Component("input")
                        .withAttribute("type","text")
                        .withClass(new Binding<boolean,string>(todo.get().editing, function (nowEditing: boolean) {
                            return nowEditing ? "edit" : "edit hidden";
                        }))
                        .withValue(todo.get().description)
                        .on("focusout", function (this: Component, event: Event) {
                            this.hide();
                            todo.get().editing.set(false);
                            let newDescription = (event.currentTarget as HTMLInputElement).value;
                            todo.get().description.set(newDescription);
                            label.show();
                        })
                        .reinit();

                    function getTodoCssClass(): string {
                        let todoState = todo.get().state.get();
                        let editing = todo.get().editing.get();
                        let filter = model.filter.get();
                        return (filter == TodoFilter.ALL
                        || (filter == TodoFilter.ACTIVE && todoState == TodoState.ACTIVE)
                        || (filter == TodoFilter.COMPLETED) && todoState == TodoState.COMPLETED)
                            ? (editing ? "editing" : "") : "hidden";
                    }

                    return new Component("li")
                        .withClass(
                            new Binding<TodoState,string>(todo.get().state, getTodoCssClass),
                            new Binding<TodoFilter,string>(model.filter, getTodoCssClass),
                            new Binding<boolean,string>(todo.get().editing, getTodoCssClass)
                        )
                        .child(
                            new Component("input")
                                .withAttribute("type", "checkbox")
                                .withClass("toggle")
                                .withValue(new TwoWayBinding<boolean,TodoState,boolean>(todo.get().state, function (newState: TodoState) {
                                    return newState == TodoState.COMPLETED;
                                }, function (isChecked: boolean): TodoState {
                                    return isChecked ? TodoState.COMPLETED : TodoState.ACTIVE;
                                }))
                                .reinit(),
                            label,
                            input,
                            new Component("button")
                                .withClass("destroy")
                                .on("click", function () {
                                    model.todos.remove(todo);
                                })
                                .reinit()
                        )
                        .reinit();
                }).reinit()
        ).reinit(),
    new Component("footer")
        .withClass("footer")
        .child(
            new Component("span")
                .withClass("todo-count")
                .withText(new Binding<number,string>(model.todos.size, function (newSize: number): string {
                    return newSize + " items left";
                }))
                .reinit(),
            new Component("ul")
                .withClass("filters")
                .child(
                    new FilterHandle("All", TodoFilter.ALL),
                    new FilterHandle("Active", TodoFilter.ACTIVE),
                    new FilterHandle("Completed", TodoFilter.COMPLETED)
                ).reinit()
        ).reinit()
).reinit();

// uncomment to allow global inspection of model state
window["model"] = model;
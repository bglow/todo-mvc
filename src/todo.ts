// test application implementing todo.mvc requirements
import * as tb from "../node_modules/taco-bell/index";

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

@tb.persist
class Todo {
    readonly description: tb.ModelElement<string>;
    readonly state: tb.ModelElement<TodoState>;
    readonly editing: tb.ModelElement<boolean> = new tb.ModelElement<boolean>(false);

    constructor(description: string, state = TodoState.ACTIVE) {
        this.description = new tb.ModelElement<string>(description);
        this.state = new tb.ModelElement<TodoState>(state);
    }
}

@tb.persistentModel
class TodoModel implements tb.Serializable<TodoModel> {
    readonly title: tb.ModelElement<string>;
    readonly todos: tb.ModelArray<Todo>;
    readonly filter: tb.ModelElement<TodoFilter>;
    constructor(title = "todos", initialFilter = TodoFilter.ALL) {
        this.title = new tb.ModelElement<string>(title);
        this.todos = new tb.ModelArray<Todo>();
        this.filter = new tb.ModelElement<TodoFilter>(initialFilter);
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

class FilterHandle extends tb.Component {
    constructor(label: string, filter: TodoFilter) {
        super("li");
        this.child(
            new tb.Component("a")
                .withText(label)
                .withClass(new tb.Binding<TodoFilter,string>(model.filter, function (currentFilter: TodoFilter): string {
                    return currentFilter == filter ? "selected" : "";
                }))
                .on("click", function (): void {
                    model.filter.set(filter);
                })
        );
    }
}

new tb.Component("section", document.getElementById("app-root"))
.withClass("todoapp")
.child(
    new tb.Component("header")
        .withClass("header")
        .child(
            new tb.Component("h1")
                .withText(model.title),
            new tb.Component("input")
                .withClass("new-todo")
                .withAttribute("type", "text")
                .withAttribute("placeholder", "What needs to be done?")
                .on("keyup", function (this: tb.Component, event: Event) {
                    if ((event as KeyboardEvent).keyCode === ENTER_KEY_CODE) {
                        let input = event.currentTarget as HTMLInputElement;
                        model.todos.add(new Todo(input.value));
                        input.value = "";
                    }
                }),
            new tb.Component("section")
                .withClass("main")
                .child(
                    new tb.Component("input")
                        .withAttribute("type", "checkbox")
                        .withClass("toggle-all")
                        .on("click", function (event: Event) {
                            let state = (event.currentTarget as HTMLInputElement).checked ? TodoState.COMPLETED : TodoState.ACTIVE;
                            for (let todo of model.todos.get())
                                todo.get().state.set(state);
                        })
                ),
            new tb.Collection("ul")
                .withClass("todo-list")
                .children(model.todos, function(todo: tb.ModelElement<Todo>) {

                    let label = new tb.Component("label")
                        .withText(todo.get().description)
                        .on("click", function (this: tb.Component) {
                            todo.get().editing.set(true);
                            input.focus();
                            this.hide();
                        });

                    let input = new tb.Component("input")
                        .withAttribute("type","text")
                        .withClass(new tb.Binding<boolean,string>(todo.get().editing, function (nowEditing: boolean) {
                            return nowEditing ? "edit" : "edit hidden";
                        }))
                        .withValue(todo.get().description)
                        .on("focusout", function (this: tb.Component, event: Event) {
                            this.hide();
                            todo.get().editing.set(false);
                            let newDescription = (event.currentTarget as HTMLInputElement).value;
                            todo.get().description.set(newDescription);
                            label.show();
                        });

                    function getTodoCssClass(): string {
                        let todoState = todo.get().state.get();
                        let editing = todo.get().editing.get();
                        let filter = model.filter.get();
                        return "todo " + ((filter == TodoFilter.ALL
                        || (filter == TodoFilter.ACTIVE && todoState == TodoState.ACTIVE)
                        || (filter == TodoFilter.COMPLETED) && todoState == TodoState.COMPLETED)
                            ? ((todoState == TodoState.COMPLETED ? "completed ": "") + (editing ? "editing " : "")) : "hidden");
                    }

                    return new tb.Component("li")
                        .withClass(
                            new tb.Binding<TodoState,string>(todo.get().state, getTodoCssClass),
                            new tb.Binding<TodoFilter,string>(model.filter, getTodoCssClass),
                            new tb.Binding<boolean,string>(todo.get().editing, getTodoCssClass)
                        )
                        .child(
                            new tb.Component("input")
                                .withAttribute("type", "checkbox")
                                .withClass("toggle")
                                .withValue(new tb.TwoWayBinding<boolean,TodoState,boolean>(todo.get().state, function (newState: TodoState) {
                                    return newState == TodoState.COMPLETED;
                                }, function (isChecked: boolean): TodoState {
                                    return isChecked ? TodoState.COMPLETED : TodoState.ACTIVE;
                                })),
                            label,
                            input,
                            new tb.Component("button")
                                .withClass("destroy")
                                .on("click", function () {
                                    model.todos.remove(todo);
                                })
                        )
                })
        ),
    new tb.Component("footer")
        .withClass(
            "footer",
            new tb.Binding<number,string>(model.todos.size, function (currentSize: number) {
                return currentSize == 0 ? "hidden" : "";
            })
        )
        .child(
            new tb.Component("span")
                .withClass("todo-count")
                .withText(new tb.Binding<number,string>(model.todos.size, function (newSize: number): string {
                    return newSize + " items left";
                })),
            new tb.Component("ul")
                .withClass("filters")
                .child(
                    new FilterHandle("All", TodoFilter.ALL),
                    new FilterHandle("Active", TodoFilter.ACTIVE),
                    new FilterHandle("Completed", TodoFilter.COMPLETED)
                )
        ));

tb.ComponentQueue.cycle();

// uncomment to allow global inspection of model state
window["model"] = model;
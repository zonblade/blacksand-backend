interface I_RequestTodo {
    id:string,
    content:string,
    status:string,
}

interface I_RequestReport<T> {
    title:string,
    type:string,
    content:string,
    new_todo:Array<I_RequestTodo>,
    old_todo:Array<I_RequestTodo>,
    custom:T
}

export type {
    I_RequestReport,
    I_RequestTodo
}
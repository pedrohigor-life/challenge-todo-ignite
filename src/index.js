const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(400).json({ error: "User not exists!" });

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (!userAlreadyExists) {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    };

    users.push(user);

    return response.status(201).json(user);
  }

  return response.status(400).json({ error: "User Already Exists!" });
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // const todos = user.todos.map((todo) => {
  //   return {
  //     todo: {
  //       ...todo
  //     }
  //   }
  // });

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not exists!" });

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not exists!" });

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not exists!" });

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
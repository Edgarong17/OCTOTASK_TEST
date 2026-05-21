import API_LIST from '../API';

function ensureOk(response) {
  if (!response.ok) {
    throw new Error('Something went wrong ...');
  }
  return response;
}

export function checkDuplicates(username, email) {
  return fetch(API_LIST + '/users/Check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email })
  }).then(ensureOk);
}

export function createUser(username, email, password, role) {
  return fetch(API_LIST + '/users/CreateUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password, role })
  }).then(ensureOk)
    .then((response) => response.json());
}

/* Example 

import API_LIST from '../API';

function ensureOk(response) {
  if (!response.ok) {
    throw new Error('Something went wrong ...');
  }
  return response;
}

export function fetchTodos() {
  return fetch(API_LIST)
    .then(ensureOk)
    .then((response) => response.json());
}

export function fetchTodoById(id) {
  return fetch(`${API_LIST}/${id}`)
    .then(ensureOk)
    .then((response) => response.json());
}

export function createTodo(description) {
  return fetch(API_LIST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description })
  }).then(ensureOk);
}

export function updateTodo(id, description, done) {
  return fetch(`${API_LIST}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description, done })
  }).then(ensureOk);
}

export function deleteTodo(id) {
  return fetch(`${API_LIST}/${id}`, {
    method: 'DELETE'
  }).then(ensureOk);
}


*/
import API_LIST from '../API';

export function logIn(username, password) {
  return fetch(API_LIST + '/users/Login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    return response.json();
  });
}

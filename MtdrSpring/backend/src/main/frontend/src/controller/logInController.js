import { logIn } from '../services/LoginService';

export async function handleLogin(username, password) {
  try {
    const userData = await logIn(username, password);
    return userData;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
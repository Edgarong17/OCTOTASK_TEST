import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import LoginView from './LoginView';
import { setUpUserEvent } from '../../testUtils/setUpUserEvent';

vi.mock('../../API', () => ({
  default: 'http://localhost:8080/api',
}));

// Mocking HTTP requests with Mock Service Worker
const server = setupServer(
  rest.post('http://localhost:8080/api/users/Login', async (req, res, ctx) => {
    const body = await req.json();

    if (body.username === 'worker' && body.password === 'secret') {
      return res(
        ctx.status(200),
        ctx.json({ id: 8, username: 'worker', role: 'developer', teamId: 3 }),
      );
    }

    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LoginView Component', () => {
  test('submits happy-path login and calls onLogin with user payload', async () => {
    const onLogin = vi.fn(); // Mock function (fn)
    const onGoToRegister = vi.fn();

    const { user } = setUpUserEvent(
      <LoginView onLogin={onLogin} onGoToRegister={onGoToRegister} />,
    );

    // Strict HTMLElement typing from pattern
    const usernameInput: HTMLElement = screen.getByPlaceholderText(/username/i);
    const passwordInput: HTMLElement = screen.getByPlaceholderText(/password/i);
    const submitButton: HTMLElement = screen.getByRole('button', { name: /sign in/i });

    // Form Testing (user type events)
    await user.type(usernameInput, 'worker');
    await user.type(passwordInput, 'secret');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        id: 8,
        username: 'worker',
        role: 'developer',
        teamId: 3,
      });
    });
  });

  test('alerts when credentials are invalid', async () => {
    const onLogin = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {}); // Mock function (spy)

    const { user } = setUpUserEvent(
      <LoginView onLogin={onLogin} onGoToRegister={vi.fn()} />,
    );

    const usernameInput: HTMLElement = screen.getByPlaceholderText(/username/i);
    const passwordInput: HTMLElement = screen.getByPlaceholderText(/password/i);
    const submitButton: HTMLElement = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'worker');
    await user.type(passwordInput, 'wrong');
    await user.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(onLogin).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  test('navigates to register view when user clicks register link', async () => {
    const onGoToRegister = vi.fn();

    const { user } = setUpUserEvent(
      <LoginView onLogin={vi.fn()} onGoToRegister={onGoToRegister} />,
    );

    const registerLink: HTMLElement = screen.getByText(/register/i);
    await user.click(registerLink);
    
    expect(onGoToRegister).toHaveBeenCalledWith('register');
  });
});
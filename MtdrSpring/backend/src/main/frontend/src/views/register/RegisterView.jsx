import React, { useState } from 'react';
import './RegisterView.css';
import { registerUser } from '../../controller/registerController';

import logo from '../../assets/logo.png';

function RegisterView({ onRegister, onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [setError] = useState('');

  async function handleSubmit(event) {
    try {
      event.preventDefault();
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const userData = await registerUser(username, email, password, role);
      if (userData) {
        onRegister(userData);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during registration. Please try again.');
    }
  }

  return (
    <div class="registerViewContainer">
      <div class="registerContainer">
        <form onSubmit={handleSubmit}>

          <div class="card-header">
            <div class="brand-title">
              <img src={logo} alt="OctoTask" class="brand-icon" />
              <h2 class="brand-text">OCTO</h2>
              <h2 class="brand-text2">TASK</h2>
            </div>
            <p class="brand-subtitle">More arms for your tasks</p>
          </div>

           <div class="inputGroup">
            <label class="registerLabel">Email:</label>
            <input class="registerInput"
              id="email"
              type="text"
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div class="inputGroup">
            <label class="registerLabel">Username:</label>
            <input class="registerInput"
              id="username"
              type="text"
              placeholder="Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div class="inputGroup">
            <label class="registerLabel">Password:</label>
            <input class="registerInput"
              id="password"
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div class="inputGroup">
            <label class="registerLabel">Confirm Password:</label>
            <input class="registerInput"
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div class="inputGroup">
            <label class="registerLabel">Role:</label>
            <select 
              class="registerInput"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select your role...</option>              
              <option value="user">Developer</option>
              <option value="admin">Manager</option>
            </select>
          </div>

          <button type="submit" class="registerButton">Create Account</button>
          <span class="underlinedText" onClick={() => onBackToLogin('login')}> Log In </span>
        </form>
      </div>
    </div>
  );
}

export default RegisterView;

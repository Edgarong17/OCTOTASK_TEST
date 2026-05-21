import { describe, test, expect } from "vitest";

// Pull the target URLs from environment variables injected by the CI pipeline.
// If none exist, fallback to localhost so you can test it locally.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

describe('Dev Environment Smoke Tests', () => {
  
  test('Frontend is alive and serving the React app', async () => {
    const response = await fetch(FRONTEND_URL);
    
    // 1. Verify the server didn't crash (500) or lose the route (404)
    expect(response.status).toBe(200);
    
    // 2. Verify it's actually serving the React HTML, not just an empty page or error proxy
    const htmlContent = await response.text();
    expect(htmlContent).toContain('<html');
    expect(htmlContent).toContain('OctoTask'); 
  });

  test('Backend Spring Boot API is alive', async () => {
    // Best practice: hit the Spring Boot Actuator /health endpoint
    const response = await fetch(`${BACKEND_URL}/actuator/health`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('UP'); 
  });

  // Optional: A quick database connection verification
  // If your backend has a public endpoint that queries the DB, hit it here
  // to prove the Oracle Wallet is successfully connected in the dev container.
  test('Backend successfully connected to Oracle DB', async () => {
    const response = await fetch(`${BACKEND_URL}/api/public/status`); // Adjust to a real endpoint
    expect(response.status).toBe(200);
  });
});
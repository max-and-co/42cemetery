import { initializeUserSystem } from './main.js';

// Login function
async function redirectTo42Auth() {
    const response = await fetch('http://localhost:8080/login');
    const data = await response.json();
    window.location.href = data.auth_url;
  }
  
  // OAuth callback handler
  async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const response = await fetch('http://localhost:8080/exchange_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      if (response.status !== 200) {
        window.location.href = 'http://localhost:5173';
      }
      
      const userData = await response.json();
        // Handle the user data (e.g., store in state, display to user, etc.)
      return userData;
    }
  }

  // Call handleOAuthCallback when the oauth_callback page loads
  if (window.location.pathname === '/oauth_callback') {
    initializeUserSystem(await handleOAuthCallback());
  }
// Attach this function to your button's click event
document.getElementById('auth-button').addEventListener('click', redirectTo42Auth);

if (window.location.pathname !== '/oauth_callback') {
    redirectTo42Auth();
}
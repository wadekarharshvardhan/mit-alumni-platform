// Toggle between login and registration forms
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
document.getElementById('show-register').onclick = function(e) {
  e.preventDefault();
  loginSection.style.display = 'none';
  registerSection.style.display = 'block';
};
document.getElementById('show-login').onclick = function(e) {
  e.preventDefault();
  registerSection.style.display = 'none';
  loginSection.style.display = 'block';
};

// Simple in-memory user store (for demo only)
const users = [];

// Registration logic with OTP
const regForm = document.getElementById('register-form');
regForm.onsubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  let email = document.getElementById('reg-email').value.trim().toLowerCase();
  const batch = document.getElementById('reg-batch').value.trim();
  const password = document.getElementById('reg-password').value;
  if (users.find(u => u.email === email)) {
    alert('Email already registered!');
    return;
  }
  // Send OTP
  try {
    const resp = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!resp.ok) throw new Error('Failed to send OTP');
    showOtpInput(email, { name, batch, password });
  } catch (err) {
    alert('Failed to send OTP: ' + err.message);
  }
};

function showOtpInput(email, userData) {
  registerSection.innerHTML = `
    <h3>Verify Your Email</h3>
    <p>We have sent an OTP to <b>${email}</b>. Please enter it below to complete registration.</p>
    <form id="otp-form">
      <input type="text" id="otp-code" placeholder="Enter OTP" required maxlength="6" />
      <button type="submit">Verify OTP</button>
    </form>
    <p><a href="#" id="resend-otp">Resend OTP</a></p>
  `;
  document.getElementById('otp-form').onsubmit = async function(e) {
    e.preventDefault();
    const otp = document.getElementById('otp-code').value.trim();
    const normEmail = email.trim().toLowerCase();
    try {
      const resp = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normEmail, otp })
      });
      const data = await resp.json();
      if (data.success) {
        users.push({ ...userData, email: normEmail });
        alert('Registration successful! You can now login.');
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
      } else {
        alert('Invalid OTP!');
      }
    } catch (err) {
      alert('Failed to verify OTP: ' + err.message);
    }
  };
  document.getElementById('resend-otp').onclick = async function(e) {
    e.preventDefault();
    try {
      const normEmail = email.trim().toLowerCase();
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normEmail })
      });
      alert('OTP resent!');
    } catch (err) {
      alert('Failed to resend OTP: ' + err.message);
    }
  };
}

// Login logic
const loginForm = document.getElementById('login-form');
loginForm.onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    document.getElementById('main-content').innerHTML = `
      <section class="welcome-section">
        <h3>Welcome, ${user.name}!</h3>
        <p>Batch: ${user.batch}</p>
        <p class="success">You are now logged in as an MIT School alumnus.</p>
      </section>
    `;
  } else {
    alert('Invalid email or password!');
  }
};

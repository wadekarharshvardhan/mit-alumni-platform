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
  // Password validation rules
  const passwordRules = [
    { regex: /.{8,}/, message: 'Password must be at least 8 characters.' },
    { regex: /[A-Z]/, message: 'Password must contain at least one uppercase letter.' },
    { regex: /[a-z]/, message: 'Password must contain at least one lowercase letter.' },
    { regex: /[0-9]/, message: 'Password must contain at least one digit.' },
    { regex: /[^A-Za-z0-9]/, message: 'Password must contain at least one special character.' }
  ];
  for (const rule of passwordRules) {
    if (!rule.regex.test(password)) {
      alert(rule.message);
      return;
    }
  }
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
    window.location.href = 'home.html';
  } else {
    alert('Invalid email or password!');
  }
};

// Show alumni directory
function showAlumniDirectory() {
  const directorySection = document.getElementById('alumni-directory-section');
  if (!directorySection) return;
  let html = `<h3>Alumni Directory</h3><table class="alumni-table"><thead><tr><th>Name</th><th>Batch</th><th>Email</th></tr></thead><tbody>`;
  for (const u of users) {
    html += `<tr><td>${u.name}</td><td>${u.batch}</td><td>${u.email}</td></tr>`;
  }
  html += '</tbody></table>';
  directorySection.innerHTML = html;
  directorySection.style.display = 'block';
}

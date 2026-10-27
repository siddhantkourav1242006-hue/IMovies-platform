// Authentication (Sign In & Sign Up Logic)
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

        const res = await apiRequest('/auth/login', {
          method: 'POST',
          body: { email, password },
        });

        localStorage.setItem('imovies_token', res.data.token);
        localStorage.setItem('imovies_user', JSON.stringify(res.data.user));

        showToast(`Welcome back, ${res.data.user.name}!`, 'success');

        const redirect = getQueryParam('redirect') || '/';
        setTimeout(() => {
          window.location.href = redirect;
        }, 1000);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (password !== confirmPassword) {
        return showToast('Passwords do not match', 'warning');
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

        const res = await apiRequest('/auth/register', {
          method: 'POST',
          body: { name, email, phone, password },
        });

        localStorage.setItem('imovies_token', res.data.token);
        localStorage.setItem('imovies_user', JSON.stringify(res.data.user));

        showToast('Account created successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
      }
    });
  }
});

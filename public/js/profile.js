// User Profile Management Logic
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const profileForm = document.getElementById('profile-form');
  const user = getCurrentUser();

  if (user) {
    document.getElementById('profile-name-header').innerText = user.name;
    document.getElementById('profile-email-header').innerText = user.email;
    document.getElementById('profile-avatar-big').innerText = user.name.charAt(0).toUpperCase();

    document.getElementById('input-name').value = user.name || '';
    document.getElementById('input-email').value = user.email || '';
    document.getElementById('input-phone').value = user.phone || '';
  }

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('input-name').value.trim();
      const phone = document.getElementById('input-phone').value.trim();
      const btn = profileForm.querySelector('button[type="submit"]');

      try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const res = await apiRequest('/auth/profile', {
          method: 'PUT',
          body: { name, phone },
        });

        // Update local storage
        const updated = { ...user, name: res.data.name, phone: res.data.phone };
        localStorage.setItem('imovies_user', JSON.stringify(updated));

        showToast('Profile updated successfully!', 'success');
        document.getElementById('profile-name-header').innerText = updated.name;
        document.getElementById('profile-avatar-big').innerText = updated.name.charAt(0).toUpperCase();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Changes';
      }
    });
  }
});

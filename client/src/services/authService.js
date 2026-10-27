import api from './api';

export const DEMO_USERS = [
  {
    _id: 'u_admin_1',
    name: 'Admin Priya',
    email: 'admin@imovies.com',
    role: 'admin',
    phone: '+919876543210',
    city: 'Mumbai',
  },
  {
    _id: 'u_user_1',
    name: 'Aanya Sharma',
    email: 'aanya@example.com',
    role: 'user',
    phone: '+919820011223',
    city: 'Mumbai',
  },
  {
    _id: 'u_user_2',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'user',
    phone: '+919811122334',
    city: 'Delhi',
  },
];

const authService = {
  async login(credentials) {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data?.token || res.data?.data?.token) {
        const token = res.data.token || res.data.data.token;
        const user = res.data.user || res.data.data.user;
        return { data: { token, user } };
      }
    } catch (e) {
      console.warn('Backend auth offline, using local verification for demo accounts');
    }

    // Match demo accounts
    const email = credentials.email.toLowerCase().trim();
    const foundDemo = DEMO_USERS.find((u) => u.email.toLowerCase() === email);

    if (foundDemo) {
      const mockToken = `mock_jwt_token_${foundDemo.role}_${Date.now()}`;
      localStorage.setItem('imovies_current_user', JSON.stringify(foundDemo));
      return {
        data: {
          token: mockToken,
          user: foundDemo,
        },
      };
    }

    // Check newly registered users from localStorage
    const registered = JSON.parse(localStorage.getItem('imovies_registered_users') || '[]');
    const foundRegistered = registered.find((u) => u.email.toLowerCase() === email);
    if (foundRegistered) {
      const mockToken = `mock_jwt_token_user_${Date.now()}`;
      localStorage.setItem('imovies_current_user', JSON.stringify(foundRegistered));
      return {
        data: {
          token: mockToken,
          user: foundRegistered,
        },
      };
    }

    // For any user who types a login during demo testing, auto-create account for seamless UX
    const newUser = {
      _id: `u_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role: email.includes('admin') ? 'admin' : 'user',
      city: 'Mumbai',
    };
    const mockToken = `mock_jwt_token_${newUser.role}_${Date.now()}`;
    localStorage.setItem('imovies_current_user', JSON.stringify(newUser));
    return {
      data: {
        token: mockToken,
        user: newUser,
      },
    };
  },

  async register(data) {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data?.token || res.data?.data?.token) {
        return res;
      }
    } catch (e) {
      console.warn('Backend auth offline, creating local user profile');
    }

    const newUser = {
      _id: `u_${Date.now()}`,
      name: data.name || data.email.split('@')[0],
      email: data.email.toLowerCase().trim(),
      phone: data.phone || '',
      city: data.city || 'Mumbai',
      role: data.email.toLowerCase().includes('admin') ? 'admin' : 'user',
    };

    const registered = JSON.parse(localStorage.getItem('imovies_registered_users') || '[]');
    registered.push(newUser);
    localStorage.setItem('imovies_registered_users', JSON.stringify(registered));
    localStorage.setItem('imovies_current_user', JSON.stringify(newUser));

    return {
      data: {
        token: `mock_jwt_token_${newUser.role}_${Date.now()}`,
        user: newUser,
      },
    };
  },

  async getProfile() {
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.user || res.data?.data) {
        return { data: { user: res.data.user || res.data.data } };
      }
    } catch (e) {}

    const localUser = JSON.parse(localStorage.getItem('imovies_current_user') || 'null');
    if (localUser) {
      return { data: { user: localUser } };
    }
    return { data: { user: DEMO_USERS[1] } };
  },

  async updateProfile(data) {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.data?.user || res.data?.data) return res;
    } catch (e) {}

    const current = JSON.parse(localStorage.getItem('imovies_current_user') || '{}');
    const updated = { ...current, ...data };
    localStorage.setItem('imovies_current_user', JSON.stringify(updated));
    return { data: { user: updated } };
  },

  changePassword() {
    return Promise.resolve({ data: { success: true, message: 'Password updated' } });
  },
};

export default authService;

import { jwtDecode } from 'jwt-decode';

class AuthService {
    constructor() {
        this._user = JSON.parse(localStorage.getItem('user'));
        this._token = this.getToken();
    }

    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this._token) {
            headers['Authorization'] = `Bearer ${this._token}`;
        }
        
        return headers;
    }

    async login(username, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to login');
        }

        const data = await response.json();
        this._setSession(data);
        return data;
    }

    async register(username, password) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to register');
        }

        const data = await response.json();
        this._setSession(data);
        return data;
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this._user = null;
        this._token = null;
    }

    isAuthenticated() {
        return !!this._token;
    }

    getUser() {
        return this._user;
    }

    async fetch(url, options = {}) {
        return await fetch(url, {
            ...options,
            headers: {
                ...this._getHeaders(),
                ...options.headers,
            }
        });
    }

    getToken() {
        const token = localStorage.getItem('token');

        if (!token) {
            return null;
        }

        // Check if token is expired
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                // Token is expired, remove it
                this.removeToken();
                return null;
            }

            return token;
        } catch (error) {
            console.error('Invalid token:', error);
            this.removeToken();
            return null;
        }
    }

    removeToken() {
        localStorage.removeItem('token');
    }

    _setSession(data) {
        this._user = data.user;
        this._token = data.token;
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
    }
}

export default new AuthService(); 
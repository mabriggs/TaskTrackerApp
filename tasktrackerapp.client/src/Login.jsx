import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './services/authService';

const Login = ({ onLogin }) => {
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ username: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.login(loginForm.username, loginForm.password);
            onLogin();
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.register(registerForm.username, registerForm.password);
            onLogin();
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 px-4">
            <div className="bg-gray-900 rounded-xl shadow-lg w-full max-w-4xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={loginForm.username}
                            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
                        >
                            Login
                        </button>
                    </form>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Register</h2>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
                        >
                            Register
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="col-span-1 md:col-span-2 mt-2 text-red-400 font-medium text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;

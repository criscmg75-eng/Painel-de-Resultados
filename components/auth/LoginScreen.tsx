import React, { useState } from 'react';
import { User, View } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useLocalStorage from '../../hooks/useLocalStorage';

interface LoginScreenProps {
  setView: (view: View) => void;
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setView, onLogin }) => {
  const [users] = useLocalStorage<User[]>('users', []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.zona.toLowerCase() === username.toLowerCase()
    );

    if (user && user.senha === password) {
      setError('');
      onLogin(user);
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Resultados</h1>
        <p className="text-gray-500 mt-2">Faça login para acessar os resultados</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <Input
          label="Usuário"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit">Entrar</Button>
      </form>
      <div className="text-center">
        <button
          onClick={() => setView(View.CHANGE_PASSWORD)}
          className="text-sm text-indigo-600 hover:underline"
        >
          Alterar senha
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
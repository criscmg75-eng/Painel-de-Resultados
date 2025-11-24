import React, { useState } from 'react';
import { User, View } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface LoginScreenProps {
  setView: (view: View) => void;
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setView, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      // Firebase queries are case-sensitive. Storing usernames in a consistent case is recommended.
      const q = query(usersRef, where('zona', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Usuário ou senha inválidos.');
        setLoading(false);
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as User;

      if (user.senha === password) {
        onLogin(user);
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError("Ocorreu um erro ao tentar fazer login.");
    } finally {
        setLoading(false);
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
          disabled={loading}
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className="text-center">
        <button
          onClick={() => setView(View.CHANGE_PASSWORD)}
          className="text-sm text-indigo-600 hover:underline"
          disabled={loading}
        >
          Alterar senha
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
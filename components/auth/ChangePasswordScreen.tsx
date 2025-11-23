import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { User, View } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ChangePasswordScreenProps {
  setView: (view: View) => void;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const allUsers: User[] = [];
        querySnapshot.forEach((doc) => {
            allUsers.push({ id: doc.id, ...doc.data() } as User);
        });

        const user = allUsers.find(
            (u) => u.zona.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
            setError('Usuário não encontrado.');
            return;
        }

        if (user.senha !== oldPassword && !(user.senha === '' && oldPassword === '')) {
            setError('Senha antiga incorreta.');
            return;
        }

        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
            senha: newPassword
        });
    
        setMessage('Senha alterada com sucesso!');
        setUsername('');
        setOldPassword('');
        setNewPassword('');
        setTimeout(() => {
            setView(View.LOGIN);
        }, 2000);

    } catch (err) {
        console.error("Firebase error:", err);
        setError('Ocorreu um erro ao alterar a senha.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Alterar Senha</h1>
        <p className="text-gray-500 mt-2">Preencha os campos para definir uma nova senha.</p>
      </div>
      <form onSubmit={handleChangePassword} className="space-y-6">
        <Input
          label="Usuário"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Senha Antiga"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          label="Nova Senha"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        <Button type="submit" disabled={loading}>
            {loading ? 'Alterando...' : 'Confirmar Alteração'}
        </Button>
      </form>
      <div className="text-center">
        <button
          onClick={() => setView(View.LOGIN)}
          className="text-sm text-indigo-600 hover:underline"
        >
          Voltar para o Login
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;

import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { User, View } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

interface UserManagementProps {
  setView: (view: View) => void;
}

const ImportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ExportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UserManagement: React.FC<UserManagementProps> = ({ setView }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    zona: '',
    area: '',
    telefone: '',
    senha: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    const usersCollectionRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
        console.error("Firebase snapshot error:", error);
        alert("Falha ao carregar os usuários. Verifique a conexão e as regras de segurança do Firebase.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const { id, ...data } = currentUser;
      setFormData(data);
    } else {
      setFormData({ zona: '', area: '', telefone: '', senha: '' });
    }
  }, [currentUser]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'zona') {
      const zonaValue = value.slice(0, 12);
      newFormData = {
        ...newFormData,
        zona: zonaValue,
        area: zonaValue.slice(0, 8)
      };
    }
    setFormData(newFormData);
  };
  
  const handleOpenModal = (user: User | null = null) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Edit user
        const userDocRef = doc(db, 'users', currentUser.id);
        await updateDoc(userDocRef, formData);
      } else {
        // Add user
        await addDoc(collection(db, 'users'), formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Ocorreu um erro ao salvar o usuário. Verifique as regras de segurança do Firebase.");
    }
  };

  const handleDelete = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.zona.toUpperCase() === 'ADMIN') {
        alert('Não é possível excluir o usuário Administrador.');
        return;
    }
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Ocorreu um erro ao excluir o usuário. Verifique as regras de segurança do Firebase.");
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        alert("O arquivo está vazio ou em formato incorreto.");
        return;
      }
      
      const dataLines = lines[0].toUpperCase().startsWith('ZONA') ? lines.slice(1) : lines;

      const importedUsers: Omit<User, 'id'>[] = dataLines.map((line) => {
        const [zona, telefone, senha] = line.split('\t').map(s => s.trim());
        return { 
          zona: zona || '',
          area: (zona || '').slice(0, 8),
          telefone: telefone || '',
          senha: senha || ''
        };
      }).filter(u => u.zona);

      if (window.confirm(`Você está prestes a substituir todos os usuários (exceto o ADMIN) por ${importedUsers.length} novos registros. Deseja continuar?`)) {
          try {
            setLoading(true);
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            const batch = writeBatch(db);
            
            querySnapshot.forEach(document => {
                if (document.data().zona.toUpperCase() !== 'ADMIN') {
                    batch.delete(document.ref);
                }
            });

            importedUsers.forEach(userData => {
                const newDocRef = doc(usersRef);
                batch.set(newDocRef, userData);
            });
            
            await batch.commit();
            alert(`${importedUsers.length} usuários importados com sucesso!`);
        } catch (error) {
            console.error("Error importing users:", error);
            alert("Ocorreu um erro ao importar os usuários. Verifique as regras de segurança do Firebase.");
        } finally {
            setLoading(false);
        }
      }
    };
    reader.readAsText(file);
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleExport = () => {
    const usersToExport = users.filter(u => u.zona.toUpperCase() !== 'ADMIN');
    if(usersToExport.length === 0){
        alert("Não há usuários para exportar (exceto o ADMIN).");
        return;
    }
    const header = "ZONA\tTELEFONE\tSENHA\n";
    const fileContent = usersToExport.reduce((acc, user) => {
        return acc + `${user.zona}\t${user.telefone}\t${user.senha}\n`;
    }, header);

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'usuarios_export.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };


  return (
    <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
        <div className="flex items-center space-x-2">
          <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button onClick={handleImportClick} className="!w-auto text-sm py-2 px-3 flex items-center space-x-2">
            <ImportIcon />
            <span>Importar</span>
          </Button>
          <Button onClick={handleExport} variant="secondary" className="!w-auto text-sm py-2 px-3 flex items-center space-x-2">
            <ExportIcon />
            <span>Exportar</span>
          </Button>
          <Button onClick={() => handleOpenModal()} className="!w-auto text-sm py-2">
            Adicionar Usuário
          </Button>
          <button onClick={() => setView(View.ADMIN_DASHBOARD)} className="text-sm text-indigo-600 hover:underline">
            Voltar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Zona</th>
              <th scope="col" className="px-6 py-3">Área</th>
              <th scope="col" className="px-6 py-3">Telefone</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={4} className="text-center py-10">Carregando usuários...</td></tr>
            ) : users.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10">Nenhum usuário encontrado.</td></tr>
            ) : (
                users.map((user) => (
                <tr key={user.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.zona}</td>
                    <td className="px-6 py-4">{user.area}</td>
                    <td className="px-6 py-4">{user.telefone}</td>
                    <td className="px-6 py-4 flex space-x-2">
                    {user.zona.toUpperCase() === 'ADMIN' ? (
                        <>
                            <span className="font-medium text-gray-400 cursor-not-allowed">Editar</span>
                            <span className="font-medium text-gray-400 cursor-not-allowed">Excluir</span>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleOpenModal(user)} className="font-medium text-indigo-600 hover:underline">Editar</button>
                            <button onClick={() => handleDelete(user.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                        </>
                    )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentUser ? 'Editar Usuário' : 'Adicionar Usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Zona" name="zona" value={formData.zona} onChange={handleInputChange} maxLength={12} required />
          <Input label="Área" name="area" value={formData.area} onChange={handleInputChange} maxLength={8} readOnly />
          <Input label="Telefone" name="telefone" value={formData.telefone} onChange={handleInputChange} />
          <Input label="Senha" name="senha" type="password" value={formData.senha} onChange={handleInputChange} required />
          <div className="pt-4 flex justify-end space-x-2">
             <Button type="button" variant="secondary" onClick={handleCloseModal} className="!w-auto">Cancelar</Button>
             <Button type="submit" className="!w-auto">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
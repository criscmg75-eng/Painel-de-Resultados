import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { SystemParameters, View } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface SystemParametersProps {
  setView: (view: View) => void;
}

const SystemParametersComponent: React.FC<SystemParametersProps> = ({ setView }) => {
  const [formData, setFormData] = useState<SystemParameters>({
    produtividade: 95,
    efetividade: 95,
    mesAtual: '1',
    semanaAtual: '1',
    ultimaAtualizacao: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchParameters = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'systemParams', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as SystemParameters);
        } else {
          console.log("No such document! Creating with default values.");
          // Optionally create the document with default values if it doesn't exist
          await setDoc(docRef, formData);
        }
      } catch (error) {
        console.error("Error fetching system parameters:", error);
        alert("Falha ao carregar os parâmetros do sistema.");
      } finally {
        setLoading(false);
      }
    };

    fetchParameters();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'produtividade' || name === 'efetividade') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'systemParams', 'config');
      await setDoc(docRef, formData, { merge: true }); // merge: true prevents overwriting fields not in formData
      setMessage('Parâmetros salvos com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving parameters:", error);
      alert("Ocorreu um erro ao salvar os parâmetros.");
    }
  };

  if (loading) {
      return (
          <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg text-center">
              <p>Carregando parâmetros...</p>
          </div>
      );
  }

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Parâmetros do Sistema</h1>
        <button onClick={() => setView(View.ADMIN_DASHBOARD)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gray-600">Defina os targets e valores padrão do sistema.</p>
        <Input
          label="Produtividade (%)"
          name="produtividade"
          type="number"
          value={formData.produtividade}
          onChange={handleChange}
          min="0"
          max="100"
          required
        />
        <Input
          label="Efetividade (%)"
          name="efetividade"
          type="number"
          value={formData.efetividade}
          onChange={handleChange}
          min="0"
          max="100"
          required
        />
        <Select
          label="Mês Atual"
          name="mesAtual"
          value={formData.mesAtual}
          onChange={handleChange}
          required
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={String(month)}>{month}</option>
          ))}
        </Select>

        <Select
          label="Semana Atual"
          name="semanaAtual"
          value={formData.semanaAtual}
          onChange={handleChange}
          required
        >
          {Array.from({ length: 5 }, (_, i) => i + 1).map(week => (
            <option key={week} value={String(week)}>{week}</option>
          ))}
        </Select>
        <Input
          label="Última data e horário de atualização"
          name="ultimaAtualizacao"
          type="datetime-local"
          value={formData.ultimaAtualizacao}
          onChange={handleChange}
        />
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        <Button type="submit">Salvar Parâmetros</Button>
      </form>
    </div>
  );
};

export default SystemParametersComponent;
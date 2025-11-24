import React, { useState, useEffect } from 'react';
import { SystemParameters, View } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';


interface SystemParametersProps {
  setView: (view: View) => void;
}

const SystemParametersComponent: React.FC<SystemParametersProps> = ({ setView }) => {
  const initialParams: SystemParameters = {
    produtividade: 0,
    efetividade: 0,
    mesAtual: '1',
    semanaAtual: '1',
    ultimaAtualizacao: '',
    ponderacaoProdutividade: 40,
    ponderacaoEfetividade: 60,
  };
  
  const [formData, setFormData] = useState<SystemParameters>(initialParams);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const docRef = doc(db, 'system', 'parameters');

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure all fields from the interface are present
          setFormData({ ...initialParams, ...data } as SystemParameters);
        } else {
          setFormData(initialParams);
        }
      } catch (err) {
        console.error("Error fetching parameters:", err);
        setFormData(initialParams);
      } finally {
        setLoading(false);
      }
    };
    fetchParams();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'number' || name.toLowerCase().includes('ponderacao') || name === 'produtividade' || name === 'efetividade';
    
    setFormData({ ...formData, [name]: isNumberInput ? Number(value) : value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(docRef, formData);
      setMessage('Parâmetros salvos com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error saving parameters:", err);
      alert("Falha ao salvar os parâmetros.");
    }
  };

  if (loading) {
    return (
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg text-center">
            Carregando parâmetros...
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

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-600">Targets dos Indicadores</h3>
          <Input
            label="Produtividade (%)"
            name="produtividade"
            type="number"
            value={formData.produtividade}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.1"
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
            step="0.1"
            required
          />
        </div>

        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-600">Ponderações para o Ranking</h3>
           <Input
            label="Ponderação Ranking Produtividade (%)"
            name="ponderacaoProdutividade"
            type="number"
            value={formData.ponderacaoProdutividade}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
          <Input
            label="Ponderação Ranking Efetividade (%)"
            name="ponderacaoEfetividade"
            type="number"
            value={formData.ponderacaoEfetividade}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>

        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-600">Período e Atualização</h3>
           <Select
            label="Mês Atual"
            name="mesAtual"
            value={formData.mesAtual}
            onChange={handleChange}
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}</option>
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
              <option key={week} value={week}>{week}</option>
            ))}
          </Select>
          <Input
            label="Última data e horário de atualização"
            name="ultimaAtualizacao"
            type="datetime-local"
            value={formData.ultimaAtualizacao}
            onChange={handleChange}
          />
        </div>

        {message && <p className="text-green-500 text-sm text-center pt-2">{message}</p>}
        <Button type="submit">Salvar Parâmetros</Button>
      </form>
    </div>
  );
};

export default SystemParametersComponent;
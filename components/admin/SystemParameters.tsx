import React, { useState } from 'react';
import { SystemParameters, View } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface SystemParametersProps {
  setView: (view: View) => void;
}

const SystemParametersComponent: React.FC<SystemParametersProps> = ({ setView }) => {
  const [parameters, setParameters] = useLocalStorage<SystemParameters>('systemParams', {
    produtividade: 0,
    efetividade: 0,
    mesAtual: '1',
    semanaAtual: '1',
    ultimaAtualizacao: '',
  });
  
  const [formData, setFormData] = useState<SystemParameters>(parameters);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'produtividade' || name === 'efetividade') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParameters(formData);
    setMessage('Parâmetros salvos com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

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
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        <Button type="submit">Salvar Parâmetros</Button>
      </form>
    </div>
  );
};

export default SystemParametersComponent;
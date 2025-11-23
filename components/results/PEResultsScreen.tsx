import React, { useState, useMemo } from 'react';
import { User, View, ProductivityData, EffectivenessData, SystemParameters } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';

interface PEResultsScreenProps {
  user: User;
  setView: (view: View) => void;
}

type GenericData = ProductivityData | EffectivenessData;

const parseAB = (abString: string): { a: number; b: number } => {
    if (!abString || typeof abString !== 'string') return { a: 0, b: 0 };
    const match = abString.match(/\((\d+)\|(\d+)\)/);
    if (match) {
      return { a: parseInt(match[1], 10), b: parseInt(match[2], 10) };
    }
    return { a: 0, b: 0 };
};

interface PivotTableProps {
    data: GenericData[];
    target: number;
    title: string;
}

const PivotTable: React.FC<PivotTableProps> = ({ data, target, title }) => {
    const pivotData = useMemo(() => {
        if (data.length === 0) {
            return { headers: [], rows: [] };
        }

        const dvvHeaders = [...new Set(data.map(item => item.dvv))].sort();
        const zonas = [...new Set(data.map(item => item.zona))].sort();

        const rows = zonas.map(zona => {
            const dvvResults = dvvHeaders.reduce((acc, dvv) => {
                const item = data.find(d => d.zona === zona && d.dvv === dvv);
                if (item) {
                    acc[dvv] = { resultado: item.resultado, ab: item.ab };
                } else {
                    acc[dvv] = null;
                }
                return acc;
            }, {} as Record<string, { resultado: string; ab: string } | null>);
            
            return {
                zona,
                dvvResults,
            };
        });

        return { headers: dvvHeaders, rows };
    }, [data]);

    const getResultClass = (resultStr: string, currentTarget: number) => {
        const resultNum = parseFloat(resultStr);
        if (isNaN(resultNum)) {
            return 'text-gray-900';
        }
        return resultNum >= currentTarget ? 'text-green-700 font-bold' : 'text-red-700 font-bold';
    };

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-semibold text-gray-700">{title} (Target: {target}%)</h2>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-center text-gray-500">
                    <thead className="text-sm font-semibold text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left">ZONA</th>
                            {pivotData.headers.map((dvv, colIndex) => (
                                <th 
                                    key={dvv} 
                                    scope="col" 
                                    className={`px-4 py-3 ${colIndex === pivotData.headers.length - 1 ? 'bg-gray-100' : ''}`}
                                >
                                    {dvv}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pivotData.rows.length > 0 ? (
                            pivotData.rows.map((row, rowIndex) => {
                                const isLastRow = rowIndex === pivotData.rows.length - 1;
                                return (
                                    <tr key={row.zona} className="bg-white border-b hover:bg-gray-50">
                                        <td className={`px-4 py-2 font-medium text-gray-900 whitespace-nowrap text-left ${isLastRow ? 'bg-gray-100' : ''}`}>
                                            {row.zona}
                                        </td>
                                        {pivotData.headers.map((dvv, colIndex) => {
                                            const isLastColumn = colIndex === pivotData.headers.length - 1;
                                            const cellData = row.dvvResults[dvv];
                                            const cellClassName = `px-4 py-2 ${(isLastRow || isLastColumn) ? 'bg-gray-100' : ''}`;
                                            return (
                                                <td key={`${row.zona}-${dvv}`} className={cellClassName}>
                                                    {cellData ? (
                                                        <div>
                                                            <span className={getResultClass(cellData.resultado, target)}>{cellData.resultado}</span>
                                                            <span className="block text-xs text-gray-400">{cellData.ab}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={pivotData.headers.length + 1} className="text-center py-10 text-gray-500">
                                    Nenhum dado encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PEResultsScreen: React.FC<PEResultsScreenProps> = ({ user, setView }) => {
  const [productivityData] = useLocalStorage<ProductivityData[]>('productivityData', []);
  const [effectivenessData] = useLocalStorage<EffectivenessData[]>('effectivenessData', []);
  const [systemParams] = useLocalStorage<SystemParameters>('systemParams', { 
    produtividade: 95, 
    efetividade: 95, 
    mesAtual: '', 
    semanaAtual: '',
    ultimaAtualizacao: ''
  });

  const userProdData = useMemo(() => productivityData.filter(d => d.area === user.area), [productivityData, user.area]);
  const userEffData = useMemo(() => effectivenessData.filter(d => d.area === user.area), [effectivenessData, user.area]);
  
  const allData = useMemo(() => [...userProdData, ...userEffData], [userProdData, userEffData]);
  const months = useMemo(() => ['all', ...Array.from(new Set(allData.map(d => d.mes).filter(Boolean)))], [allData]);
  const weeks = useMemo(() => ['all', ...Array.from(new Set(allData.map(d => d.semana).filter(Boolean)))], [allData]);
  
  const initialMonth = months.includes(systemParams.mesAtual) ? systemParams.mesAtual : 'all';
  const initialWeek = weeks.includes(systemParams.semanaAtual) ? systemParams.semanaAtual : 'all';

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  const filteredProdData = useMemo(() => {
    return userProdData.filter(d => 
        (selectedMonth === 'all' || d.mes === selectedMonth) &&
        (selectedWeek === 'all' || d.semana === selectedWeek)
    );
  }, [userProdData, selectedMonth, selectedWeek]);
        
  const filteredEffData = useMemo(() => {
    return userEffData.filter(d => 
        (selectedMonth === 'all' || d.mes === selectedMonth) &&
        (selectedWeek === 'all' || d.semana === selectedWeek)
    );
  }, [userEffData, selectedMonth, selectedWeek]);

  const formattedUpdateDate = useMemo(() => {
    if (!systemParams.ultimaAtualizacao) return 'N/A';
    try {
        const date = new Date(systemParams.ultimaAtualizacao);
        if (isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch (e) {
        return 'N/A';
    }
  }, [systemParams.ultimaAtualizacao]);

  return (
    <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-lg space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resultados - P&E</h1>
          <p className="text-sm text-gray-500">Exibindo resultados para a área: {user.area}</p>
          <p className="text-xs text-gray-400 mt-1">Última atualização: {formattedUpdateDate}</p>
        </div>
        <button onClick={() => setView(View.COCKPIT)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <label htmlFor="month-select" className="text-sm font-medium text-gray-700">Mês:</label>
          <select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              {months.map(m => <option key={m} value={m}>{m === 'all' ? 'Todos os Meses' : m}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="week-select" className="text-sm font-medium text-gray-700">Semana:</label>
          <select id="week-select" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              {weeks.map(w => <option key={w} value={w}>{w === 'all' ? 'Todas as Semanas' : w}</option>)}
          </select>
        </div>
      </div>

      <PivotTable 
        data={filteredProdData}
        target={systemParams.produtividade}
        title="Produtividade"
      />
      
      <PivotTable 
        data={filteredEffData}
        target={systemParams.efetividade}
        title="Efetividade"
      />
    </div>
  );
};

export default PEResultsScreen;
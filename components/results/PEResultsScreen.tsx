import React, { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { User, View, ProductivityData, EffectivenessData, SystemParameters } from '../../types';

interface PEResultsScreenProps {
  user: User;
  setView: (view: View) => void;
}

type GenericData = ProductivityData | EffectivenessData;

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

        // Fix: Explicitly type dvvHeaders and zonas as string arrays.
        // This resolves an issue where TypeScript infers them as 'unknown[]' from the Set,
        // causing an error when their elements are used as index keys.
        const dvvHeaders: string[] = [...new Set(data.map(item => item.dvv))].sort((a,b) => Number(a) - Number(b));
        const zonas: string[] = [...new Set(data.map(item => item.zona))].sort();

        const rows = zonas.map(zona => {
            const dvvResults = dvvHeaders.reduce<Record<string, { resultado: string; ab: string } | null>>((acc, dvv) => {
                const item = data.find(d => d.zona === zona && d.dvv === dvv);
                if (item) {
                    acc[dvv] = { resultado: item.resultado, ab: item.ab };
                } else {
                    acc[dvv] = null;
                }
                return acc;
            }, {});
            
            return {
                zona,
                dvvResults,
            };
        });

        return { headers: dvvHeaders, rows };
    }, [data]);

    const getResultClass = (resultStr: string, currentTarget: number) => {
        const resultNum = parseFloat(resultStr.replace(',', '.'));
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
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [effectivenessData, setEffectivenessData] = useState<EffectivenessData[]>([]);
  const [systemParams, setSystemParams] = useState<SystemParameters>({ 
    produtividade: 95, 
    efetividade: 95, 
    mesAtual: '1', 
    semanaAtual: '1',
    ultimaAtualizacao: ''
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch System Parameters
            const paramsDocRef = doc(db, 'systemParams', 'config');
            const paramsDocSnap = await getDoc(paramsDocRef);
            if (paramsDocSnap.exists()) {
                setSystemParams(paramsDocSnap.data() as SystemParameters);
            }

            // Fetch Productivity Data
            const prodSnapshot = await getDocs(collection(db, 'productivityData'));
            const prodData = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductivityData));
            setProductivityData(prodData);

            // Fetch Effectiveness Data
            const effSnapshot = await getDocs(collection(db, 'effectivenessData'));
            const effData = effSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EffectivenessData));
            setEffectivenessData(effData);

        } catch (error) {
            console.error("Error fetching data from Firebase:", error);
            alert("Ocorreu um erro ao buscar os dados do servidor.");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const userProdData = useMemo(() => productivityData.filter(d => d.area === user.area), [productivityData, user.area]);
  const userEffData = useMemo(() => effectivenessData.filter(d => d.area === user.area), [effectivenessData, user.area]);
  
  const allData = useMemo(() => [...userProdData, ...userEffData], [userProdData, userEffData]);
  const months = useMemo(() => ['all', ...Array.from(new Set(allData.map(d => d.mes).filter(Boolean))).sort((a,b) => Number(a) - Number(b))], [allData]);
  const weeks = useMemo(() => ['all', ...Array.from(new Set(allData.map(d => d.semana).filter(Boolean))).sort((a,b) => Number(a) - Number(b))], [allData]);
  
  const initialMonth = months.includes(systemParams.mesAtual) ? systemParams.mesAtual : 'all';
  const initialWeek = weeks.includes(systemParams.semanaAtual) ? systemParams.semanaAtual : 'all';

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('all');

  // Set initial filter values once data is loaded
  useEffect(() => {
      if(!loading){
        setSelectedMonth(initialMonth);
        setSelectedWeek(initialWeek);
      }
  }, [loading, initialMonth, initialWeek]);

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

  if (loading) {
      return (
          <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-lg text-center">
              <h1 className="text-xl font-semibold">Carregando dados...</h1>
          </div>
      );
  }

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
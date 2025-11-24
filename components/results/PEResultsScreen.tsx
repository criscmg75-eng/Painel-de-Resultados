import React, { useState, useMemo, useEffect } from 'react';
import { User, View, ProductivityData, EffectivenessData, SystemParameters, ProductTotalZvSemData, ProductTotalTvDiaData, ProductTotalTvSemData, EffectTotalZvSemData, EffectTotalTvDiaData, EffectTotalTvSemData } from '../../types';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

interface PEResultsScreenProps {
  user: User;
  setView: (view: View) => void;
}

type GenericData = ProductivityData | EffectivenessData;

interface PivotTableProps {
    data: GenericData[];
    target: number;
    title: string;
    weeklyTotalsData?: (ProductTotalZvSemData | EffectTotalZvSemData)[];
    dailyAreaTotalsData?: (ProductTotalTvDiaData | EffectTotalTvDiaData)[];
    weeklyAreaTotalData?: (ProductTotalTvSemData | EffectTotalTvSemData)[];
}

const PivotTable: React.FC<PivotTableProps> = ({ data, target, title, weeklyTotalsData, dailyAreaTotalsData, weeklyAreaTotalData }) => {
    const parseAB = (ab: string | undefined): { a: number, b: number } => {
        if (!ab) return { a: 0, b: 0 };
        const match = ab.match(/\((\d+)\/(\d+)\)/);
        if (match) {
            return { a: parseInt(match[1], 10), b: parseInt(match[2], 10) };
        }
        return { a: 0, b: 0 };
    };

    const pivotData = useMemo(() => {
        const dvvHeaders = [...new Set(data.map(item => item.dvv))].sort();
        const zonas = [...new Set(data.map(item => item.zona))].sort();

        const rows = zonas.map(zona => {
            const dvvResults = dvvHeaders.reduce((acc, dvv) => {
                const item = data.find(d => d.zona === zona && d.dvv === dvv);
                acc[dvv] = item ? { resultado: item.resultado, ab: item.ab } : null;
                return acc;
            }, {} as Record<string, { resultado: string; ab: string } | null>);
            
            const totalItem = weeklyTotalsData?.find(d => d.zona === zona);
            return {
                zona,
                dvvResults,
                total: totalItem ? { resultado: totalItem.resultado, ab: totalItem.ab } : null
            };
        });

        return { headers: dvvHeaders, rows };
    }, [data, weeklyTotalsData]);

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
                            {pivotData.headers.map(dvv => (
                                <th key={dvv} scope="col" className="px-4 py-3">
                                    {dvv}
                                </th>
                            ))}
                             {(weeklyTotalsData || dailyAreaTotalsData) && (
                                <th scope="col" className="px-4 py-3 font-bold bg-gray-100">
                                    TOTAL
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {pivotData.rows.length > 0 ? (
                            <>
                                {pivotData.rows.map(row => (
                                    <tr key={row.zona} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap text-left">
                                            {row.zona}
                                        </td>
                                        {pivotData.headers.map(dvv => {
                                            const cellData = row.dvvResults[dvv];
                                            return (
                                                <td key={`${row.zona}-${dvv}`} className="px-4 py-2">
                                                    {cellData ? (
                                                        <div>
                                                            <span className={getResultClass(cellData.resultado, target)}>{cellData.resultado}</span>
                                                            <span className="block text-xs text-gray-400">{cellData.ab}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                            );
                                        })}
                                        {weeklyTotalsData && (
                                            <td className="px-4 py-2 bg-gray-100">
                                                {row.total ? (
                                                     <div>
                                                        <span className={getResultClass(row.total.resultado, target)}>{row.total.resultado}</span>
                                                        <span className="block text-xs text-gray-400">{row.total.ab}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {(weeklyTotalsData || dailyAreaTotalsData) && (
                                     <tr className="bg-gray-100 border-b">
                                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap text-left font-bold">
                                            TOTAL
                                        </td>
                                        {pivotData.headers.map(dvv => {
                                           const totalCellData = dailyAreaTotalsData?.find(d => d.dvv === dvv);
                                           return (
                                             <td key={`total-row-${dvv}`} className="px-4 py-2 font-bold">
                                               {totalCellData ? (
                                                 <div>
                                                   <span className={getResultClass(totalCellData.resultado, target)}>{totalCellData.resultado}</span>
                                                   <span className="block text-xs text-gray-400">{totalCellData.ab}</span>
                                                 </div>
                                               ) : '-'}
                                             </td>
                                           );
                                        })}
                                        {weeklyTotalsData && (
                                            <td className="px-4 py-2 bg-gray-100">
                                               {weeklyAreaTotalData && weeklyAreaTotalData[0] ? (
                                                    <div>
                                                        <span className={getResultClass(weeklyAreaTotalData[0].resultado, target)}>{weeklyAreaTotalData[0].resultado}</span>
                                                        <span className="block text-xs text-gray-400">{weeklyAreaTotalData[0].ab}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        )}
                                    </tr>
                                )}
                            </>
                        ) : (
                            <tr>
                                <td colSpan={pivotData.headers.length + 1 + (weeklyTotalsData ? 1 : 0)} className="text-center py-10 text-gray-500">
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
  const [prodWeeklyZoneData, setProdWeeklyZoneData] = useState<ProductTotalZvSemData[]>([]);
  const [prodDailyAreaData, setProdDailyAreaData] = useState<ProductTotalTvDiaData[]>([]);
  const [prodWeeklyAreaData, setProdWeeklyAreaData] = useState<ProductTotalTvSemData[]>([]);
  const [effWeeklyZoneData, setEffWeeklyZoneData] = useState<EffectTotalZvSemData[]>([]);
  const [effDailyAreaData, setEffDailyAreaData] = useState<EffectTotalTvDiaData[]>([]);
  const [effWeeklyAreaData, setEffWeeklyAreaData] = useState<EffectTotalTvSemData[]>([]);
  const [systemParams, setSystemParams] = useState<SystemParameters>({ 
    produtividade: 95, 
    efetividade: 95, 
    mesAtual: '1', 
    semanaAtual: '1',
    ultimaAtualizacao: '',
    ponderacaoProdutividade: 40,
    ponderacaoEfetividade: 60,
  });
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Refs
            const paramsRef = doc(db, 'system', 'parameters');
            const prodRef = collection(db, 'productivityData');
            const effRef = collection(db, 'effectivenessData');
            const prodWeeklyZoneRef = collection(db, 'productTotalZvSem');
            const prodDailyAreaRef = collection(db, 'productTotalTvDia');
            const prodWeeklyAreaRef = collection(db, 'productTotalTvSem');
            const effWeeklyZoneRef = collection(db, 'effectTotalZvSem');
            const effDailyAreaRef = collection(db, 'effectTotalTvDia');
            const effWeeklyAreaRef = collection(db, 'effectTotalTvSem');

            const [
                paramsSnap,
                prodSnap,
                effSnap,
                prodWeeklyZoneSnap,
                prodDailyAreaSnap,
                prodWeeklyAreaSnap,
                effWeeklyZoneSnap,
                effDailyAreaSnap,
                effWeeklyAreaSnap
            ] = await Promise.all([
                getDoc(paramsRef),
                getDocs(prodRef),
                getDocs(effRef),
                getDocs(prodWeeklyZoneRef),
                getDocs(prodDailyAreaRef),
                getDocs(prodWeeklyAreaRef),
                getDocs(effWeeklyZoneRef),
                getDocs(effDailyAreaRef),
                getDocs(effWeeklyAreaRef),
            ]);
            
            // System Params
            let fetchedParams = systemParams;
            if (paramsSnap.exists()) {
                fetchedParams = { ...systemParams, ...paramsSnap.data() } as SystemParameters;
                setSystemParams(fetchedParams);
            }

            // Productivity Data
            const prodData = prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProductivityData[];
            setProductivityData(prodData);
            const prodWeeklyData = prodWeeklyZoneSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProductTotalZvSemData[];
            setProdWeeklyZoneData(prodWeeklyData);
            const prodDailyData = prodDailyAreaSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProductTotalTvDiaData[];
            setProdDailyAreaData(prodDailyData);
            const prodWeeklyAreaData = prodWeeklyAreaSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProductTotalTvSemData[];
            setProdWeeklyAreaData(prodWeeklyAreaData);
            
            // Effectiveness Data
            const effData = effSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EffectivenessData[];
            setEffectivenessData(effData);
            const effWeeklyData = effWeeklyZoneSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EffectTotalZvSemData[];
            setEffWeeklyZoneData(effWeeklyData);
            const effDailyData = effDailyAreaSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EffectTotalTvDiaData[];
            setEffDailyAreaData(effDailyData);
            const effWeeklyAreaData = effWeeklyAreaSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EffectTotalTvSemData[];
            setEffWeeklyAreaData(effWeeklyAreaData);
            
            // Set Filters
            const allCombinedData = [...prodData, ...effData];
            const allMonths = ['all', ...new Set(allCombinedData.map(d => d.mes).filter(Boolean))];
            const allWeeks = ['all', ...new Set(allCombinedData.map(d => d.semana).filter(Boolean))];
            
            setSelectedMonth(allMonths.includes(fetchedParams.mesAtual) ? fetchedParams.mesAtual : 'all');
            setSelectedWeek(allWeeks.includes(fetchedParams.semanaAtual) ? fetchedParams.semanaAtual : 'all');

        } catch (err) {
            console.error("Error fetching results data:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Filter Data by User Area
  const userProdData = useMemo(() => productivityData.filter(d => d.area === user.area), [productivityData, user.area]);
  const userEffData = useMemo(() => effectivenessData.filter(d => d.area === user.area), [effectivenessData, user.area]);
  const userProdWeeklyData = useMemo(() => prodWeeklyZoneData.filter(d => d.area === user.area), [prodWeeklyZoneData, user.area]);
  const userProdDailyAreaData = useMemo(() => prodDailyAreaData.filter(d => d.area === user.area), [prodDailyAreaData, user.area]);
  const userProdWeeklyAreaData = useMemo(() => prodWeeklyAreaData.filter(d => d.area === user.area), [prodWeeklyAreaData, user.area]);
  const userEffWeeklyData = useMemo(() => effWeeklyZoneData.filter(d => d.area === user.area), [effWeeklyZoneData, user.area]);
  const userEffDailyAreaData = useMemo(() => effDailyAreaData.filter(d => d.area === user.area), [effDailyAreaData, user.area]);
  const userEffWeeklyAreaData = useMemo(() => effWeeklyAreaData.filter(d => d.area === user.area), [effWeeklyAreaData, user.area]);
  
  const allData = useMemo(() => [...userProdData, ...userEffData], [userProdData, userEffData]);
  const months = useMemo(() => ['all', ...Array.from(new Set(allData.map(d => d.mes).filter(Boolean)))], [allData]);
  const weeks = useMemo(() => ['all', ...Array.from(new Set(allData.map(d => d.semana).filter(Boolean)))], [allData]);

  // Filter Data by Month/Week Selections
  const filteredProdData = useMemo(() => userProdData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userProdData, selectedMonth, selectedWeek]);
  const filteredEffData = useMemo(() => userEffData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userEffData, selectedMonth, selectedWeek]);
  const filteredProdWeeklyData = useMemo(() => userProdWeeklyData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userProdWeeklyData, selectedMonth, selectedWeek]);
  const filteredProdDailyAreaData = useMemo(() => userProdDailyAreaData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userProdDailyAreaData, selectedMonth, selectedWeek]);
  const filteredProdWeeklyAreaData = useMemo(() => userProdWeeklyAreaData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userProdWeeklyAreaData, selectedMonth, selectedWeek]);
  const filteredEffWeeklyData = useMemo(() => userEffWeeklyData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userEffWeeklyData, selectedMonth, selectedWeek]);
  const filteredEffDailyAreaData = useMemo(() => userEffDailyAreaData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userEffDailyAreaData, selectedMonth, selectedWeek]);
  const filteredEffWeeklyAreaData = useMemo(() => userEffWeeklyAreaData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek)), [userEffWeeklyAreaData, selectedMonth, selectedWeek]);


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
              Carregando resultados...
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
        <button onClick={() => setView(View.PE_SELECTION)} className="text-sm text-indigo-600 hover:underline">
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
        weeklyTotalsData={filteredProdWeeklyData}
        dailyAreaTotalsData={filteredProdDailyAreaData}
        weeklyAreaTotalData={filteredProdWeeklyAreaData}
      />
      
      <PivotTable 
        data={filteredEffData}
        target={systemParams.efetividade}
        title="Efetividade"
        weeklyTotalsData={filteredEffWeeklyData}
        dailyAreaTotalsData={filteredEffDailyAreaData}
        weeklyAreaTotalData={filteredEffWeeklyAreaData}
      />
    </div>
  );
};

export default PEResultsScreen;
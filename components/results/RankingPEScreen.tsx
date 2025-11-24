import React, { useState, useMemo, useEffect } from 'react';
import { User, View, ProductivityData, EffectivenessData, SystemParameters } from '../../types';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

interface RankingPEScreenProps {
  user: User;
  setView: (view: View) => void;
}

type AggregatedData = {
    zona: string;
    prodValue: number;
    effValue: number;
};

type RankedData = AggregatedData & {
    prodRank: number;
    effRank: number;
    compositeValue: number;
    compositeRank: number;
};

const parseAB = (ab: string | undefined): { a: number, b: number } => {
    if (!ab) return { a: 0, b: 0 };
    const match = ab.match(/\((\d+)\/(\d+)\)/);
    if (match) {
        return { a: parseInt(match[1], 10), b: parseInt(match[2], 10) };
    }
    return { a: 0, b: 0 };
};


const calculatePercentage = (a: number, b: number): number => {
    return b === 0 ? 0 : (a / b) * 100;
};

const RankingPEScreen: React.FC<RankingPEScreenProps> = ({ user, setView }) => {
    const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
    const [effectivenessData, setEffectivenessData] = useState<EffectivenessData[]>([]);
    const [systemParams, setSystemParams] = useState<SystemParameters>({
        produtividade: 0,
        efetividade: 0,
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
                const paramsRef = doc(db, 'system', 'parameters');
                const prodRef = collection(db, 'productivityData');
                const effRef = collection(db, 'effectivenessData');

                const [paramsSnap, prodSnap, effSnap] = await Promise.all([
                    getDoc(paramsRef),
                    getDocs(prodRef),
                    getDocs(effRef)
                ]);

                let fetchedParams = systemParams;
                if (paramsSnap.exists()) {
                    fetchedParams = { ...systemParams, ...paramsSnap.data() } as SystemParameters;
                    setSystemParams(fetchedParams);
                }

                const prodData = prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProductivityData[];
                setProductivityData(prodData);
                const effData = effSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EffectivenessData[];
                setEffectivenessData(effData);
                
                const allMonths = ['all', ...new Set([...prodData, ...effData].map(d => d.mes).filter(Boolean))];
                const allWeeks = ['all', ...new Set([...prodData, ...effData].map(d => d.semana).filter(Boolean))];

                setSelectedMonth(allMonths.includes(fetchedParams.mesAtual) ? fetchedParams.mesAtual : 'all');
                setSelectedWeek(allWeeks.includes(fetchedParams.semanaAtual) ? fetchedParams.semanaAtual : 'all');
            } catch (err) {
                console.error("Error fetching ranking data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const userProdData = useMemo(() => productivityData.filter(d => d.area === user.area), [productivityData, user.area]);
    const userEffData = useMemo(() => effectivenessData.filter(d => d.area === user.area), [effectivenessData, user.area]);

    const months = useMemo(() => ['all', ...new Set([...userProdData, ...userEffData].map(d => d.mes).filter(Boolean))], [userProdData, userEffData]);
    const weeks = useMemo(() => ['all', ...new Set([...userProdData, ...userEffData].map(d => d.semana).filter(Boolean))], [userProdData, userEffData]);

    const finalData = useMemo((): { ranked: RankedData[], totals: { prod: number, eff: number, comp: number } } => {
        const filteredProd = userProdData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek));
        const filteredEff = userEffData.filter(d => (selectedMonth === 'all' || d.mes === selectedMonth) && (selectedWeek === 'all' || d.semana === selectedWeek));
        
        // Use only rows where DVV is 'TOTAL'
        const totalProdRows = filteredProd.filter(d => d.dvv === 'TOTAL');
        const totalEffRows = filteredEff.filter(d => d.dvv === 'TOTAL');

        const zonas = [...new Set([...totalProdRows, ...totalEffRows].map(d => d.zona))].sort();

        if (zonas.length === 0) return { ranked: [], totals: { prod: 0, eff: 0, comp: 0 } };

        const parsePercentage = (resultStr: string | undefined): number => {
            if (!resultStr) return 0;
            const cleaned = resultStr.replace('%', '').replace(',', '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        };

        const aggregated = zonas.map(zona => {
            const prodItem = totalProdRows.find(d => d.zona === zona);
            const effItem = totalEffRows.find(d => d.zona === zona);

            return {
                zona,
                prodValue: parsePercentage(prodItem?.resultado),
                effValue: parsePercentage(effItem?.resultado)
            };
        });

        const withRanks = aggregated.map(item => ({
            ...item,
            compositeValue: (item.prodValue * (systemParams.ponderacaoProdutividade / 100)) + (item.effValue * (systemParams.ponderacaoEfetividade / 100))
        }));

        withRanks.sort((a, b) => b.prodValue - a.prodValue);
        withRanks.forEach((item, index) => (item as any).prodRank = index + 1);

        withRanks.sort((a, b) => b.effValue - a.effValue);
        withRanks.forEach((item, index) => (item as any).effRank = index + 1);

        withRanks.sort((a, b) => b.compositeValue - a.compositeValue);
        withRanks.forEach((item, index) => (item as any).compositeRank = index + 1);

        withRanks.sort((a, b) => a.zona.localeCompare(b.zona));
        
        // Calculate "TV" by summing the (A/B) from the 'TOTAL' rows of each zona
        const totalProdSum = totalProdRows.reduce((acc, item) => {
            const { a, b } = parseAB(item.ab);
            return { a: acc.a + a, b: acc.b + b };
        }, { a: 0, b: 0 });

        const totalEffSum = totalEffRows.reduce((acc, item) => {
            const { a, b } = parseAB(item.ab);
            return { a: acc.a + a, b: acc.b + b };
        }, { a: 0, b: 0 });

        const totalProd = calculatePercentage(totalProdSum.a, totalProdSum.b);
        const totalEff = calculatePercentage(totalEffSum.a, totalEffSum.b);
        const totalComp = (totalProd * (systemParams.ponderacaoProdutividade / 100)) + (totalEff * (systemParams.ponderacaoEfetividade / 100));

        return { ranked: withRanks as RankedData[], totals: { prod: totalProd, eff: totalEff, comp: totalComp } };
    }, [userProdData, userEffData, selectedMonth, selectedWeek, systemParams]);
    
    const getCompositeRankClass = (rank: number) => {
        if (rank <= 3) return 'bg-green-700 text-white font-bold';
        return '';
    };

    const getCompositeResultClass = (value: number) => {
        const target = (systemParams.produtividade * (systemParams.ponderacaoProdutividade / 100)) + (systemParams.efetividade * (systemParams.ponderacaoEfetividade / 100));
        if (value < target) return 'text-red-600';
        return 'text-green-600';
    };

    if (loading) {
        return <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-lg text-center">Carregando ranking...</div>;
    }

    return (
        <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-lg space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Ranking - P&E</h1>
                    <p className="text-sm text-gray-500">Exibindo ranking para a área: {user.area}</p>
                </div>
                <button onClick={() => setView(View.PE_SELECTION)} className="text-sm text-indigo-600 hover:underline">
                    Voltar
                </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <label htmlFor="month-select" className="text-sm font-medium text-gray-700">Mês:</label>
                    <select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        {months.map(m => <option key={m} value={m}>{m === 'all' ? 'Todos' : m}</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="week-select" className="text-sm font-medium text-gray-700">Semana:</label>
                    <select id="week-select" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        {weeks.map(w => <option key={w} value={w}>{w === 'all' ? 'Todas' : w}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-center text-gray-700">
                    <thead className="text-xs uppercase bg-gray-200">
                        <tr>
                            <th rowSpan={2} className="px-2 py-3 border-r bg-indigo-50">ZONA</th>
                            <th colSpan={2} className="px-2 py-3 border-r bg-green-50">PRODUTIVIDADE (peso {systemParams.ponderacaoProdutividade}%)</th>
                            <th colSpan={2} className="px-2 py-3 border-r bg-green-100">EFETIVIDADE (peso {systemParams.ponderacaoEfetividade}%)</th>
                            <th colSpan={2} className="px-2 py-3 bg-gray-300">COMPOSTO</th>
                        </tr>
                        <tr>
                            <th className="px-2 py-2 border-r bg-green-50 font-semibold">%</th>
                            <th className="px-2 py-2 border-r bg-green-50 font-semibold">RANKING</th>
                            <th className="px-2 py-2 border-r bg-green-100 font-semibold">%</th>
                            <th className="px-2 py-2 border-r bg-green-100 font-semibold">RANKING</th>
                            <th className="px-2 py-2 border-r bg-gray-300 font-semibold">%</th>
                            <th className="px-2 py-2 bg-gray-300 font-semibold">RANKING</th>
                        </tr>
                    </thead>
                    <tbody>
                       {finalData.ranked.length > 0 ? (
                           <>
                            {finalData.ranked.map(row => (
                                <tr key={row.zona} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap border-r text-left">{row.zona}</td>
                                    <td className="px-2 py-2 border-r bg-green-50 font-semibold">{row.prodValue.toFixed(1)}%</td>
                                    <td className="px-2 py-2 border-r bg-green-50">{row.prodRank}</td>
                                    <td className="px-2 py-2 border-r bg-green-100 font-semibold">{row.effValue.toFixed(1)}%</td>
                                    <td className="px-2 py-2 border-r bg-green-100">{row.effRank}</td>
                                    <td className={`px-2 py-2 border-r font-semibold ${getCompositeResultClass(row.compositeValue)}`}>{row.compositeValue.toFixed(1)}%</td>
                                    <td className={`px-2 py-2 ${getCompositeRankClass(row.compositeRank)}`}>{row.compositeRank}</td>
                                </tr>
                            ))}
                             <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                                <td className="px-2 py-2 border-r text-left">TV</td>
                                <td colSpan={1} className="px-2 py-2 border-r">{finalData.totals.prod.toFixed(1)}%</td>
                                <td colSpan={1} className="px-2 py-2 border-r"></td>
                                <td colSpan={1} className="px-2 py-2 border-r">{finalData.totals.eff.toFixed(1)}%</td>
                                <td colSpan={1} className="px-2 py-2 border-r"></td>
                                <td colSpan={1} className="px-2 py-2 border-r">{finalData.totals.comp.toFixed(1)}%</td>
                                <td colSpan={1} className="px-2 py-2"></td>
                            </tr>
                           </>
                       ) : (
                           <tr>
                               <td colSpan={7} className="text-center py-10 text-gray-500">
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

export default RankingPEScreen;
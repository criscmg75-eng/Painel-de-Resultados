import React, { useRef, useState, useEffect } from 'react';
import { EffectivenessData, View } from '../../types';
import Button from '../ui/Button';
import { db } from '../../firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';


interface DataLoadingEffectivenessProps {
  setView: (view: View) => void;
}

const ImportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ExportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);


const DataLoadingEffectiveness: React.FC<DataLoadingEffectivenessProps> = ({ setView }) => {
  const [data, setData] = useState<EffectivenessData[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataCollectionRef = collection(db, 'effectivenessData');

  const fetchData = async () => {
    setLoading(true);
    const snapshot = await getDocs(dataCollectionRef);
    const fetchedData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EffectivenessData[];
    setData(fetchedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const importedData: Omit<EffectivenessData, 'id'>[] = lines.map(line => {
        const [mes, semana, area, zona, dvv, resultado, ab] = line.split('\t');
        return { mes, semana, area, zona, dvv, resultado, ab };
      });

      if (window.confirm(`Isso substituirá todos os ${data.length} registros existentes por ${importedData.length} novos registros. Deseja continuar?`)) {
        setLoading(true);
        try {
          // 1. Delete all existing documents
          const deleteBatch = writeBatch(db);
          data.forEach(item => {
            deleteBatch.delete(doc(db, 'effectivenessData', item.id));
          });
          await deleteBatch.commit();
          
          // 2. Add new documents
          const addBatch = writeBatch(db);
          importedData.forEach(item => {
            const docRef = doc(collection(db, 'effectivenessData'));
            addBatch.set(docRef, item);
          });
          await addBatch.commit();
          
          alert(`${importedData.length} registros importados com sucesso!`);
          fetchData();
        } catch (err) {
            console.error(err);
            alert("Ocorreu um erro ao importar os dados.");
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
    if(data.length === 0){
        alert("Não há dados para exportar.");
        return;
    }
    const header = "MÊS\tSEMANA\tÁREA\tZONA\tDVV\tRESULTADO\t(A/B)\n";
    const fileContent = data.reduce((acc, row) => {
        return acc + `${row.mes}\t${row.semana}\t${row.area}\t${row.zona}\t${row.dvv}\t${row.resultado}\t${row.ab}\n`;
    }, header);

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'efetividade_export.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Tem certeza que deseja excluir TODOS os dados de efetividade? Esta ação não pode ser desfeita.')) {
      setLoading(true);
      try {
        const deleteBatch = writeBatch(db);
        data.forEach(item => {
            deleteBatch.delete(doc(db, 'effectivenessData', item.id));
        });
        await deleteBatch.commit();
        alert('Todos os dados foram excluídos.');
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Ocorreu um erro ao excluir os dados.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Dados Diários - Efetividade</h1>
            <p className="text-sm text-gray-500">Importe, exporte ou exclua os dados do indicador.</p>
        </div>
        <button onClick={() => setView(View.DATA_LOADING_EFFECTIVENESS_SELECTION)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <Button onClick={handleImportClick} className="!w-auto text-sm py-2 px-4 flex items-center space-x-2" disabled={loading}>
            <ImportIcon />
            <span>Importar</span>
        </Button>
        <Button onClick={handleExport} variant="secondary" className="!w-auto text-sm py-2 px-4 flex items-center space-x-2" disabled={loading}>
            <ExportIcon />
            <span>Exportar</span>
        </Button>
        <Button onClick={handleDeleteAll} variant="danger" className="!w-auto text-sm py-2 px-4 flex items-center space-x-2" disabled={loading}>
            <DeleteIcon />
            <span>Excluir Tudo</span>
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
      {loading ? <div className="text-center p-8">Carregando dados...</div> : (
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Mês</th>
              <th scope="col" className="px-6 py-3">Semana</th>
              <th scope="col" className="px-6 py-3">Área</th>
              <th scope="col" className="px-6 py-3">Zona</th>
              <th scope="col" className="px-6 py-3">DVV</th>
              <th scope="col" className="px-6 py-3">Resultado</th>
              <th scope="col" className="px-6 py-3">(A/B)</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
                data.map((row) => (
                <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.mes}</td>
                    <td className="px-6 py-4">{row.semana}</td>
                    <td className="px-6 py-4">{row.area}</td>
                    <td className="px-6 py-4">{row.zona}</td>
                    <td className="px-6 py-4">{row.dvv}</td>
                    <td className="px-6 py-4">{row.resultado}</td>
                    <td className="px-6 py-4">{row.ab}</td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">Nenhum dado carregado.</td>
                </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default DataLoadingEffectiveness;
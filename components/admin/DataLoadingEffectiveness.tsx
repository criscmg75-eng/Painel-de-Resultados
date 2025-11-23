import React, { useRef, useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { EffectivenessData, View } from '../../types';
import Button from '../ui/Button';

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

  useEffect(() => {
    setLoading(true);
    const dataCollectionRef = collection(db, 'effectivenessData');
    const unsubscribe = onSnapshot(dataCollectionRef, (snapshot) => {
      const dataList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EffectivenessData));
      setData(dataList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase snapshot error:", error);
      alert("Falha ao carregar os dados. Verifique a conexão e as regras de segurança do Firebase.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      alert('Falha ao ler o arquivo. Verifique se o arquivo não está corrompido.');
    };

    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          alert("Não foi possível ler o conteúdo do arquivo como texto.");
          return;
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
          alert("O arquivo está vazio ou não contém dados válidos.");
          return;
        }

        const importedData: Omit<EffectivenessData, 'id'>[] = lines.map((line) => {
          const parts = line.split('\t').map(s => s.trim());
          const [
              mes = '', 
              semana = '', 
              area = '', 
              zona = '', 
              dvv = '', 
              resultado = '', 
              ab = ''
          ] = parts;
          return { mes, semana, area, zona, dvv, resultado, ab };
        });
        
        if (window.confirm(`Você está prestes a substituir TODOS os dados de efetividade por ${importedData.length} novos registros. Deseja continuar?`)) {
          setLoading(true);
          try {
            const dataCollectionRef = collection(db, 'effectivenessData');
            const querySnapshot = await getDocs(dataCollectionRef);
            const batch = writeBatch(db);
            
            querySnapshot.forEach(document => {
                batch.delete(document.ref);
            });

            importedData.forEach(itemData => {
                const newDocRef = doc(dataCollectionRef);
                batch.set(newDocRef, itemData);
            });
            
            await batch.commit();
            alert(`${importedData.length} registros importados com sucesso!`);
          } catch (error: any) {
              console.error("Error importing data to Firebase:", error);
              alert(`Ocorreu um erro ao importar os dados para o Firebase:\n\n${error.message}\n\nVerifique as regras de segurança e sua conexão.`);
          } finally {
              setLoading(false);
          }
        }
      } catch (processingError: any) {
        console.error("Error processing file content:", processingError);
        alert(`Ocorreu um erro ao processar o arquivo:\n\n${processingError.message}`);
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
        const dataCollectionRef = collection(db, 'effectivenessData');
        const querySnapshot = await getDocs(dataCollectionRef);
        const batch = writeBatch(db);
        querySnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        alert('Todos os dados foram excluídos.');
      } catch (error) {
        console.error("Error deleting all data:", error);
        alert("Ocorreu um erro ao excluir os dados. Verifique as regras de segurança do Firebase.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Carregamento de Dados - Efetividade</h1>
            <p className="text-sm text-gray-500">Importe, exporte ou exclua os dados do indicador.</p>
        </div>
        <button onClick={() => setView(View.DATA_LOADING_SELECTION)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <Button onClick={handleImportClick} className="!w-auto text-sm py-2 px-4 flex items-center space-x-2">
            <ImportIcon />
            <span>Importar</span>
        </Button>
        <Button onClick={handleExport} variant="secondary" className="!w-auto text-sm py-2 px-4 flex items-center space-x-2">
            <ExportIcon />
            <span>Exportar</span>
        </Button>
        <Button onClick={handleDeleteAll} variant="danger" className="!w-auto text-sm py-2 px-4 flex items-center space-x-2">
            <DeleteIcon />
            <span>Excluir Tudo</span>
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
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
          {loading ? (
              <tr><td colSpan={7} className="text-center py-10">Carregando dados...</td></tr>
            ) : data.length > 0 ? (
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
      </div>
    </div>
  );
};

export default DataLoadingEffectiveness;
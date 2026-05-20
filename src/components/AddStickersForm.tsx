import React, { useState } from 'react';
import { parseStickerCode, TEAMS } from '../data/albumData';
import { StickersRecord } from '../hooks/useAlbumState';

interface PackSummary {
  newStickers: string[];
  repeatedStickers: string[];
  completedTeams: string[];
}

export function AddStickersForm({ 
  onAddSingle, 
  onAddPack,
  stickers
}: { 
  onAddSingle: (id: string, count: number) => void,
  onAddPack: (ids: string[]) => void,
  stickers: StickersRecord
}) {
  const [singleCode, setSingleCode] = useState('');
  
  // Pack consists of 7 stickers usually
  const [packCodes, setPackCodes] = useState(['', '', '', '', '', '', '']);
  const [summary, setSummary] = useState<PackSummary | null>(null);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseStickerCode(singleCode);
    if (id) {
      onAddSingle(id, 1);
      setSingleCode('');
      // Show success somehow if needed, or simple toast
    } else {
      alert("Código inválido. Usa formatos como 'ARG 10' o 'arg10'.");
    }
  };

  const checkCompletedTeams = (oldStickers: StickersRecord, addedIds: string[]) => {
     const completed: string[] = [];
     const newStickersMap = { ...oldStickers };
     for (const id of addedIds) {
        newStickersMap[id] = (newStickersMap[id] || 0) + 1;
     }
  
     const checkedTeams = new Set<string>();
     for (const id of addedIds) {
        const teamId = id.split(' ')[0];
        if (checkedTeams.has(teamId)) continue;
        checkedTeams.add(teamId);
  
        const team = TEAMS.find(t => t.id === teamId);
        if (!team) continue;
  
        let wasComplete = true;
        let isComplete = true;
        
        for (let i = team.range[0]; i <= team.range[1]; i++) {
           const tCode = `${team.id} ${i}`;
           if (!oldStickers[tCode]) wasComplete = false;
           if (!newStickersMap[tCode]) isComplete = false;
        }
  
        if (!wasComplete && isComplete) {
           completed.push(team.name);
        }
     }
     return completed;
  };

  const handlePackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIds: string[] = [];
    const newStickers: string[] = [];
    const repeatedStickers: string[] = [];
    
    // Simulating addition for repeated logic
    const tempStickers = { ...stickers };

    for (const code of packCodes) {
      if (code.trim() === '') continue;
      const id = parseStickerCode(code);
      if (id) {
        parsedIds.push(id);
        if (tempStickers[id]) {
          repeatedStickers.push(id);
        } else {
          newStickers.push(id);
        }
        tempStickers[id] = (tempStickers[id] || 0) + 1;
      } else {
        alert(`Código inválido encontrado: ${code}. Por favor revisa y corrige.`);
        return;
      }
    }

    if (parsedIds.length > 0) {
      const completedTeams = checkCompletedTeams(stickers, parsedIds);
      
      onAddPack(parsedIds);
      setPackCodes(['', '', '', '', '', '', '']);
      
      setSummary({ newStickers, repeatedStickers, completedTeams });
    }
  };

  const overridePackCode = (index: number, val: string) => {
    const newCodes = [...packCodes];
    newCodes[index] = val;
    setPackCodes(newCodes);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setSummary(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">¡Sobre Abierto!</h2>
            
            <div className="flex justify-between items-start bg-gray-50 p-3 rounded-lg mb-4">
               <div className="text-center flex-1 pr-2 border-r border-gray-300">
                 <div className="text-xl font-bold text-green-600">{summary.newStickers.length}</div>
                 <div className="text-xs text-gray-500 uppercase tracking-tighter mb-2">Nuevas</div>
                 <div className="flex flex-wrap gap-1 justify-center">
                   {summary.newStickers.map((id, i) => (
                     <span key={i} className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded border border-green-200">{id}</span>
                   ))}
                 </div>
               </div>
               <div className="text-center flex-1 pl-2">
                 <div className="text-xl font-bold text-blue-600">{summary.repeatedStickers.length}</div>
                 <div className="text-xs text-gray-500 uppercase tracking-tighter mb-2">Repetidas</div>
                 <div className="flex flex-wrap gap-1 justify-center">
                   {summary.repeatedStickers.map((id, i) => (
                     <span key={i} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded border border-blue-200">{id}</span>
                   ))}
                 </div>
               </div>
            </div>

            {summary.completedTeams.length > 0 && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 text-center">
                <div className="text-xl mb-1">🎉🏆🎉</div>
                <h3 className="font-bold text-yellow-800 text-sm">¡Equipo Completado!</h3>
                <p className="text-yellow-700 font-semibold text-xs mt-1">
                  {summary.completedTeams.join(', ')}
                </p>
              </div>
            )}

            <button
               onClick={() => setSummary(null)}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
               Continuar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Cargar una Figurita</h3>
        <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de la Figurita</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase" 
              placeholder="Ej: ARG 10" 
              value={singleCode}
              onChange={(e) => setSingleCode(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            disabled={!singleCode.trim()}
          >
            Agregar Figurita
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Cargar un Sobre (7 Figuritas)</h3>
        <form onSubmit={handlePackSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {packCodes.map((code, idx) => (
              <div key={idx}>
                 <input 
                  type="text" 
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-center uppercase text-sm" 
                  placeholder={"1"} 
                  value={code}
                  onChange={(e) => overridePackCode(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Ingresa los códigos y presiona guardar.</p>
          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            disabled={packCodes.every(c => !c.trim())}
          >
            Abrir Sobre y Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

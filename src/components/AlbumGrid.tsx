import React from 'react';
import { TEAMS } from '../data/albumData';
import { StickersRecord } from '../hooks/useAlbumState';

export function AlbumGrid({ 
  stickers, 
  onAddSticker, 
  onRemoveSticker 
}: { 
  stickers: StickersRecord,
  onAddSticker: (id: string) => void,
  onRemoveSticker: (id: string) => void
}) {
  
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [viewOnly, setViewOnly] = React.useState(true);
  
  // Calculate max columns (0 to 20 = 21 columns max)
  const maxCols = 21;

  // We will create headers for 0 to 20
  const headers = Array.from({ length: maxCols }, (_, i) => i);

  const getGroupForTeam = (index: number) => {
    if (index < 2) return '-';
    const groupIndex = Math.floor((index - 2) / 4);
    if (groupIndex >= 12) return '-';
    return `Grupo ${String.fromCharCode(65 + groupIndex)}`; // 65 is 'A'
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
       <div className="p-4 border-b border-gray-200">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-800">Grilla del Álbum</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewOnly(!viewOnly)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors border ${viewOnly ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
              >
                {viewOnly ? '🔒 Solo Lectura' : '🔓 Modo Edición'}
              </button>
              {!viewOnly && (
                <button 
                  onClick={() => setDeleteMode(!deleteMode)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors border ${deleteMode ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
                >
                  {deleteMode ? '❌ Modo Restar ON' : 'Modo Restar OFF'}
                </button>
              )}
            </div>
         </div>
         <p className="text-xs text-gray-500 mt-1">
           {viewOnly ? 'La grilla está bloqueada para evitar modificaciones accidentales.' : 'Toca / haz clic en una celda para sumar o restar figuritas.'} 
           {!viewOnly && deleteMode && <span className="font-bold text-red-600 ml-2">(Modo restar activo)</span>}
           <span className="inline-block w-3 h-3 bg-red-500 ml-2 mr-1"></span>Falta
           <span className="inline-block w-3 h-3 bg-green-500 ml-2 mr-1"></span>Tengo
           <span className="inline-block w-3 h-3 bg-blue-500 ml-2 mr-1"></span>Repetida
         </p>
       </div>
       
       <div className="overflow-auto max-h-[75vh]">
         <table className="w-full text-xs text-center border-collapse">
           <thead className="sticky top-0 z-20 shadow-sm">
             <tr>
               <th className="border border-gray-300 p-2 bg-gray-100 font-bold sticky left-0 z-30 w-24">Equipo</th>
               <th className="border border-gray-300 p-2 bg-gray-100 font-bold w-12 z-20">%</th>
               {headers.map(num => (
                 <th key={num} className="border border-gray-300 p-1 bg-gray-100 min-w-[32px] w-8 z-20">
                   {num}
                 </th>
               ))}
               <th className="border border-gray-300 p-2 bg-gray-100 font-bold w-20 z-20">Grupo</th>
             </tr>
           </thead>
           <tbody>
             {TEAMS.map((team, index) => {
               // Calculate Progress
               let teamHas = 0;
               const teamTotal = team.range[1] - team.range[0] + 1;
               
               for (let i = team.range[0]; i <= team.range[1]; i++) {
                 if (stickers[`${team.id} ${i}`] > 0) teamHas++;
               }
               const progress = ((teamHas / teamTotal) * 100).toFixed(0);

               return (
                 <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                   <td className="border border-gray-300 p-1 bg-gray-800 text-white font-bold text-[10px] sticky left-0 z-10">
                     <div className="flex flex-col">
                       <span>{team.name}</span>
                       <span className="text-gray-400">{team.id}</span>
                     </div>
                   </td>
                   <td className="border border-gray-300 p-1 font-bold bg-gray-50">
                     {progress}%
                   </td>
                   
                   {headers.map(num => {
                     const isOutOfRange = num < team.range[0] || num > team.range[1];
                     if (isOutOfRange) {
                       return <td key={num} className="border border-gray-300 bg-gray-300"></td>;
                     }
                     
                     const id = `${team.id} ${num}`;
                     const count = stickers[id] || 0;
                     
                     let bgColorClass = "bg-red-500 text-white hover:bg-red-600"; // Missing
                     if (count === 1) bgColorClass = "bg-green-500 text-white hover:bg-green-600"; // Has
                     else if (count > 1) bgColorClass = "bg-blue-500 text-white hover:bg-blue-600"; // Repeated

                     return (
                       <td 
                         key={num} 
                         className={`border border-gray-300 p-0 font-bold ${!viewOnly ? 'cursor-pointer' : ''} select-none ${bgColorClass}`}
                         onClick={(e) => {
                            if (viewOnly) return;
                            if (e.shiftKey || deleteMode) {
                                onRemoveSticker(id);
                            } else {
                                onAddSticker(id);
                            }
                         }}
                         title={viewOnly ? `Cantidad: ${count}` : `Click para ${deleteMode ? 'restar' : 'sumar'} (Shift+Click en PC también resta). Actualmente: ${count}`}
                       >
                         {count === 0 ? "NO" : count}
                       </td>
                     );
                   })}
                   <td className="border border-gray-300 p-1 bg-gray-100 font-bold text-[10px] text-gray-700 whitespace-nowrap">
                     {getGroupForTeam(index)}
                   </td>
                 </tr>
               );
             })}
           </tbody>
         </table>
       </div>
       <div className="p-2 text-xs text-center text-gray-500">
         Tip: Mantén presionado <strong>Shift</strong> y haz clic para restar figuritas.
       </div>
    </div>
  );
}

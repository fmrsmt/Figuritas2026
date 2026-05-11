import React, { useMemo } from 'react';
import { TEAMS, TOTAL_STICKERS, getAllStickerIds } from '../data/albumData';
import { StickersRecord } from '../hooks/useAlbumState';

export function Dashboard({ 
  stickers, 
  packsOpened, 
  totalSpent 
}: { 
  stickers: StickersRecord, 
  packsOpened: number,
  totalSpent: number
}) {
  const stats = useMemo(() => {
    let uniqueCount = 0;
    let repeatedCount = 0;
    let totalCount = 0;
    let normalTotalCount = 0;
    let completedTeams = 0;

    const allIds = getAllStickerIds();
    
    // Group stickers by team
    const teamCounts: Record<string, number> = {};
    TEAMS.forEach(t => teamCounts[t.id] = 0);

    for (const id of allIds) {
      const count = stickers[id] || 0;
      if (count > 0) {
        uniqueCount++;
        repeatedCount += (count - 1);
        totalCount += count;
        
        const teamId = id.split(' ')[0];
        teamCounts[teamId]++;
        
        if (teamId !== 'CC') {
          normalTotalCount += count;
        }
      }
    }

    TEAMS.forEach(team => {
      const teamTotal = team.range[1] - team.range[0] + 1;
      if (teamCounts[team.id] === teamTotal) {
        completedTeams++;
      }
    });

    const progressPercent = (uniqueCount / TOTAL_STICKERS) * 100;
    const missingCount = TOTAL_STICKERS - uniqueCount;

    // Expected Repeated Math based on total random draws from normal packs
    // E(Unique) = N * (1 - (1 - 1/N)^normalTotalCount)
    // E(Repeated) = normalTotalCount - E(Unique)
    const TOTAL_NORMAL_STICKERS = TOTAL_STICKERS - 14; // excluding CC team if CC is length 14
    const expectedUnique = TOTAL_NORMAL_STICKERS * (1 - Math.pow(1 - 1 / TOTAL_NORMAL_STICKERS, normalTotalCount));
    const expectedRepeated = Math.max(0, Math.round(normalTotalCount - expectedUnique));

    return {
      uniqueCount,
      repeatedCount,
      totalCount,
      normalTotalCount,
      completedTeams,
      progressPercent,
      missingCount,
      expectedRepeated
    };
  }, [stickers]);

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Mi Álbum 2026</h2>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progreso General</span>
          <span className="text-sm font-bold text-blue-600">{stats.progressPercent.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out absolute top-0 left-0" 
            style={{ width: `${stats.progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-md flex flex-col items-center justify-center text-center">
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wide">Faltan</span>
          <span className="text-2xl font-black text-gray-800">{stats.missingCount}</span>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md flex flex-col items-center justify-center text-center">
          <span className="text-xs text-green-600 font-bold uppercase tracking-wide">Repetidas</span>
          <span className="text-2xl font-black text-gray-800">{stats.repeatedCount}</span>
        </div>

        <div className="bg-purple-50 p-4 rounded-md flex flex-col items-center justify-center text-center relative">
          <span className="text-xs text-purple-600 font-bold uppercase tracking-wide">Sobres Abiertos</span>
          <span className="text-2xl font-black text-gray-800">{packsOpened}</span>
          {stats.normalTotalCount % 7 !== 0 && (
            <span className="text-xs text-purple-600 font-bold mt-1">
              + {stats.normalTotalCount % 7} figurita(s) extra
            </span>
          )}
        </div>

        <div className="bg-indigo-50 p-4 rounded-md flex flex-col items-center justify-center text-center">
          <span className="text-xs text-indigo-600 font-bold uppercase tracking-wide">Gasto Total</span>
          <span className="text-2xl font-black text-gray-800">${totalSpent.toFixed(2)}</span>
        </div>

        <div className="bg-yellow-50 p-4 rounded-md flex flex-col items-center justify-center text-center">
          <span className="text-xs text-yellow-600 font-bold uppercase tracking-wide">Equipos Completos</span>
          <span className="text-2xl font-black text-gray-800">{stats.completedTeams} / {TEAMS.length}</span>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center justify-center text-center col-span-2 md:col-span-4 border border-gray-200">
           <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total Recolectadas</span>
           <span className="text-lg font-bold text-gray-800">{stats.uniqueCount} / {TOTAL_STICKERS} únicas</span>
        </div>
      </div>
      
      {/* Analytics Section */}
      <div className="mt-6 border-t border-gray-200 pt-6">
         <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Análisis Estadístico</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
               <div className="text-sm text-gray-600">Repetidas (Paquetes)</div>
               <div className="text-2xl font-bold text-gray-800">{stats.expectedRepeated}</div>
               <p className="text-xs text-gray-500 mt-1">Basado en tus {stats.normalTotalCount} figuritas obtenidas de sobres, estadísticamente deberías tener este número de repetidas (suponiendo que no cambiaste ninguna).</p>
            </div>
            <div className={`p-4 rounded border ${stats.repeatedCount > stats.expectedRepeated ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
               <div className={`text-sm ${stats.repeatedCount > stats.expectedRepeated ? 'text-red-600' : 'text-green-600'}`}>Actuales (Considerando cambios)</div>
               <div className="flex items-end gap-2">
                 <div className="text-2xl font-bold text-gray-800">{stats.repeatedCount}</div>
                 <div className={`text-sm font-bold mb-1 ${stats.repeatedCount > stats.expectedRepeated ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.repeatedCount > stats.expectedRepeated ? '↑ Peor suerte' : '↓ Reducidas por cambios'}
                 </div>
               </div>
               <p className={`text-xs mt-1 ${stats.repeatedCount > stats.expectedRepeated ? 'text-red-500' : 'text-green-500'}`}>
                 Tienes {Math.abs(stats.repeatedCount - stats.expectedRepeated)} figurita(s) {stats.repeatedCount > stats.expectedRepeated ? 'más' : 'menos'} que el promedio, lo que refleja {stats.repeatedCount > stats.expectedRepeated ? 'tu suerte al abrir sobres' : 'tu constancia realizando intercambios (o buena suerte)'}.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { TEAMS, getAllStickerIds } from '../data/albumData';
import { StickersRecord } from '../hooks/useAlbumState';

export function Lists({ stickers, stickerNames = {} }: { stickers: StickersRecord, stickerNames?: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<'repeated' | 'missing'>('repeated');
  const [searchTerm, setSearchTerm] = useState('');

  const allIds = getAllStickerIds();
  
  const repeated: string[] = [];
  const missing: string[] = [];

  allIds.forEach(id => {
    const count = stickers[id] || 0;
    const name = stickerNames[id] || '';
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!id.toLowerCase().includes(term) && !name.toLowerCase().includes(term)) {
         return; // skip
      }
    }

    if (count > 1) repeated.push(id);
    else if (count === 0) missing.push(id);
  });

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <div className="p-4 border-b border-gray-200">
         <input 
           type="text" 
           placeholder="Buscar por equipo, número o nombre..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
           className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
         />
      </div>
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${activeTab === 'repeated' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('repeated')}
        >
          Mis Repetidas ({repeated.length})
        </button>
        <button
          className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${activeTab === 'missing' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('missing')}
        >
          Faltantes ({missing.length})
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'repeated' && (
          <div>
             {repeated.length === 0 ? (
               <p className="text-gray-500 text-center py-8">No hay resultados.</p>
             ) : (
               <div className="flex flex-wrap gap-2">
                 {repeated.map(id => (
                   <div key={id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2" title={stickerNames[id]}>
                     {id} {stickerNames[id] && <span className="font-normal truncate max-w-[150px] inline-block align-bottom">{stickerNames[id]}</span>}
                     <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                       {stickers[id] - 1}
                     </span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'missing' && (
          <div>
             {missing.length === 0 ? (
               <p className="text-gray-500 text-center py-8">No hay resultados.</p>
             ) : (
               <div className="flex flex-wrap gap-2">
                 {missing.map(id => (
                   <div key={id} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2" title={stickerNames[id]}>
                     {id} {stickerNames[id] && <span className="font-normal truncate max-w-[150px] inline-block align-bottom">{stickerNames[id]}</span>}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

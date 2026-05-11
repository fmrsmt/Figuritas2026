import React, { useState } from 'react';
import { TEAMS, getAllStickerIds } from '../data/albumData';
import { StickersRecord } from '../hooks/useAlbumState';

export function Lists({ stickers }: { stickers: StickersRecord }) {
  const [activeTab, setActiveTab] = useState<'repeated' | 'missing'>('repeated');

  const allIds = getAllStickerIds();
  
  const repeated: string[] = [];
  const missing: string[] = [];

  allIds.forEach(id => {
    const count = stickers[id] || 0;
    if (count > 1) repeated.push(id);
    else if (count === 0) missing.push(id);
  });

  return (
    <div className="bg-white rounded-lg shadow mt-6">
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
               <p className="text-gray-500 text-center py-8">No tienes figuritas repetidas aún.</p>
             ) : (
               <div className="flex flex-wrap gap-2">
                 {repeated.map(id => (
                   <div key={id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                     {id} 
                     <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
               <p className="text-gray-500 text-center py-8">¡Felicidades! Has completado el álbum.</p>
             ) : (
               <div className="flex flex-wrap gap-2">
                 {missing.map(id => (
                   <div key={id} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-medium">
                     {id}
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

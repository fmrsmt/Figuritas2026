import React, { useState } from 'react';
import { parseStickerCode } from '../data/albumData';

export function TradeForm({ 
  onExecuteTrade,
  stickerNames = {}
}: { 
  onExecuteTrade: (givenIds: string[], receivedIds: string[]) => void;
  stickerNames?: Record<string, string>;
}) {
  const [givenText, setGivenText] = useState('');
  const [receivedText, setReceivedText] = useState('');

  const parseCodesList = (text: string): string[] => {
    // splits by newline, comma, and remove empty
    const rawItems = text.split(/[\n,]+/).map(item => item.trim()).filter(item => item !== '');
    const codes: string[] = [];
    
    // Reverse map for case-insensitive lookup
    const nameToIdMap: Record<string, string> = {};
    Object.entries(stickerNames).forEach(([id, name]) => {
      if (name) {
        nameToIdMap[name.trim().toLowerCase()] = id;
      }
    });

    for (const item of rawItems) {
      const lowerItem = item.toLowerCase();
      if (nameToIdMap[lowerItem]) {
        codes.push(nameToIdMap[lowerItem]);
        continue;
      }

      // If not a known name, try parsing as a regular sticker code
      const parsed = parseStickerCode(item);
      if (parsed) {
        codes.push(parsed);
      }
    }
    return codes;
  };

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse input
    const givenIds = parseCodesList(givenText);
    const receivedIds = parseCodesList(receivedText);

    if (givenIds.length === 0 && receivedIds.length === 0) {
      alert('Ingresa al menos una figurita para intercambiar.');
      return;
    }

    onExecuteTrade(givenIds, receivedIds);
    setGivenText('');
    setReceivedText('');
    alert(`Cambio exitoso: Entregaste ${givenIds.length} figuritas y recibiste ${receivedIds.length} figuritas.`);
  };

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Registrar Cambios</h2>
        <p className="text-xs text-gray-500 mt-1">
          Ingresa los códigos de las figuritas que entregas y las que recibes.
          Puedes registrar un cambio 1 a 1, o un lote completo pegando los códigos.
        </p>
      </div>

      <form onSubmit={handleTrade} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div>
             <label className="block text-sm font-bold text-red-600 mb-2">Entregas (Tus Repetidas)</label>
             <textarea 
               className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[120px] focus:ring-red-500 focus:border-red-500"
               placeholder="Ej: ARG 10, BRA 12, MEX 3..."
               value={givenText}
               onChange={(e) => setGivenText(e.target.value)}
             />
             <p className="text-xs text-gray-500 mt-1">Se restarán de tu álbum</p>
           </div>
           
           <div>
             <label className="block text-sm font-bold text-green-600 mb-2">Recibes (Nuevas)</label>
             <textarea 
               className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[120px] focus:ring-green-500 focus:border-green-500"
               placeholder="Ej: QAT 1, FRA 20..."
               value={receivedText}
               onChange={(e) => setReceivedText(e.target.value)}
             />
             <p className="text-xs text-gray-500 mt-1">Se sumarán a tu álbum</p>
           </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Confirmar Cambio
        </button>
      </form>
    </div>
  );
}

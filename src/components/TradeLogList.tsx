import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface TradeLogEntry {
  id: string;
  givenIds: string[];
  receivedIds: string[];
  createdAt: any;
}

export function TradeLogList() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<TradeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'albums', user.uid, 'tradeLogs'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsedLogs: TradeLogEntry[] = [];
      snapshot.forEach(doc => {
        parsedLogs.push({ id: doc.id, ...doc.data() } as TradeLogEntry);
      });
      setLogs(parsedLogs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `albums/${user.uid}/tradeLogs`);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando historial de cambios...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow mt-6 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Cambios</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500 italic text-center py-6">Aún no has registrado ningún cambio.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between bg-gray-50">
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase text-red-600 mb-1">Entregaste</h4>
                <div className="flex flex-wrap gap-1">
                  {log.givenIds.length === 0 ? <span className="text-xs text-gray-400">Nada</span> : log.givenIds.map((id, i) => (
                    <span key={i} className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded border border-red-200">{id}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center justify-center">
                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </div>

              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase text-green-600 mb-1">Recibiste</h4>
                <div className="flex flex-wrap gap-1">
                  {log.receivedIds.length === 0 ? <span className="text-xs text-gray-400">Nada</span> : log.receivedIds.map((id, i) => (
                    <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded border border-green-200">{id}</span>
                  ))}
                </div>
              </div>

              {log.createdAt && (
                <div className="text-xs text-gray-400 flex items-end ml-4 min-w-[80px] text-right">
                  {log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toLocaleDateString() : 'Procesando...'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

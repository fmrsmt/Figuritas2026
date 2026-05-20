import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface ActivityLogEntry {
  id: string;
  type?: 'trade' | 'pack' | 'add' | 'remove';
  givenIds?: string[];
  receivedIds?: string[];
  stickerIds?: string[]; // for pack
  newIds?: string[]; // for pack
  repeatedIds?: string[]; // for pack
  stickerId?: string; // for add/remove
  count?: number; // for add/remove
  createdAt: any;
}

export function TradeLogList() {
  const { user } = useAuth();
  const [tradeLogs, setTradeLogs] = useState<ActivityLogEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let tradeLogsResolved = false;
    let activityLogsResolved = false;

    const checkLoading = () => {
       if (tradeLogsResolved && activityLogsResolved) {
         setLoading(false);
       }
    };

    const qTrades = query(collection(db, 'albums', user.uid, 'tradeLogs'), orderBy('createdAt', 'desc'));
    const unsubTrades = onSnapshot(qTrades, (snapshot) => {
      const parsedLogs: ActivityLogEntry[] = [];
      snapshot.forEach(doc => {
        parsedLogs.push({ id: doc.id, type: 'trade', ...doc.data() } as ActivityLogEntry);
      });
      setTradeLogs(parsedLogs);
      tradeLogsResolved = true;
      checkLoading();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `albums/${user.uid}/tradeLogs`);
      tradeLogsResolved = true; checkLoading();
    });

    const qActivity = query(collection(db, 'albums', user.uid, 'activityLogs'), orderBy('createdAt', 'desc'));
    const unsubActivity = onSnapshot(qActivity, (snapshot) => {
      const parsedLogs: ActivityLogEntry[] = [];
      snapshot.forEach(doc => {
        parsedLogs.push({ id: doc.id, ...doc.data() } as ActivityLogEntry);
      });
      setActivityLogs(parsedLogs);
      activityLogsResolved = true;
      checkLoading();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `albums/${user.uid}/activityLogs`);
      activityLogsResolved = true; checkLoading();
    });

    return () => { unsubTrades(); unsubActivity(); };
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando historial de actividad...</div>;
  }

  const allLogs = [...tradeLogs, ...activityLogs].sort((a, b) => {
     const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
     const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
     return timeB - timeA;
  });

  return (
    <div className="bg-white rounded-lg shadow mt-6 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Actividad</h2>
      {allLogs.length === 0 ? (
        <p className="text-gray-500 italic text-center py-6">Aún no has registrado ninguna actividad.</p>
      ) : (
        <div className="space-y-4">
          {allLogs.map((log) => {
            if (log.type === 'trade' || (!log.type && log.givenIds && log.receivedIds)) {
              return (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between bg-blue-50/50">
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] uppercase font-bold text-blue-600 mb-2">Intercambio</span>
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase text-red-600 mb-1">Entregaste</h4>
                        <div className="flex flex-wrap gap-1">
                          {log.givenIds?.length === 0 ? <span className="text-xs text-gray-400">Nada</span> : log.givenIds?.map((id, i) => (
                            <span key={i} className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded border border-red-200">{id}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center justify-center">
                         <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      </div>

                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase text-green-600 mb-1">Recibiste</h4>
                        <div className="flex flex-wrap gap-1">
                          {log.receivedIds?.length === 0 ? <span className="text-xs text-gray-400">Nada</span> : log.receivedIds?.map((id, i) => (
                            <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded border border-green-200">{id}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {log.createdAt && (
                    <div className="text-xs text-gray-400 flex items-end ml-4 min-w-[80px] text-right justify-end md:justify-start">
                      {log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toLocaleDateString() : 'Procesando...'}
                    </div>
                  )}
                </div>
              );
            }
            
            if (log.type === 'pack') {
              return (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between bg-yellow-50/50">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-yellow-600 mb-2 block">Sobre Abierto</span>
                    {(log.newIds && log.newIds.length > 0) || (log.repeatedIds && log.repeatedIds.length > 0) ? (
                       <div className="flex flex-col gap-2">
                         {log.newIds && log.newIds.length > 0 && (
                            <div>
                               <span className="text-[10px] text-green-600 block mb-1">Nuevas:</span>
                               <div className="flex flex-wrap gap-1">
                                  {log.newIds.map((id, i) => (
                                     <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded border border-green-200">{id}</span>
                                  ))}
                               </div>
                            </div>
                         )}
                         {log.repeatedIds && log.repeatedIds.length > 0 && (
                            <div>
                               <span className="text-[10px] text-blue-600 block mb-1">Repetidas:</span>
                               <div className="flex flex-wrap gap-1">
                                  {log.repeatedIds.map((id, i) => (
                                     <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded border border-blue-200">{id}</span>
                                  ))}
                               </div>
                            </div>
                         )}
                       </div>
                    ) : (
                       <div className="flex flex-wrap gap-1">
                         {log.stickerIds?.map((id, i) => (
                            <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded border border-yellow-200">{id}</span>
                         ))}
                       </div>
                    )}
                  </div>
                  {log.createdAt && (
                    <div className="text-xs text-gray-400 flex items-end ml-4 min-w-[80px] text-right justify-end md:justify-start">
                      {log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toLocaleDateString() : 'Procesando...'}
                    </div>
                  )}
                </div>
              );
            }

            if (log.type === 'add' || log.type === 'remove') {
              const isAdd = log.type === 'add';
              return (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                  <div>
                     <span className={`text-[10px] uppercase font-bold mb-2 block ${isAdd ? 'text-green-600' : 'text-red-600'}`}>
                        {isAdd ? 'Figurita Agregada' : 'Figurita Restada'}
                     </span>
                     <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${isAdd ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                           {log.stickerId}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">x{log.count}</span>
                     </div>
                  </div>
                  {log.createdAt && (
                    <div className="text-xs text-gray-400 flex items-end ml-4 min-w-[80px] text-right justify-end md:justify-start">
                      {log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toLocaleDateString() : 'Procesando...'}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}

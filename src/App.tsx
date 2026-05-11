import React, { useState } from 'react';
import { useAlbumState } from './hooks/useAlbumState';
import { Dashboard } from './components/Dashboard';
import { AlbumGrid } from './components/AlbumGrid';
import { AddStickersForm } from './components/AddStickersForm';
import { Lists } from './components/Lists';
import { TradeForm } from './components/TradeForm';
import { TradeLogList } from './components/TradeLogList';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const { user, loading, logOut } = useAuth();
  const { stickers, packsOpened, totalSpent, addSticker, removeSticker, addPack, executeTrade, isLoadingData } = useAlbumState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'grid' | 'add' | 'lists' | 'trades'>('dashboard');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Cargando...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-12">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-10 bg-white rounded-t-lg rounded-b flex items-center justify-center text-blue-800 font-black text-xs leading-none relative overflow-hidden">
               <span className="z-10 mt-1">26</span>
               <div className="absolute bottom-0 w-full h-2 bg-red-500"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Álbum WC 2026</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-1">
              {['dashboard', 'grid', 'add', 'lists', 'trades'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeTab === tab 
                      ? 'bg-blue-900 text-white' 
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  {tab === 'dashboard' ? 'Resumen' : tab === 'grid' ? 'Grilla' : tab === 'add' ? 'Cargar' : tab === 'lists' ? 'Listas' : 'Cambios'}
                </button>
              ))}
            </nav>
            <button onClick={logOut} className="text-sm font-semibold hover:text-red-300">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto mb-6 bg-white rounded-lg shadow h-12 snap-x">
           {['dashboard', 'grid', 'add', 'lists', 'trades'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`snap-center flex-shrink-0 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab === 'dashboard' ? 'Resumen' : tab === 'grid' ? 'Grilla' : tab === 'add' ? 'Cargar' : tab === 'lists' ? 'Listas' : 'Cambios'}
              </button>
            ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard stickers={stickers} packsOpened={packsOpened} totalSpent={totalSpent} />
            <AddStickersForm onAddSingle={addSticker} onAddPack={addPack} stickers={stickers} />
          </div>
        )}

        {activeTab === 'grid' && (
          <AlbumGrid 
            stickers={stickers} 
            onAddSticker={(id) => addSticker(id, 1)} 
            onRemoveSticker={(id) => removeSticker(id, 1)} 
          />
        )}

        {activeTab === 'add' && (
          <AddStickersForm onAddSingle={addSticker} onAddPack={addPack} stickers={stickers} />
        )}

        {activeTab === 'lists' && (
          <Lists stickers={stickers} />
        )}

        {activeTab === 'trades' && (
          <div className="space-y-6">
            <TradeForm onExecuteTrade={executeTrade} />
            <TradeLogList />
          </div>
        )}
      </main>
    </div>
  );
}

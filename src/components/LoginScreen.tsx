import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
         <div className="w-16 h-20 bg-blue-800 rounded-t-lg rounded-b flex items-center justify-center text-white font-black text-2xl leading-none relative overflow-hidden mx-auto mb-6 shadow-md">
            <span className="z-10 mt-2">26</span>
            <div className="absolute bottom-0 w-full h-4 bg-red-500"></div>
         </div>
         <h1 className="text-2xl font-bold text-gray-800 mb-2">Álbum Mundial 2026</h1>
         <p className="text-gray-500 mb-8">Inicia sesión para guardar tu progreso, registrar tus repetidas y gestionar tus cambios desde cualquier lugar.</p>
         
         <button 
           onClick={signIn}
           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
         >
           Continuar con Google
         </button>
      </div>
    </div>
  );
}

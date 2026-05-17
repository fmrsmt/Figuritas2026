import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp, writeBatch, collection, deleteField } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export type StickersRecord = Record<string, number>;

interface AlbumData {
  stickers: StickersRecord;
  stickerNames: Record<string, string>;
  packsOpened: number;
  totalSpent: number;
}

const computeDerivedStats = (stickers: StickersRecord) => {
   let totalNormalStickers = 0;
   for (const [id, count] of Object.entries(stickers)) {
      if (!id.startsWith('CC ') && typeof count === 'number' && count > 0) {
         totalNormalStickers += count;
      }
   }
   // Assuming 7 stickers per pack and $2000 per pack
   const calculatedPacks = Math.floor(totalNormalStickers / 7);
   const calculatedSpent = calculatedPacks * 2000;
   return { packsOpened: calculatedPacks, totalSpent: calculatedSpent };
};

export function useAlbumState() {
  const { user } = useAuth();
  const [data, setData] = useState<AlbumData>({ stickers: {}, stickerNames: {}, packsOpened: 0, totalSpent: 0 });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user) {
      setData({ stickers: {}, stickerNames: {}, packsOpened: 0, totalSpent: 0 });
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    const albumRef = doc(db, 'albums', user.uid);
    
    const unsubscribe = onSnapshot(albumRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        const derived = computeDerivedStats(d.stickers || {});
        setData({
          stickers: d.stickers || {},
          stickerNames: d.stickerNames || {},
          packsOpened: derived.packsOpened,
          totalSpent: derived.totalSpent,
        });
      } else {
        // Initialize if not exists
        setDoc(albumRef, {
          stickers: {},
          stickerNames: {},
          packsOpened: 0,
          totalSpent: 0,
          userId: user.uid,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `albums/${user.uid}`));
      }
      setIsLoadingData(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `albums/${user.uid}`);
      setIsLoadingData(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateFirestore = async (newStickers: StickersRecord) => {
    if (!user) return;
    const derived = computeDerivedStats(newStickers);
    try {
      await setDoc(doc(db, 'albums', user.uid), {
        stickers: newStickers,
        packsOpened: derived.packsOpened,
        totalSpent: derived.totalSpent,
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `albums/${user.uid}`);
    }
  };

  const addSticker = (id: string, count: number = 1) => {
    const current = data.stickers[id] || 0;
    const newStickers = { ...data.stickers };
    newStickers[id] = current + count;
    updateFirestore(newStickers);
  };

  const removeSticker = (id: string, count: number = 1) => {
    const current = data.stickers[id] || 0;
    const newCount = Math.max(0, current - count);
    const newStickers = { ...data.stickers };
    if (newCount === 0) {
      newStickers[id] = deleteField() as any; // Firestore merge:true will remove this field
    } else {
      newStickers[id] = newCount;
    }
    updateFirestore(newStickers);
  };

  const addPack = (stickerIds: string[]) => {
    const newStickers = { ...data.stickers };
    stickerIds.forEach((id) => {
      newStickers[id] = (newStickers[id] || 0) + 1;
    });
    updateFirestore(newStickers);
  };

  const resetAlbum = () => {
    updateFirestore({});
  };

  const updateStickerName = async (id: string, name: string) => {
    if (!user) return;
    const newNames = { ...data.stickerNames };
    if (!name.trim()) {
       newNames[id] = deleteField() as any;
    } else {
       newNames[id] = name.trim();
    }
    
    // We update eagerly in local state or let onSnapshot do it? Let onSnapshot handle it, but we can do a direct setDoc
    try {
      await setDoc(doc(db, 'albums', user.uid), {
        stickerNames: newNames,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `albums/${user.uid}`);
    }
  };

  const executeTrade = async (givenIds: string[], receivedIds: string[]) => {
    if (!user) return;
    const newStickers = { ...data.stickers };
    
    // Remove given
    givenIds.forEach(id => {
      const current = newStickers[id] || 0;
      if (current > 0) {
         const newCount = current - 1;
         if (newCount === 0) {
            newStickers[id] = deleteField() as any;
         } else {
            newStickers[id] = newCount;
         }
      }
    });

    // Add received
    receivedIds.forEach(id => {
       newStickers[id] = (newStickers[id] || 0) + 1;
    });

    const derived = computeDerivedStats(newStickers);

    try {
      const batch = writeBatch(db);
      
      const albumRef = doc(db, 'albums', user.uid);
      batch.set(albumRef, {
        stickers: newStickers,
        packsOpened: derived.packsOpened,
        totalSpent: derived.totalSpent,
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const logRef = doc(collection(db, 'albums', user.uid, 'tradeLogs'));
      batch.set(logRef, {
        userId: user.uid,
        givenIds,
        receivedIds,
        createdAt: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, `albums/${user.uid} / trades`);
    }
  };

  return {
    stickers: data.stickers,
    stickerNames: data.stickerNames,
    packsOpened: data.packsOpened,
    totalSpent: data.totalSpent,
    isLoadingData,
    addSticker,
    removeSticker,
    addPack,
    executeTrade,
    resetAlbum,
    updateStickerName
  };
}

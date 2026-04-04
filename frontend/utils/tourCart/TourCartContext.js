import React, { createContext, useContext, useState, useEffect } from 'react';

const TourCartContext = createContext(null);

export function TourCartProvider({ children }) {
  const [userPOIs, setUserPOIs] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userTourCart');
      if (stored) setUserPOIs(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const addPOI = (poi) => {
    setUserPOIs((prev) => {
      if (prev.find((p) => p.id === poi.id)) return prev;
      const next = [...prev, poi];
      try { localStorage.setItem('userTourCart', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removePOI = (id) => {
    setUserPOIs((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try { localStorage.setItem('userTourCart', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearAll = () => {
    setUserPOIs([]);
    try { localStorage.removeItem('userTourCart'); } catch {}
  };

  const reorderPOIs = (newList) => {
    setUserPOIs(newList);
    try { localStorage.setItem('userTourCart', JSON.stringify(newList)); } catch {}
  };

  return (
    <TourCartContext.Provider value={{ userPOIs, addPOI, removePOI, clearAll, reorderPOIs }}>
      {children}
    </TourCartContext.Provider>
  );
}

export function useTourCart() {
  const ctx = useContext(TourCartContext);
  if (!ctx) throw new Error('useTourCart must be used within TourCartProvider');
  return ctx;
}

import { createContext, useState } from 'react';

export const VisibleToolsCountContext = createContext({
  visibleCount: null,
  setVisibleCount: () => {},
});

export function VisibleToolsCountProvider({ children }) {
  const [visibleCount, setVisibleCount] = useState(null);
  return (
    <VisibleToolsCountContext.Provider value={{ visibleCount, setVisibleCount }}>
      {children}
    </VisibleToolsCountContext.Provider>
  );
}

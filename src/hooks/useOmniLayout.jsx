import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export const LayoutContext = createContext(null);

export const useOmniLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useOmniLayout must be used within a LayoutProvider');
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [panels, setPanels] = useState({});
  const [activePanels, setActivePanels] = useState([]);

  // Use a ref to always have the latest panels available inside the toggle function
  // without forcing the toggle function to recreate and break the window bridge.
  const registerPanel = useCallback((id, config) => {
    setPanels(prev => ({
      ...prev,
      [id]: { 
        id, 
        position: 'left', 
        title: id, 
        icon: '●', 
        ...config 
      }
    }));
  }, []);

  const togglePanel = useCallback((id) => {
    // We access the current panels state inside the setActivePanels updater
    // This avoids the "undefined" or "empty object" bug
    setActivePanels(prevActive => {
      const isOpening = !prevActive.includes(id);
      
      if (isOpening) {
        // Find the panel in our state. We use an "updater" pattern or 
        // access via the closure. Since we want to be safe, we check if it exists.
        const target = panels[id];
        
        // Fallback: If panels haven't populated yet, we can't apply "one per side" rules
        if (!target) return [...prevActive, id];

        if (target.position === 'left' || target.position === 'right') {
          // Close siblings on the same side
          const cleanActive = prevActive.filter(activeId => 
            panels[activeId]?.position !== target.position
          );
          return [...cleanActive, id];
        }
        return [...prevActive, id];
      } else {
        return prevActive.filter(p => p !== id);
      }
    });
  }, [panels]); // Re-bind when panels change so logic knows the positions

  const isOpen = useCallback((id) => activePanels.includes(id), [activePanels]);

  const value = useMemo(() => ({
    panels, 
    activePanels, 
    registerPanel, 
    togglePanel, 
    isOpen
  }), [panels, activePanels, registerPanel, togglePanel, isOpen]);

  // BRIDGE: This is why it was failing. 
  // We need to update the window object every time the state changes.
  useEffect(() => {
    window.omniLayout = value;
  }, [value]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
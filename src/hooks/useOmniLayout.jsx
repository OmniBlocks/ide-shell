import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export const LayoutContext = createContext(null);

export const useOmniLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useOmniLayout must be used within a LayoutProvider');
  return context;
};

export const LayoutProvider = ({ children }) => {
  // 1. Registry States
  const [panels, setPanels] = useState({});
  const [statusItems, setStatusItems] = useState({});
  
  // 2. UI State
  const [activePanels, setActivePanels] = useState([]); // List of IDs currently 'visible'
  const [activeSelection, setActiveSelection] = useState({
    center: null,
    bottom: null,
    left: null,
  });

  // --- Helpers ---

  const isOpen = useCallback((id) => activePanels.includes(id), [activePanels]);

  const setSelected = useCallback((position, id) => {
    setActiveSelection(prev => ({ ...prev, [position]: id }));
  }, []);

  // --- Registration Logic ---

  /**
   * Register a UI Panel (Sidebar, Terminal, or Main Editor)
   */
  const registerPlugin = useCallback((plugin) => {
    if (!plugin.id) return;

    setPanels(prev => ({
      ...prev,
      [plugin.id]: {
        id: plugin.id,
        title: plugin.name || plugin.id,
        component: plugin.component,
        position: plugin.position || 'left',
        icon: plugin.icon || '🧩',
        ...plugin 
      }
    }));

    // Auto-open logic: Center panels (Editors) usually open immediately
    if (plugin.position === 'center') {
      setActivePanels(prev => Array.from(new Set([...prev, plugin.id])));
      setSelected('center', plugin.id);
    }

    if (plugin.onLoad) plugin.onLoad();

    console.log(`Registered plugin: ${plugin.id}`);
  }, [setSelected]);

  /**
   * Register a tiny piece of the Status Bar
   */
  const registerStatusItem = useCallback((id, config) => {
    setStatusItems(prev => ({
      ...prev,
      [id]: {
        id,
        alignment: 'left',
        order: 100,
        text: '',
        ...config
      }
    }));
  }, []);

  // --- Interactive Logic ---

  const togglePanel = useCallback((id) => {
    setActivePanels(prevActive => {
      const target = panels[id];
      const isOpening = !prevActive.includes(id);

      if (isOpening) {
        // VS Code style: sidebars are usually exclusive (one at a time)
        if (target?.position === 'left' || target?.position === 'right') {
          const filtered = prevActive.filter(activeId => 
            panels[activeId]?.position !== target.position
          );
          return [...filtered, id];
        }
        
        // Non-exclusive slots (Center, Bottom)
        const nextActive = [...prevActive, id];
        if (target?.position) setSelected(target.position, id);
        return nextActive;
      } else {
        return prevActive.filter(p => p !== id);
      }
    });
  }, [panels, setSelected]);

  // --- Memoized Value & Bridge ---

  const value = useMemo(() => ({
    // Data
    panels: Object.values(panels),
    statusItems: Object.values(statusItems).sort((a, b) => a.order - b.order),
    activePanels,
    activeSelection,
    
    // Actions
    registerPlugin,
    registerStatusItem,
    togglePanel,
    setSelected,
    isOpen
  }), [panels, statusItems, activePanels, activeSelection, registerPlugin, registerStatusItem, togglePanel, setSelected, isOpen]);

  // Expose to window for vanilla JS plugins / DevTools
  useEffect(() => {
    window.omniLayout = value;
  }, [value]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
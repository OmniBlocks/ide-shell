import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

export const LayoutContext = createContext(null);

export const useOmniLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useOmniLayout must be used within a LayoutProvider');
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [panels, setPanels] = useState({});
  const [statusItems, setStatusItems] = useState({});
  const dockviewApiRef = useRef(null);

  const registerPlugin = useCallback((plugin) => {
    setPanels(prev => ({
      ...prev,
      [plugin.id]: {
        ...plugin,
        title: plugin.name || plugin.id,
        position: plugin.position || 'center',
      }
    }));
  }, []);

  const registerStatusItem = useCallback((id, config) => {
    setStatusItems(prev => ({
      ...prev,
      [id]: { id, alignment: 'left', order: 100, ...config }
    }));
  }, []);

  const togglePanel = useCallback((id) => {
    const api = dockviewApiRef.current;
    if (!api) return;
    const panel = api.getPanel(id);
    if (panel) {
      panel.isVisible ? panel.hide() : panel.show();
    }
  }, []);

  const value = useMemo(() => ({
    panels: Object.values(panels),
    statusItems: Object.values(statusItems).sort((a, b) => a.order - b.order),
    dockviewApiRef,
    registerPlugin,
    registerStatusItem,
    togglePanel,
    isOpen: (id) => dockviewApiRef.current?.getPanel(id)?.isVisible || false
  }), [panels, statusItems, registerPlugin, registerStatusItem, togglePanel]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
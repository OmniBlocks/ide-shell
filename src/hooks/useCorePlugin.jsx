import { useState, useCallback, useEffect } from 'react';
import { useOmniLayout } from './useOmniLayout';
import MonacoEditor from '../lib/Monaco';

export const useCorePlugin = () => {
  const { registerPlugin, registerStatusItem, togglePanel } = useOmniLayout();
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((text) => {
    setNotifications(prev => [...prev, { id: Date.now(), text, timestamp: new Date() }]);
  }, []);

  // Initialize Core UI components
  useEffect(() => {
    // 1. Register the Main Workspace (VS Code style editor)
    registerPlugin({
      id: 'main-editor',
      name: 'Editor',
      position: 'center',
      component: <MonacoEditor />,
      onLoad: () => console.log("Core Editor Loaded")
    });

    // 2. Register Notification Button in Status Bar
    registerStatusItem('notifications-trigger', {
      alignment: 'right',
      order: 1000, // Keep it at the far right
      text: `🔔 ${notifications.length}`,
      onClick: () => togglePanel('notifications-panel')
    });

    // 3. Register the Hidden Notifications Panel
    registerPlugin({
      id: 'notifications-panel',
      name: 'Notifications',
      position: 'bottom',
      icon: '🔔',
      component: (
        <div style={{ padding: '20px' }}>
          {notifications.length === 0 ? (
            <div style={{ color: '#666' }}>No new notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ borderBottom: '1px solid #333', padding: '8px 0' }}>
                {n.text}
              </div>
            ))
          )}
        </div>
      )
    });
  }, [registerPlugin, registerStatusItem, togglePanel, notifications.length]);

  return {
    notifications,
    addNotification
  };
};
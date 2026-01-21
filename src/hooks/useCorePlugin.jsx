import { useState, useCallback, useEffect, useRef } from 'react';
import { useOmniLayout } from './useOmniLayout';
import MonacoEditor from '../lib/Monaco';

export const useCorePlugin = () => {
  const { registerPlugin, registerStatusItem, togglePanel } = useOmniLayout();
  const [notifications, setNotifications] = useState([]);
  
  // Use a ref to prevent the registration effect from running more than once
  const hasRegistered = useRef(false);

  // 1. STATIC REGISTRATION (Runs once on mount)
  useEffect(() => {
    if (hasRegistered.current) return;

    // Register the Main Editor
    registerPlugin({
      id: 'main-editor',
      name: 'Editor',
      position: 'center',
      component: <MonacoEditor />
    });

    // Register the Notifications Panel (The UI Container)
    registerPlugin({
      id: 'notifications-panel',
      name: 'Notifications',
      position: 'bottom',
      icon: '🔔',
      component: <NotificationList notifications={notifications} />
    });

    hasRegistered.current = true;
  }, [registerPlugin]); // registerPlugin is memoized in the layout hook

  // 2. DYNAMIC UPDATES (Updates the Status Bar text when count changes)
  useEffect(() => {
    registerStatusItem('notifications-trigger', {
      alignment: 'right',
      order: 1000,
      text: `🔔 ${notifications.length}`,
      onClick: () => togglePanel('notifications-panel')
    });
  }, [notifications.length, registerStatusItem, togglePanel]);

  const addNotification = useCallback((text) => {
    setNotifications(prev => [...prev, { id: Date.now(), text, timestamp: new Date() }]);
  }, []);

  return { notifications, addNotification };
};

// Sub-component to prevent the whole editor from re-rendering 
// just because a notification list changed.
const NotificationList = ({ notifications }) => (
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
);
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Styles
import 'modern-normalize';
import './index.css'; 

// Components & Logic
import { LayoutProvider, useOmniLayout } from './hooks/useOmniLayout';
import { OmniLayout } from './lib/Layout';

/**
 * Registry Component
 * This is where the magic happens. Any "plugin" or feature can register
 * itself here or in its own component.
 */
const DefaultPlugins = () => {
  const { registerPanel } = useOmniLayout();

  useEffect(() => {
    // Register the File Explorer (Left Sidebar)
    registerPanel('explorer', {
      title: 'Explorer',
      position: 'left',
      icon: '📁',
      component: (
        <div style={{ padding: '12px', color: '#888', fontSize: '13px' }}>
          PROJECT FILES
          <div style={{ marginTop: '10px', color: '#ccc' }}>↳ src/main.js</div>
        </div>
      )
    });

    // Register the Terminal (Bottom Panel)
    registerPanel('terminal', {
      title: 'Terminal',
      position: 'bottom',
      icon: '🐚',
      component: (
        <div style={{ 
          padding: '12px', 
          fontFamily: 'monospace', 
          backgroundColor: '#000', 
          height: '100%',
          color: '#0f0' 
        }}>
          user@omni:~$ _
        </div>
      )
    });

    // Example: A new "Settings" panel (Left Sidebar)
    registerPanel('settings', {
      title: 'Settings',
      position: 'left',
      icon: '⚙️',
      component: <div style={{ padding: 12 }}>Application Settings</div>
    });
  }, [registerPanel]);

  return null;
};

// Root Render
await createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="ob-dark-theme">
      <LayoutProvider>
        {/* Registering panels before the layout renders them */}
        <DefaultPlugins />
        
        <OmniLayout>
          {/* This is the "Children" slot in OmniLayout.
              Anything here goes into the main editor space.
          */}
          <div style={{ 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
          }}>
            <h1 style={{ margin: 0 }}>Main Editor Content</h1>
            <p style={{ opacity: 0.6 }}>
              The layout is now fully extensible. Try opening the console 
              and typing <code>window.omniLayout.togglePanel('explorer')</code>
            </p>
          </div>
        </OmniLayout>
      </LayoutProvider>
    </div>
  </StrictMode>
);
document.getElementById('splash-screen').remove();
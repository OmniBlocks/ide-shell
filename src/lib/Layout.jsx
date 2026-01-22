/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { DockviewReact } from 'dockview';
import { useOmniLayout } from '../hooks/useOmniLayout';
import 'dockview/dist/styles/dockview.css';
import { Global, css } from '@emotion/react';

const dockviewOverrides = css`
    /* Main Backgrounds */
    --dv-pane-border-color: var(--black-transparent);
    --dv-group-view-background-color: var(--shell-background);
    --dv-tabs-and-actions-container-background-color: var(--shell-background);
    
    /* Active Tab (The VS Code 'Selected' look) */
    --dv-activegroup-visiblepanel-tab-background-color: var(--white);
    --dv-activegroup-visiblepanel-tab-color: var(--page-foreground);
    
    /* Inactive Tabs */
    --dv-inactivegroup-visiblepanel-tab-background-color: var(--black-transparent);
    --dv-tab-background-color: transparent;
    --dv-tab-color: var(--page-foreground);
    
    /* Separators / Resizers */
    --dv-separator-border: var(--black-transparent);
    --dv-sash-hover-color: var(--accent-1);
    
    /* Drag & Drop Feedback */
    --dv-drag-over-background-color: rgba(var(--accent-1-rgb), 0.2);

  .dv-tab {
    font-size: 11px;
    padding: 0 16px !important;
    border-radius: 8px 8px 0 0; /* Rounded top corners like your original code */
    color: var(--page-foreground);
    margin-right: 4px;
    transition: all 0.2s ease;
  }

  .dv-tab:hover {
    opacity: 1;
    background: var(--black-transparent);
  }
`;

// --- Styled Layout ---

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #1e1e1e;
  color: #cccccc;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ActivityBar = styled.nav`
  width: 48px;
  background: #333333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 20px;
  border-right: 1px solid #252525;
`;

const StatusLine = styled.footer`
  height: 22px;
  background: var(--accent-1, #007acc);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 11px;
  color: white;
`;

// --- Dockview Component ---

export const OmniLayout = () => {
  const { panels, statusItems, togglePanel, isOpen, dockviewApiRef } = useOmniLayout();

  const onReady = (event) => {
    dockviewApiRef.current = event.api;
  };

  // Automatically add panels to Dockview when they are registered via plugins
  useEffect(() => {
    const api = dockviewApiRef.current;
    if (!api || panels.length === 0) return;

    panels.forEach(p => {
      if (!api.getPanel(p.id)) {
        api.addPanel({
          id: p.id,
          component: 'pluginRenderer',
          title: p.title,
          position: {
            direction: p.position === 'bottom' ? 'below' : 
                       p.position === 'left' ? 'left' : 'within'
          }
        });
      }
    });
  }, [panels]);

  return (
    <AppShell>
      <MainContent>
        <ActivityBar>
          {panels.filter(p => p.position === 'left').map(p => (
            <div 
              key={p.id} 
              onClick={() => togglePanel(p.id)}
              style={{ cursor: 'pointer', opacity: isOpen(p.id) ? 1 : 0.5, fontSize: '20px' }}
            >
              {p.icon}
            </div>
          ))}
        </ActivityBar>

        <div style={{ flex: 1, position: 'relative' }}>
          <DockviewReact
            onReady={onReady}
            css={dockviewOverrides}
            components={{
              pluginRenderer: (props) => {
                // This is the bridge: look up the React component by ID
                const plugin = panels.find(pl => pl.id === props.api.id);
                return plugin ? plugin.component : null;
              }
            }}
          />
        </div>
      </MainContent>

      <StatusLine>
        <div style={{ display: 'flex', gap: '12px' }}>
          {statusItems.filter(s => s.alignment === 'left').map(s => (
            <span key={s.id} onClick={s.onClick}>{s.text}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {statusItems.filter(s => s.alignment === 'right').map(s => (
            <span key={s.id} onClick={s.onClick}>{s.text}</span>
          ))}
        </div>
      </StatusLine>
    </AppShell>
  );
};
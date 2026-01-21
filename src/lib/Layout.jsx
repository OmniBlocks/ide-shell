/** @jsxImportSource @emotion/react */
import React from 'react';
import styled from '@emotion/styled';
import {Tabs} from 'radix-ui';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useOmniLayout } from '../hooks/useOmniLayout';

// --- Styled Components (Human Readable via label) ---

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #1e1e1e;
  color: #ccc;
  overflow: hidden;
  label: AppShell;
`;

const ActivityBar = styled.nav`
  width: 48px;
  background-color: #333;
  border-right: 1px solid #252525;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 20px;
  label: ActivityBar;
`;

const TabList = styled(Tabs.List)`
  display: flex;
  border-bottom: 1px solid rgba(0,0,0,0.3);
  background: #252526;
  height: 35px;
  label: TabList;
`;

const TabTrigger = styled(Tabs.Trigger)`
  padding: 0 15px;
  font-size: 11px;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  &[data-state='active'] {
    color: #fff;
    background: #1e1e1e;
    border-bottom: 2px solid var(--accent-1, #007acc);
  }
  &:hover { color: #fff; }
  label: TabTrigger;
`;

const StatusBar = styled.footer`
  height: 22px;
  background-color: var(--accent-3, #007acc);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 11px;
  user-select: none;
  label: StatusBar;
`;

const Resizer = styled(Separator)`
  background-color: #000;
  &[aria-orientation="horizontal"] { width: 2px; cursor: col-resize; }
  &[aria-orientation="vertical"] { height: 2px; cursor: row-resize; }
  &:hover { background-color: var(--accent-1, #007acc); }
  label: Resizer;
`;

// --- Helper: Tabbed Slot ---

const TabbedSlot = ({ panels, onToggle }) => {
  const [activeTab, setActiveTab] = React.useState(panels[0]?.id);

  // Keep activeTab in sync if panels change
  React.useEffect(() => {
    if (!panels.find(p => p.id === activeTab) && panels.length > 0) {
      setActiveTab(panels[0].id);
    }
  }, [panels, activeTab]);

  if (panels.length === 0) return null;

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TabList>
        {panels.map(p => (
          <TabTrigger key={p.id} value={p.id}>{p.title}</TabTrigger>
        ))}
        <div style={{ flex: 1 }} />
        {/* Closes only the currently visible tab */}
        <button 
          onClick={() => onToggle(activeTab)} 
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0 10px', fontSize: '14px' }}
          title="Close Panel"
        >
          ×
        </button>
      </TabList>
      {panels.map(p => (
        <Tabs.Content key={p.id} value={p.id} style={{ flex: 1, overflow: 'auto', background: '#1e1e1e' }}>
          {p.component}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

// --- Main Layout ---

export const OmniLayout = ({ children }) => {
  const { panels = {}, togglePanel, isOpen } = useOmniLayout();
  const allPanels = Object.values(panels);

  const leftActive = allPanels.find(p => p.position === 'left' && isOpen(p.id));
  const bottomPanels = allPanels.filter(p => p.position === 'bottom' && isOpen(p.id));

  return (
    <AppShell>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ActivityBar>
          {allPanels.map(p => (
            <div 
              key={p.id} 
              onClick={() => togglePanel(p.id)} 
              style={{ 
                cursor: 'pointer', 
                opacity: isOpen(p.id) ? 1 : 0.4, 
                fontSize: 20,
                transition: 'opacity 0.2s'
              }}
              title={p.title}
            >
              {p.icon}
            </div>
          ))}
        </ActivityBar>

        <Group orientation="horizontal">
          {leftActive && (
            <>
              <Panel collapsible defaultSize={300} minSize={10}>
                <div style={{ height: '35px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, background: '#252526', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
                  {leftActive.title}
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>{leftActive.component}</div>
              </Panel>
              <Resizer />
            </>
          )}

          <Panel>
            <Group orientation="vertical">
              <Panel defaultSize={75} style={{ overflow: 'hidden' }}>
                {children}
              </Panel>
              
              {bottomPanels.length > 0 && (
                <>
                  <Resizer />
                  <Panel collapsible defaultSize={25}>
                    <TabbedSlot panels={bottomPanels} onToggle={togglePanel} />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>
        </Group>
      </div>

      {/* NEW: Built-in Status Bar */}
      <StatusBar>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>Ready</span>
          <span>{leftActive ? `Viewing ${leftActive.title}` : 'No Sidebar'}</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>UTF-8</span>
          <span>JavaScript</span>
          <span style={{ cursor: 'pointer' }} onClick={() => window.omniLayout.togglePanel('terminal')}>
            {bottomPanels.length > 0 ? '▼ Hide Terminal' : '▲ Show Terminal'}
          </span>
        </div>
      </StatusBar>
    </AppShell>
  );
};
/** @jsxImportSource @emotion/react */
import React from 'react';
import styled from '@emotion/styled';
import { Tabs } from 'radix-ui';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useOmniLayout } from '../hooks/useOmniLayout';

// --- Styled Components (Themed via CSS Variables) ---

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--page-background, #1e1e1e);
  color: var(--page-foreground, #cccccc);
  overflow: hidden;
  label: AppShell;
`;

const ActivityBar = styled.nav`
  width: 48px;
  background-color: var(--activity-bar-bg, #333);
  border-right: 1px solid var(--border-color, #252525);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 15px;
  label: ActivityBar;
`;

const TabList = styled(Tabs.List)`
  display: flex;
  background: var(--tab-bar-bg, #252526);
  border-bottom: 1px solid rgba(0,0,0,0.3);
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
  transition: background 0.2s;
  &[data-state='active'] {
    color: #fff;
    background: var(--editor-bg, #1e1e1e);
    border-bottom: 1px solid var(--accent-1, #007acc);
  }
  &:hover { background: rgba(255,255,255,0.05); }
  label: TabTrigger;
`;

const StatusBar = styled.footer`
  height: 22px;
  background-color: var(--status-bar-bg, #007acc);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 11px;
  label: StatusBar;
`;

const Resizer = styled(Separator)`
  background-color: #000;
  &[aria-orientation="horizontal"] { cursor: col-resize; }
  &[aria-orientation="vertical"] { cursor: row-resize; }
  &:hover { background-color: var(--accent-1, #007acc); }
`;

// --- Slot Helpers ---

const TabbedSlot = ({ panels, activeId, onToggle, onSelect }) => {
  if (panels.length === 0) return null;
  return (
    <Tabs.Root value={activeId} onValueChange={onSelect} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TabList>
        {panels.map(p => (
          <TabTrigger key={p.id} value={p.id}>{p.title}</TabTrigger>
        ))}
        <div style={{ flex: 1 }} />
        <button 
          onClick={() => onToggle(activeId)} 
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0 10px', fontSize: '14px' }}
        >
          ×
        </button>
      </TabList>
      {panels.map(p => (
        <Tabs.Content key={p.id} value={p.id} style={{ flex: 1, overflow: 'auto', background: 'var(--editor-bg, #1e1e1e)' }}>
          {p.component}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

// --- Main Shell Logic ---

export const OmniLayout = () => {
  const { 
    panels = [], 
    statusItems = [], 
    togglePanel, 
    isOpen, 
    setSelected, 
    activeSelection 
  } = useOmniLayout();

  // Sort panels into UI buckets
  const sidebarPanels = panels.filter(p => p.position === 'left');
  const activeSidebar = sidebarPanels.find(p => isOpen(p.id));
  
  const bottomPanels = panels.filter(p => p.position === 'bottom' && isOpen(p.id));
  const centerPanels = panels.filter(p => p.position === 'center');

  return (
    <AppShell>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 1. Activity Bar (Icons for Sidebars) */}
        <ActivityBar>
          {sidebarPanels.map(p => (
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

        {/* 2. Main Resizable Layout Group */}
        <Group orientation="horizontal">
          
          {/* Sidebar Slot */}
          {activeSidebar && (
            <>
              <Panel collapsible defaultSize={20} minSize={10} style={{ display: 'flex', flexDirection: 'column', background: '#252526' }}>
                <div style={{ height: '35px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
                  {activeSidebar.title.toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>{activeSidebar.component}</div>
              </Panel>
              <Resizer />
            </>
          )}

          {/* Center + Bottom Slot */}
          <Panel>
            <Group orientation="vertical">
              
              {/* Main Center Area */}
              <Panel defaultSize={75} style={{ overflow: 'hidden' }}>
                <TabbedSlot 
                  panels={centerPanels} 
                  activeId={activeSelection?.center} 
                  onSelect={(id) => setSelected('center', id)}
                  onToggle={togglePanel}
                />
              </Panel>
              
              {/* Bottom Dock */}
              {bottomPanels.length > 0 && (
                <>
                  <Resizer />
                  <Panel collapsible defaultSize={25}>
                    <TabbedSlot 
                      panels={bottomPanels} 
                      activeId={activeSelection?.bottom || bottomPanels[0]?.id}
                      onSelect={(id) => setSelected('bottom', id)}
                      onToggle={togglePanel} 
                    />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>
        </Group>
      </div>

      {/* 3. Hackable Status Bar */}
      <StatusBar>
        <div style={{ display: 'flex', gap: '15px' }}>
          {statusItems.filter(i => i.alignment === 'left').map(item => (
            <span key={item.id} onClick={item.onClick} style={{ cursor: item.onClick ? 'pointer' : 'default' }}>
              {item.text}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {statusItems.filter(i => i.alignment === 'right').map(item => (
            <span key={item.id} onClick={item.onClick} style={{ cursor: item.onClick ? 'pointer' : 'default' }}>
              {item.text}
            </span>
          ))}
        </div>
      </StatusBar>
    </AppShell>
  );
};
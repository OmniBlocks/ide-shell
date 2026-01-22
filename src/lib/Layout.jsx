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
  background-color: var(--page-background);
  color: var(--page-foreground);
  overflow: hidden;
  label: AppShell;
`;

const ActivityBar = styled.nav`
  width: 48px;
  /* Slightly darker or same as background depending on theme */
  background-color: var(--page-background); 
  border-right: 1px solid var(--black-transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 15px;
  label: ActivityBar;
`;

const TabList = styled(Tabs.List)`
  display: flex;
  /* Uses the transparent black to slightly darken the tab row */
  background: var(--black-transparent); 
  border-bottom: 1px solid var(--black-transparent);
  height: 35px;
  label: TabList;
`;

const TabTrigger = styled(Tabs.Trigger)`
  padding: 0 15px;
  font-size: 11px;
  border: none;
  background: transparent;
  color: var(--page-foreground);
  opacity: 0.6;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &[data-state='active'] {
    opacity: 1;
    background: var(--page-background);
    border-bottom: 2px solid var(--accent-1);
  }
  
  &:hover { 
    background: var(--white-transparent); 
    opacity: 1;
  }
  label: TabTrigger;
`;

const StatusBar = styled.footer`
  height: 22px;
  /* Use accent color for the classic IDE status bar look */
  background-color: var(--accent-1);
  color: white; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 11px;
  label: StatusBar;
`;

const Resizer = styled(Separator)`
  background-color: var(--black-transparent);
  transition: background-color 0.2s;
  
  &[aria-orientation="horizontal"] { 
    width: 2px;
    cursor: col-resize; 
  }
  &[aria-orientation="vertical"] { 
    height: 2px;
    cursor: row-resize; 
  }
  
  &[data-resize-handle-active],
  &:hover { 
    background-color: var(--accent-1); 
  }
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
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--page-foreground)', 
            opacity: 0.5,
            cursor: 'pointer', 
            padding: '0 10px', 
            fontSize: '14px' 
          }}
        >
          ×
        </button>
      </TabList>
      {panels.map(p => (
        <Tabs.Content 
          key={p.id} 
          value={p.id} 
          style={{ flex: 1, overflow: 'auto', background: 'var(--page-background)' }}
        >
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

  const sidebarPanels = panels.filter(p => p.position === 'left');
  const activeSidebar = sidebarPanels.find(p => isOpen(p.id));
  
  const bottomPanels = panels.filter(p => p.position === 'bottom' && isOpen(p.id));
  const centerPanels = panels.filter(p => p.position === 'center');

  return (
    <AppShell>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 1. Activity Bar */}
        <ActivityBar>
          {sidebarPanels.map(p => (
            <div 
              key={p.id} 
              onClick={() => togglePanel(p.id)} 
              style={{ 
                cursor: 'pointer', 
                color: isOpen(p.id) ? 'var(--accent-1)' : 'var(--page-foreground)',
                opacity: isOpen(p.id) ? 1 : 0.4, 
                fontSize: 20,
                transition: 'all 0.2s'
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
              <Panel collapsible defaultSize={20} minSize={10} style={{ display: 'flex', flexDirection: 'column', background: 'var(--black-transparent)' }}>
                <div style={{ 
                  height: '35px', 
                  padding: '0 12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: 11, 
                  fontWeight: 700, 
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid var(--black-transparent)',
                  color: 'var(--page-foreground)',
                  opacity: 0.8
                }}>
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

      {/* 3. Status Bar */}
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
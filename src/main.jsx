import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'modern-normalize';
import './index.css'; 
import './globalstyles/colors.css'; 
import { LayoutProvider } from './hooks/useOmniLayout';
import { OmniLayout } from './lib/Layout';
import { CorePlugin } from './plugins/corePlugin';

// Root Render
const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <div className="ob-dark-theme">
      <LayoutProvider>
        <CorePlugin />
        <OmniLayout />
      </LayoutProvider>
    </div>
  </StrictMode>
);

// Cleanup
const splash = document.getElementById('splash-screen');
if (splash) splash.remove();
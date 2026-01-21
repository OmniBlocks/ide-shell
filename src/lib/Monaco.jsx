import React, { useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

/** * 1. LOCAL WORKER CONFIGURATION
 * This prevents Monaco from reaching out to CDNs for its language features.
 * Vite's "?worker" suffix treats these imports as separate entry points.
 */
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

/** * 2. DISABLE CDN LOADING
 * Point the @monaco-editor/react loader to our local monaco instance.
 */
loader.config({ monaco });

const MonacoEditor = ({ 
  language = 'javascript', 
  value = '', 
  onChange, 
  theme = 'omni-dark' 
}) => {
  const editorRef = useRef(null);

  const handleEditorWillMount = (monacoInstance) => {
    // Define the custom theme once before the component mounts
    monacoInstance.editor.defineTheme('omni-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#33333f',      // Your dark mode color
        'editorCursor.foreground': '#59c0c0', // Your spinner color
        'editor.lineHighlightBackground': '#3e3e4a',
        'editor.selectionBackground': '#59c0c033',
      },
    });
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Logic to hide the splash screen once the editor is visible
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 400);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={onChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          minimap: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorStyle: 'line',
          padding: { top: 10 }
        }}
      />
    </div>
  );
};

export default MonacoEditor;
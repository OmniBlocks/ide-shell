/** @jsxImportSource @emotion/react */
import React, { useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';

// --- Lazy Worker Configuration ---
// We define the environment, but we don't import monaco yet.
const configureMonacoEnvironment = () => {
  if (typeof self === 'undefined') return;

  self.MonacoEnvironment = {
    async getWorker(_, label) {
      let WorkerModule;
      switch (label) {
        case 'json':
          WorkerModule = await import('monaco-editor/esm/vs/language/json/json.worker?worker');
          break;
        case 'css':
        case 'scss':
        case 'less':
          WorkerModule = await import('monaco-editor/esm/vs/language/css/css.worker?worker');
          break;
        case 'html':
        case 'handlebars':
        case 'razor':
          WorkerModule = await import('monaco-editor/esm/vs/language/html/html.worker?worker');
          break;
        case 'typescript':
        case 'javascript':
          WorkerModule = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');
          break;
        default:
          WorkerModule = await import('monaco-editor/esm/vs/editor/editor.worker?worker');
      }
      return new WorkerModule.default();
    },
  };
};

const MonacoEditor = ({ 
  language = 'javascript', 
  value = '', 
  onChange, 
  theme = 'omni-dark' 
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialize the environment before the loader tries to use it
    configureMonacoEnvironment();

    // Dynamically import monaco-editor ONLY when this component mounts
    import('monaco-editor').then((monaco) => {
      loader.config({ monaco });
    });
  }, []);

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('omni-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editorCursor.foreground': '#007acc',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div style={{ height: '100%', width: '100%', background: '#1e1e1e' }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={onChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        loading={<div style={{ color: '#888', padding: '20px', fontSize: '12px' }}>Loading...</div>}
        options={{
          automaticLayout: true,
          fontSize: 13,
          fontFamily: "var(--font-mono, 'Fira Code', monospace)",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true, // Crucial for Tabbed layouts
          padding: { top: 8 }
        }}
      />
    </div>
  );
};

export default MonacoEditor;
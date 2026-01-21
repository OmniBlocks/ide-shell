/** @jsxImportSource @emotion/react */
import React, { useRef, useEffect, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

// --- Lazy Worker Configuration ---
const configureMonacoEnvironment = () => {
  if (typeof self === 'undefined' || self.MonacoEnvironment) return;

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initMonaco = async () => {
      // 1. Setup workers
      configureMonacoEnvironment();

      // 2. Actually download the library
      const monaco = await import('monaco-editor');

      // 3. Configure the loader with the downloaded instance
      loader.config({ monaco });

      // 4. Wait for the loader to initialize fully
      await loader.init();

      if (isMounted) {
        setIsReady(true);
      }
    };

    initMonaco();
    return () => { isMounted = false; };
  }, []);

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('omni-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#33333f', // OmniBlocks background
        'editorCursor.foreground': '#59c0c0',
        'editor.lineHighlightBackground': '#3e3e4a',
        'editor.selectionBackground': '#59c0c033',
      },
    });
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // We return the "Loading..." state manually until the JS is downloaded and initialized
  if (!isReady) {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%', 
        background: '#33333f', 
      }}>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', background: '#33333f' }}>
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
          fontSize: 13,
          fontFamily: "var(--font-mono, 'Fira Code', monospace)",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          padding: { top: 8 }
        }}
      />
    </div>
  );
};

export default MonacoEditor;
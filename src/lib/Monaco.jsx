/** @jsxImportSource @emotion/react */
import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import Editor from '@monaco-editor/react';

// --- Styled Components ---

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--white, #ffffff);
  color: var(--page-foreground, #000000);
  gap: 12px;
  z-index: 1000;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top: 2px solid var(--accent-1, #59c0c0);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// --- Monaco Component ---

const MonacoEditor = ({ language = 'text', value = '', onChange }) => {
  const monacoRef = useRef(null);
  
  // Helper to determine theme based on CSS class
  const getThemeName = () => 
    document.documentElement.classList.contains('ob-dark-theme') ? 'omni-dark' : 'omni-light';

  const [currentTheme, setCurrentTheme] = useState(getThemeName());

  // 1. Define themes BEFORE the editor mounts
  const handleBeforeMount = (monaco) => {
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent-1').trim() || '#59c0c0';
    const darkBg = style.getPropertyValue('--page-background').trim() || '#1e1e1e';

    monaco.editor.defineTheme('omni-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': darkBg,
        'editorCursor.foreground': accent,
        'editor.selectionBackground': `${accent}33`,
        'editor.lineHighlightBackground': '#ffffff08',
      },
    });

    monaco.editor.defineTheme('omni-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editorCursor.foreground': accent,
        'editor.selectionBackground': `${accent}33`,
      },
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = monaco;
  };

  // 2. Watch for theme changes on the <html> element
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getThemeName();
      setCurrentTheme(newTheme);
      if (monacoRef.current) {
        monacoRef.current.editor.setTheme(newTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <EditorContainer>      
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={currentTheme}
        onChange={onChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        loading={<LoadingOverlay><Spinner /></LoadingOverlay>}
        options={{
          automaticLayout: true,
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 10 },
          // Smoother font rendering
          fontFamily: 'var(--font-mono, "Fira Code", monospace)',
          fontLigatures: true,
        }}
      />
    </EditorContainer>
  );
};

export default MonacoEditor;
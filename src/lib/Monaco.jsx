/** @jsxImportSource @emotion/react */
import React, { useRef, useEffect, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

const MonacoEditor = ({ language = 'javascript', value = '', onChange }) => {
  const monacoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Helper to get current theme name based on HTML class
  const getThemeName = () => 
    document.documentElement.classList.contains('ob-dark-theme') ? 'omni-dark' : 'omni-light';

  useEffect(() => {
    let isMounted = true;

    const initMonaco = async () => {
      const monaco = await import('monaco-editor');
      loader.config({ monaco });
      const instance = await loader.init();

      if (isMounted) {
        const style = getComputedStyle(document.documentElement);
        const accent = style.getPropertyValue('--accent-1').trim() || '#59c0c0';

        // 1. Define Dark Theme
        instance.editor.defineTheme('omni-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#33333f', // Hardcoded fallbacks prevent empty flashes
            'editorCursor.foreground': accent,
            'editor.selectionBackground': `${accent}33`,
          },
        });

        // 2. Define Light Theme
        instance.editor.defineTheme('omni-light', {
          base: 'vs',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#e8e8e8',
            'editorCursor.foreground': accent,
            'editor.selectionBackground': `${accent}33`,
          },
        });

        monacoRef.current = instance;
        setIsReady(true);
      }
    };

    initMonaco();
    return () => { isMounted = false; };
  }, []);

  // 3. Observer: Only calls setTheme (Much lighter than defineTheme)
  useEffect(() => {
    if (!isReady || !monacoRef.current) return;

    const observer = new MutationObserver(() => {
      monacoRef.current.editor.setTheme(getThemeName());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Set initial theme
    monacoRef.current.editor.setTheme(getThemeName());

    return () => observer.disconnect();
  }, [isReady]);

  if (!isReady) return <div style={{ height: '100%', background: 'var(--page-background)' }} />;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={getThemeName()}
        onChange={onChange}
        options={{
          automaticLayout: true,
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
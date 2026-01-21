import React from 'react';
import { useCorePlugin } from '../hooks/useCorePlugin';

export const CorePlugin = () => {
  const { addNotification } = useCorePlugin();

  React.useEffect(() => {
    window.omniCore = { addNotification };
  }, [addNotification]);

  return null; 
};
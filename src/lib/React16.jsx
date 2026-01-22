// TODO: Delete this component when scratch-gui can be rendered directly in React 19.
// This is mainly a hack so we can render scratch-gui correctly without using an iframe which increases
// loading time.

import React, { useEffect, useRef } from 'react';
import React16 from 'react-16';
import ReactDOM16 from 'react-dom-16';

const React16Wrapper = ({props}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    ReactDOM16.render(
      React16.createElement(props.component, props),
      container
    );

    return () => {
      ReactDOM16.unmountComponentAtNode(container);
    };
  }, [props]);

  return <div ref={containerRef} />;
};

export default React16Wrapper;
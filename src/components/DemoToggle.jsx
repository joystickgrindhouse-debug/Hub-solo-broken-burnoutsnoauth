import React, { useState, useEffect } from 'react';

export default function DemoToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem('DEV_AUTH') === '1');
  }, []);

  function enable() {
    localStorage.setItem('DEV_AUTH', '1');
    setEnabled(true);
    alert('Demo auth enabled. Refresh the app root to see demo content.');
  }

  function disable() {
    localStorage.removeItem('DEV_AUTH');
    setEnabled(false);
    alert('Demo auth disabled. Refresh the app root.');
  }

  return (
    <div style={{position:'fixed',top:12,right:12,zIndex:9999}}>
      {enabled ? (
        <button onClick={disable} style={{background:'#e76f51',color:'#fff',padding:12,borderRadius:10,fontSize:15}}>Disable Demo</button>
      ) : (
        <button onClick={enable} style={{background:'#2a9d8f',color:'#fff',padding:12,borderRadius:10,fontSize:15}}>Enable Demo</button>
      )}
    </div>
  );
}

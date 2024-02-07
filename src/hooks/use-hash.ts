'use client';

import { useEffect, useState } from 'react';

function getLocationHash() {
  if (typeof window !== 'undefined') {
    return decodeURIComponent(window.location.hash.replace('#', ''))
  }

  return undefined
}
export function useHash() {
  const [hash, setHash] = useState(getLocationHash());

  useEffect(() => {
    function handleHashChange() {
      setHash(getLocationHash());
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return hash;
};
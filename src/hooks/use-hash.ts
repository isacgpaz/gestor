'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function getLocationHash() {
  if (typeof window !== 'undefined') {
    return decodeURIComponent(window.location.hash.replace('#', ''))
  }

  return undefined
}

export function useHash() {
  const params = useParams();

  const [hash, setHash] = useState(getLocationHash());

  useEffect(() => {
    setHash(getLocationHash());
  }, [params]);

  return hash;
};
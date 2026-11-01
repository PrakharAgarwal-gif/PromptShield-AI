'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useBackendStatus(pollInterval = 20000) {
  const [status, setStatus] = useState({
    isConnected: null,
    isReady: null,
    service: null,
    version: null,
    details: null,
    isLoading: true,
    lastChecked: null,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    try {
      const health = await api.health.check();
      let ready = null;
      try {
        ready = await api.health.ready();
      } catch (readyErr) {
        ready = { database: 'disconnected', details: readyErr.message };
      }

      setStatus({
        isConnected: true,
        isReady: ready?.database === 'connected',
        service: health.service || 'cloudops-sentinel-api',
        version: health.version || '0.1.0',
        details: ready?.details || null,
        isLoading: false,
        lastChecked: new Date(),
        error: null,
      });
    } catch (err) {
      setStatus({
        isConnected: false,
        isReady: false,
        service: null,
        version: null,
        details: null,
        isLoading: false,
        lastChecked: new Date(),
        error: err.message,
      });
    }
  }, []);

  useEffect(() => {
    checkStatus();
    if (pollInterval > 0) {
      const interval = setInterval(checkStatus, pollInterval);
      return () => clearInterval(interval);
    }
  }, [checkStatus, pollInterval]);

  return { ...status, refresh: checkStatus };
}


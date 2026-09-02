import { useState, useEffect } from 'react';
import { realtime } from '../services/websocket';

export const useRealtime = () => {
  const [lastMessage, setLastMessage] = useState(null);
  const [latestThreat, setLatestThreat] = useState(null);
  const [isConnected, setIsConnected] = useState(realtime.isConnected);

  useEffect(() => {
    realtime.connect();

    const unsubscribe = realtime.subscribe((msg) => {
      setLastMessage(msg);
      if (msg.type === 'WS_CONNECTED') {
        setIsConnected(true);
      } else if (msg.type === 'WS_DISCONNECTED') {
        setIsConnected(false);
      } else if (msg.type === 'THREAT_ALERT') {
        setLatestThreat(msg.data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { lastMessage, latestThreat, isConnected, clearLatestThreat: () => setLatestThreat(null) };
};

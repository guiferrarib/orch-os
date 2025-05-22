// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { useState, useRef, useEffect } from 'react';
import { ConnectionState, MicrophoneState } from '../../../context';
import styles from './WifiStatusConnection.module.css';
import DiagnosticsPanel from './DiagnosticsPanel';

interface WifiStatusConnectionProps {
  connectionState: ConnectionState;
  microphoneState: MicrophoneState;
  signalStrength?: 'strong' | 'medium' | 'weak' | 'none';
  onStatusClick?: () => void;
  showDetailedText?: boolean;
  className?: string;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

/**
 * Neural signal visualization component for connection state
 * Symbolic intent: Interface neuron for connectivity visualization
 */
const WifiStatusConnection: React.FC<WifiStatusConnectionProps> = ({ 
  connectionState, 
  microphoneState, 
  signalStrength = 'medium',
  onStatusClick,
  showDetailedText = false,
  className = '',
  onDisconnect,
  onReconnect
}) => {
  // Estado para controlar a visibilidade do painel de diagnósticos
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const diagnosticsPanelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  // Gerencia cliques fora do painel para fechá-lo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDiagnostics && 
        diagnosticsPanelRef.current && 
        !diagnosticsPanelRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowDiagnostics(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDiagnostics]);
  
  // Alterna a visibilidade do painel de diagnósticos
  const toggleDiagnosticsPanel = () => {
    setShowDiagnostics(prev => !prev);
  };

  // Determinar se o sistema está completamente conectado (Deepgram + microfone)
  const isFullyConnected = () => {
    return (
      connectionState === ConnectionState.OPEN && 
      (microphoneState === MicrophoneState.Open || microphoneState === MicrophoneState.Ready)
    );
  };

  // Determinar se há erros em qualquer subsistema
  const hasErrors = () => {
    return (
      connectionState === ConnectionState.ERROR || 
      microphoneState === MicrophoneState.Error
    );
  };

  // Determinar se está em processo de conexão
  const isConnecting = () => {
    return (
      connectionState === ConnectionState.CONNECTING ||
      microphoneState === MicrophoneState.Opening ||
      microphoneState === MicrophoneState.SettingUp
    );
  };

  // Convert connection state to user-friendly message
  const getConnectionStatusText = () => {
    if (isFullyConnected()) {
      return 'Fully Connected';
    } else if (hasErrors()) {
      return 'Connection Error';
    } else if (isConnecting()) {
      return 'Connecting...';
    } else if (connectionState === ConnectionState.OPEN) {
      return 'Deepgram Connected';
    } else if (microphoneState === MicrophoneState.Ready || microphoneState === MicrophoneState.Open) {
      return 'Microphone Ready';
    } else if (connectionState === ConnectionState.CLOSED || connectionState === ConnectionState.STOPPED) {
      return 'Disconnected';
    } else {
      return 'Unknown State';
    }
  };

  // Determine colors based on combined connection state
  const getConnectionColors = () => {
    if (isFullyConnected()) {
      // Ambos conectados - verde ciano
      return {
        primary: '#00faff',
        secondary: 'rgba(0, 250, 255, 0.8)',
        glow: 'rgba(0, 250, 255, 0.5)',
        textColor: 'text-green-400'
      };
    } else if (hasErrors()) {
      // Erros - vermelho
      return {
        primary: '#ff4455',
        secondary: 'rgba(255, 68, 85, 0.8)',
        glow: 'rgba(255, 68, 85, 0.5)',
        textColor: 'text-red-400'
      };
    } else if (isConnecting()) {
      // Conectando - amarelo
      return {
        primary: '#ffe066',
        secondary: 'rgba(255, 224, 102, 0.8)',
        glow: 'rgba(255, 224, 102, 0.5)',
        textColor: 'text-yellow-400'
      };
    } else if (connectionState === ConnectionState.OPEN || 
               microphoneState === MicrophoneState.Ready || 
               microphoneState === MicrophoneState.Open) {
      // Parcialmente conectado - ciano mais fraco
      return {
        primary: '#00c8d4',
        secondary: 'rgba(0, 200, 212, 0.8)',
        glow: 'rgba(0, 200, 212, 0.5)',
        textColor: 'text-cyan-400'
      };
    } else {
      // Desconectado ou estado desconhecido - cinza
      return {
        primary: '#888888',
        secondary: 'rgba(136, 136, 136, 0.8)',
        glow: 'rgba(136, 136, 136, 0.5)',
        textColor: 'text-gray-400'
      };
    }
  };

  // Get color variables for the component
  const colors = getConnectionColors();
  const statusText = getConnectionStatusText();

  // Determine which bars should be active based on connection status and signal strength
  const getSignalBars = () => {
    // Se ambos estiverem conectados, use a força do sinal fornecida
    if (isFullyConnected()) {
      switch (signalStrength) {
        case 'strong':
          return [true, true, true];
        case 'medium':
          return [true, true, false];
        case 'weak':
          return [true, false, false];
        default:
          return [true, true, true]; // Por padrão, mostra sinal forte quando conectado
      }
    } 
    // Se estiver conectando, mostra sinal médio
    else if (isConnecting()) {
      return [true, true, false];
    }
    // Se apenas um dos sistemas estiver conectado, mostra sinal fraco
    else if (connectionState === ConnectionState.OPEN || 
             microphoneState === MicrophoneState.Ready || 
             microphoneState === MicrophoneState.Open) {
      return [true, false, false];
    }
    // Se estiver desconectado ou com erro, não mostra sinal
    else {
      return [false, false, false];
    }
  };

  const signalBars = getSignalBars();

  // Generate dynamic classNames based on combined connection state
  const getConnectionStateClass = () => {
    if (isFullyConnected()) {
      return 'wifi-status-fully-connected';
    } else if (hasErrors()) {
      return 'wifi-status-error';
    } else if (isConnecting()) {
      return 'wifi-status-connecting';
    } else if (connectionState === ConnectionState.OPEN || 
               microphoneState === MicrophoneState.Ready || 
               microphoneState === MicrophoneState.Open) {
      return 'wifi-status-partially-connected';
    } else if (connectionState === ConnectionState.CLOSED || connectionState === ConnectionState.STOPPED) {
      return 'wifi-status-disconnected';
    } else {
      return 'wifi-status-unknown';
    }
  };

  // Add dynamic classes based on connection state
  const connectionStateClass = getConnectionStateClass();
  
  // Determine CSS classes for status text
  const getStatusTextClass = () => {
    switch (connectionState) {
      case ConnectionState.OPEN:
        return styles.statusConnected;
      case ConnectionState.CONNECTING:
        return styles.statusConnecting;
      case ConnectionState.CLOSED:
      case ConnectionState.ERROR:
      case ConnectionState.STOPPED:
        return styles.statusDisconnected;
      default:
        return styles.statusUnknown;
    }
  };

  return (
    <div 
      className={`${styles.wifiStatusConnection} ${connectionStateClass} ${className}`}
      title={statusText}
      ref={iconRef}
      onClick={toggleDiagnosticsPanel}
    >
      {/* Painel de diagnósticos flutuante */}
      {showDiagnostics && (
        <div 
          className={styles.diagnosticsPanelContainer} 
          ref={diagnosticsPanelRef}
          onClick={(e) => e.stopPropagation()}
        >
          <DiagnosticsPanel 
            connectionState={connectionState} 
            microphoneState={microphoneState}
            onDisconnect={onDisconnect}
            onReconnect={onReconnect}
          />
        </div>
      )}
      <div className={styles.wifiIconContainer}>
        {/* WiFi icon with neural aesthetic for Orch-OS */}
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={styles.neuralSignalIcon}>
          {/* Outer ring with neural aesthetic */}
          <circle 
            cx="13" 
            cy="13" 
            r="11" 
            className={`${styles.neuralRing} ${isFullyConnected() ? styles.neuralRingActive : ''}`} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeOpacity={isFullyConnected() ? "1" : isConnecting() ? "0.8" : "0.6"}
            fill="transparent"
          />
          
          {/* WiFi signal wave - upper arc - always visible but with varied opacity */}
          <path 
            d="M6.5 13 A9 9 0 0 1 19.5 13" 
            className={styles.neuralWave} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            strokeOpacity={signalBars[0] ? "1" : "0.25"}
          />
          
          {/* WiFi signal wave - lower arc - always visible but with varied opacity */}
          <path 
            d="M9 16.5 A6 6 0 0 1 17 16.5" 
            className={styles.neuralWave} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            strokeOpacity={signalBars[1] ? "1" : "0.25"}
          />
          
          {/* Central signal point - always visible but with varied opacity */}
          <circle 
            cx="13" 
            cy="19.5" 
            r="1.8" 
            className={`${styles.neuralCore} ${isFullyConnected() ? styles.neuralCoreActive : ''}`} 
            fill="currentColor" 
            fillOpacity={signalBars[2] ? "1" : "0.25"}
          />
        </svg>
      </div>
      
      {showDetailedText && (
        <span className={`${styles.statusText} ${getStatusTextClass()}`}>
          {statusText}
        </span>
      )}
    </div>
  );
};

export default WifiStatusConnection;

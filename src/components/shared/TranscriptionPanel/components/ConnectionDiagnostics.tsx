// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { ConnectionDiagnosticsProps } from '../types/interfaces';

const ConnectionDiagnostics: React.FC<ConnectionDiagnosticsProps> = ({
  connectionDetails,
  setConnectionDetails,
  getConnectionStatus,
  showToast,
  disconnectFromDeepgram,
  connectToDeepgram,
  waitForConnectionState,
  hasActiveConnection,
  ConnectionState
}) => {
  const checkConnectionStatus = () => {
    if (getConnectionStatus) {
      const status = getConnectionStatus();
      setConnectionDetails(status);

      if (status.active) {
        showToast("Diagnostics", "Connection is active and ready to use", "success");
      } else if (status.hasConnectionObject && status.readyState !== 1) {
        showToast("Diagnostics", `Connection exists but ReadyState = ${status.readyState} (expected: 1)`, "error");
      } else if (!status.hasConnectionObject && status.stateRef === 'OPEN') {
        showToast("Diagnostics", "State inconsistent: marked as OPEN but connection is null", "error");
      } else {
        showToast("Diagnostics", `Connection is not active (${status.stateRef})`, "error");
      }
    }
  };

  const forceReconnect = async () => {
    try {
      disconnectFromDeepgram();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await connectToDeepgram();
      const connected = await waitForConnectionState(ConnectionState.OPEN, 5000);
      if (connected && hasActiveConnection()) {
        showToast("Diagnostics", "Reconnection successful", "success");
      } else {
        showToast("Diagnostics", "Reconnection failed", "error");
      }
    } catch (error) {
      console.error("Error forcing reconnection:", error);
      showToast("Diagnostics", "Error forcing reconnection", "error");
    }
  };

  return (
    <div className="mt-4 p-3 bg-gray-800 rounded-md text-xs">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">Connection Diagnostics</div>
        <button
          onClick={checkConnectionStatus}
          className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
        >
          Check Now
        </button>
      </div>
      {(connectionDetails && typeof connectionDetails === "object" && connectionDetails !== null && "state" in connectionDetails) ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-x-2">
            <div>Current state:</div>
            <div className={
              typeof connectionDetails.state === 'string' && connectionDetails.state === 'OPEN' ? 'text-green-400' :
                typeof connectionDetails.state === 'string' && connectionDetails.state === 'CONNECTING' ? 'text-yellow-400' :
                  'text-red-400'
            }>
              {typeof connectionDetails.state === 'string' ? connectionDetails.state : ''}
            </div>
            <div>State (ref):</div>
            <div className={
              typeof connectionDetails.stateRef === 'string' && connectionDetails.stateRef === 'OPEN' ? 'text-green-400' :
                typeof connectionDetails.stateRef === 'string' && connectionDetails.stateRef === 'CONNECTING' ? 'text-yellow-400' :
                  'text-red-400'
            }>
              {typeof connectionDetails.stateRef === 'string' ? connectionDetails.stateRef : ''}
            </div>
            <div>Connection object:</div>
            <div className={connectionDetails.hasConnectionObject ? 'text-green-400' : 'text-red-400'}>
              {connectionDetails.hasConnectionObject ? 'Available' : 'Not available'}
            </div>
            <div>WebSocket ReadyState:</div>
            <div className={
              connectionDetails.readyState === 1 ? 'text-green-400' :
                connectionDetails.readyState === 0 ? 'text-yellow-400' :
                  'text-red-400'
            }>
              {connectionDetails.readyState === null ? 'N/A' :
                connectionDetails.readyState === 0 ? '0 (CONNECTING)' :
                  connectionDetails.readyState === 1 ? '1 (OPEN)' :
                    connectionDetails.readyState === 2 ? '2 (CLOSING)' :
                      connectionDetails.readyState === 3 ? '3 (CLOSED)' : 'Unknown'}
            </div>
            <div>Connection active:</div>
            <div className={connectionDetails.active ? 'text-green-400' : 'text-red-400'}>
              {connectionDetails.active ? 'Yes ✅' : 'No ❌'}
            </div>
          </div>
          <div className="pt-2 flex space-x-2">
            <button
              onClick={disconnectFromDeepgram}
              className="flex-1 bg-red-700 p-2 rounded hover:bg-red-800"
            >
              Disconnect
            </button>
            <button
              onClick={forceReconnect}
              className="flex-1 bg-green-700 p-2 rounded hover:bg-green-800"
            >
              Force Reconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">Click on &quot;Check Now&quot; to view connection details</div>
      )}
    </div>
  );
};

export default ConnectionDiagnostics;

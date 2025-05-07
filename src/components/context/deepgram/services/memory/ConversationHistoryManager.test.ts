// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { ConversationHistoryManager } from './ConversationHistoryManager';
import { Message } from '../../interfaces/transcription/TranscriptionTypes';

describe('ConversationHistoryManager', () => {
  const systemMessage: Message = {
    role: 'developer',
    content: 'Bem-vindo!'
  };

  it('should initialize with system message', () => {
    const manager = new ConversationHistoryManager(systemMessage);
    expect(manager.getHistory()).toEqual([systemMessage]);
  });

  it('should add messages and prune history when exceeding maxInteractions', () => {
    const manager = new ConversationHistoryManager(systemMessage);
    manager.setMaxInteractions(2);
    for (let i = 0; i < 10; i++) {
      manager.addMessage({ role: 'user', content: `Mensagem ${i}` });
    }
    const history = manager.getHistory();
    // Deve conter apenas o systemMessage + 4 mensagens (2*2)
    expect(history.length).toBe(5);
    expect(history[0]).toEqual(systemMessage);
    expect(history[1].content).toBe('Mensagem 6');
    expect(history[4].content).toBe('Mensagem 9');
  });
});

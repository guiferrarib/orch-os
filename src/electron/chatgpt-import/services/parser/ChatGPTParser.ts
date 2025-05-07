// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { ProcessedMessage, ChatGPTSession, ChatGPTMessageItem } from '../../interfaces/types';
import { ProgressReporter } from '../../utils/progressReporter';
import { Logger } from '../../utils/logging';

/**
 * Service responsible for parsing and converting ChatGPT files
 */
export class ChatGPTParser {
  private progressReporter: ProgressReporter;
  private logger: Logger;

  constructor(progressReporter: ProgressReporter, logger?: Logger) {
    this.progressReporter = progressReporter;
    this.logger = logger || new Logger('[ChatGPTParser]');
  }

  /**
   * Converts the raw buffer of the ChatGPT file to JSON
   */
  public parseBuffer(buffer: Buffer | ArrayBuffer | ArrayBufferView): ChatGPTSession[] {
    if (!buffer) throw new Error('No file provided');
    
    // LOG: Type of buffer received
    this.logger.debug(`Type of fileBuffer: ${buffer.constructor.name}`);
    
    // Ensure buffer is a Buffer
    let processedBuffer: Buffer;
    if (buffer instanceof Buffer) {
      processedBuffer = buffer;
    } else if (buffer instanceof ArrayBuffer) {
      processedBuffer = Buffer.from(new Uint8Array(buffer));
    } else if (ArrayBuffer.isView(buffer)) {
      processedBuffer = Buffer.from(new Uint8Array(buffer.buffer));
    } else {
      throw new Error('File type not supported for import');
    }
    
    // LOG: First bytes of the buffer for debug
    this.logger.debug(`First bytes of the buffer: ${processedBuffer.toString().substring(0, 20)}`);
    
    try {
      // Parse JSON
      const jsonString = processedBuffer.toString('utf-8');
      this.logger.debug(`JSON string length: ${jsonString.length} characters`);
      if (jsonString.length === 0) {
        throw new Error('Empty or invalid file');
      }
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.error('Error converting buffer to JSON', error);
      throw new Error('Invalid or corrupted file: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Extracts messages from ChatGPT data
   */
  public extractMessages(sessions: ChatGPTSession[]): ProcessedMessage[] {
    const allMessages: ProcessedMessage[] = [];
    
    // Calculate total messages for progress report
    const totalMessages = sessions.reduce((acc: number, session: ChatGPTSession) => {
      return acc + Object.values(session.mapping || {}).length;
    }, 0);
    
    // Start progress report
    this.progressReporter.startStage('parsing', totalMessages);
    this.logger.info(`Starting extraction of ${totalMessages} messages...`);
    
    let messagesProcessed = 0;
    
    // Process each session and extract messages
    for (const session of sessions) {
      if (session.mapping) {
        for (const item of Object.values(session.mapping) as ChatGPTMessageItem[]) {
          messagesProcessed++;
          
          // Update progress every 10 messages
          if (messagesProcessed % 10 === 0) {
            this.progressReporter.updateProgress('parsing', messagesProcessed, totalMessages);
          }
          
          const msg = item.message;
          if (!msg) continue;
          
          const role = msg.author?.role || 'unknown';
          const content = Array.isArray(msg.content?.parts) ? msg.content.parts[0] : msg.content?.parts;
          
          if (!content || typeof content !== 'string' || !content.trim()) continue;
          
          allMessages.push({
            role,
            content: content.trim(),
            timestamp: msg.create_time || null,
            id: msg.id || null,
            parent: msg.parent || null,
            session_title: session.title || null,
            session_create_time: session.create_time || null,
            session_update_time: session.update_time || null
          });
        }
      }
    }
    
    // Finish progress report
    this.progressReporter.completeStage('parsing', totalMessages);
    this.logger.info(`Extracted ${allMessages.length} valid messages from ${totalMessages} items`);
    
    return allMessages;
  }

  /**
   * Generates IDs for messages that do not have them
   */
  public ensureMessageIds(messages: ProcessedMessage[]): ProcessedMessage[] {
    const messagesWithoutIds = messages.filter((m: ProcessedMessage) => !m.id).length;
    
    if (messagesWithoutIds > 0) {
      this.logger.warn(`${messagesWithoutIds} messages do not have IDs. Generating IDs for them...`);
      
      return messages.map((msg: ProcessedMessage) => {
        if (!msg.id) {
          // Generate an ID based on content and timestamp
          const timestamp = Date.now();
          const contentSlice = msg.content.substring(0, 10).replace(/\s+/g, '_');
          const newId = `gen_msg_${timestamp}_${contentSlice}`;
          this.logger.debug(`Generated ID for message: ${newId}`);
          return { ...msg, id: newId };
        }
        return msg;
      });
    }
    
    return messages;
  }
}

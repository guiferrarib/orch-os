// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { TranscriptionStorageService } from "../components/context/deepgram/services/transcription/TranscriptionStorageService";
import { ISpeakerIdentificationService } from "../components/context/deepgram/interfaces/utils/ISpeakerIdentificationService";
import { UIUpdater } from "../components/context/deepgram/interfaces/transcription/TranscriptionTypes";

// Mock do serviço de identificação de falantes
class MockSpeakerService implements ISpeakerIdentificationService {
  splitMixedTranscription(text: string) {
    return [{ speaker: "Guilherme", text }];
  }
  
  getPrimaryUserSpeaker(): string {
    return "Guilherme";
  }
  
  filterTranscriptionsBySpeaker(
    speaker: string,
    transcriptions: Array<{ speaker: string; text: string; timestamp: string }>
  ) {
    return transcriptions.filter(t => t.speaker === speaker);
  }
}

// Function to test transcription storage
function testTranscriptionStorage() {
  console.log("🧪 STORAGE SERVICE TEST");
  console.log("==============================================");
  
  // Object to store the UI state
  let uiState = { transcription: "" };
  
  // Callback to update the UI state
  const setTexts = (updater: UIUpdater) => {
    if (typeof updater === 'function') {
      uiState = updater(uiState);
    } else {
      uiState = { ...uiState, ...updater };
    }
    console.log(`📊 UI atualizada: "${uiState.transcription}"`);
  };
  
  // Instantiate the storage service
  const speakerService = new MockSpeakerService();
  const storageService = new TranscriptionStorageService(speakerService, setTexts);
  
  // First message: "Hello"
  console.log("\n🔄 TEST 1: Sending simple message");
  const message1 = "Hello";
  storageService.updateTranscriptionUI(message1);
  console.log(`✅ After first message: "${uiState.transcription}"`);
  
  // Second incremental message: "Hello, How are you ?"
  console.log("\n🔄 TEST 2: Sending incremental message");
  const message2 = "Hello, How are you ?";
  storageService.updateTranscriptionUI(message2);
  console.log(`✅ After second message: "${uiState.transcription}"`);
  
  // Third incremental message: "Hello, How are you ? I'm good!"
  console.log("\n🔄 TEST 3: Sending third incremental message");
  const message3 = "Hello, How are you ? I'm good!";
  storageService.updateTranscriptionUI(message3);
  console.log(`✅ After third message: "${uiState.transcription}"`);
  
  // Verifying the text available for the prompt
  console.log("\n🔍 VERIFYING TEXT AVAILABLE FOR PROMPT");
  const promptText = storageService.getUITranscriptionText();
  console.log(`📜 Text for prompt: "${promptText}"`);
  
  // Expected vs. actual result
  const expected = message3;
  const isSuccess = promptText === expected || promptText.endsWith(expected);
  
  console.log("\n==============================================");
  console.log(`🏁 TEST RESULT: ${isSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`);
  
  if (!isSuccess) {
    console.log(`❌ Expected: "${expected}"`);
    console.log(`❌ Obtained: "${promptText}"`);
  } else {
    console.log(`✅ Final text correct: "${promptText}"`);
  }
}

// Execute the test
testTranscriptionStorage();

export {};

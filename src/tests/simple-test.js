// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Guilherme Ferrari Brescia

let uiTranscriptionList = [];

function updateUI(newTranscription) {
  console.log(`\n📝 Received: "${newTranscription}"`);
  
  if (!uiTranscriptionList) uiTranscriptionList = [];
  
  const incomingLines = newTranscription.split('\n')
    .map(l => l.trim())
    .filter(Boolean);
    
  if (incomingLines.length > 0) {
    const lastHistoryLine = uiTranscriptionList[uiTranscriptionList.length - 1];
    const lastIncomingLine = incomingLines[incomingLines.length - 1];
    
    if (incomingLines.length > 1 || lastIncomingLine !== lastHistoryLine) {
      const newLines = incomingLines.filter((line, i, arr) => 
        i === 0 || line !== arr[i-1]
      );
      
      if (newLines.length > 0 && 
          (uiTranscriptionList.length === 0 || 
          newLines[0] !== uiTranscriptionList[uiTranscriptionList.length - 1])) {
      if (newLines.length > 0 && 
          (uiTranscriptionList.length === 0 || 
          newLines[0] !== uiTranscriptionList[uiTranscriptionList.length - 1])) {
        console.log(`✅ Adding ${newLines.length} new line(s) to list`);
        for (const line of newLines) {
          console.log(`  • "${line}"`);
        }
        uiTranscriptionList.push(...newLines);
      } else {
        console.log(`⚠️ No new lines to add to list`);
      }
    } else {
      console.log(`⚠️ Duplicate of last entry, ignoring...`);
    }
  } else {
    console.log(`⚠️ No lines detected in received text`);
  }
  
  const fullText = uiTranscriptionList.join('\n');
  console.log(`📄 Current state: ${uiTranscriptionList.length} line(s), content:`);
  if (uiTranscriptionList.length > 0) {
    uiTranscriptionList.forEach((line, i) => {
      console.log(`  ${i+1}. "${line}"`);
    });
  } else {
    console.log(`  (vazio)`);
  }
}

function runTest() {
  console.log("🧪 TEST INCREMENTAL PROCESSING");
  console.log("=====================================================");
  
  uiTranscriptionList = [];
  
  console.log("\n🔄 TEST 1: Sending simple message");
  updateUI("Ola");
  
  console.log("\n🔄 TEST 2: Sending incremental message");
  updateUI("Hello, How are you?");
  
  console.log("\n🔄 TEST 3: Sending third incremental message");
  updateUI("I'm good!");
  
  console.log("\n=====================================================");
  console.log("🏁 FINAL RESULT:");
  
  const finalText = uiTranscriptionList.join('\n');
  console.log(`📜 Final text for prompt: "${finalText}"`);
  
  const containsIncremental = finalText.includes("I'm good!");
  console.log(`📊 The final text contains the complete version? ${containsIncremental ? '✅ YES' : '❌ NO'}`);
  
  const linesWithoutDuplicates = [...new Set(uiTranscriptionList)];
  const hasDuplicates = linesWithoutDuplicates.length < uiTranscriptionList.length;
  console.log(`📊 The text contains duplicates? ${hasDuplicates ? '❌ YES' : '✅ NO'}`);
}

runTest();

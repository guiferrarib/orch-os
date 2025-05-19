# Orch-OS Project Structure (2025-05-19)

## Key Services, Modules, and Responsibilities

### DeepgramTranscriptionService.ts
- Orchestrates transcription, neural signal extraction, memory, OpenAI integration, speaker identification, UI updates, and symbolic cognition logging.
- Symbolic intent: "neural-symbolic core orchestrator".
- Architecture: Mixes orchestration and domain logic in infrastructure. Violates Clean Architecture.

### NeuralSignalExtractor.ts
- Extracts symbolic neural signals from transcription context.
- Symbolic intent: "Neuron-level signal extraction".
- Architecture: Should be in domain/core, but is in infrastructure.

### MemoryService.ts & PineconeMemoryService.ts
- Handle memory storage, retrieval, and vector DB integration.
- Symbolic intent: Memory cortex/neurons.
- Architecture: Logic is infrastructure-bound; should be abstracted to domain layer.

### chatgpt-import/interfaces/types.ts
- Type definitions for ChatGPT import features.
- Symbolic intent: Defines symbolic structure for imported data.
- Architecture: Proper separation as types/interfaces.

### TranscriptionModule.tsx
- React component for transcription UI, manages microphone state and Deepgram connection.
- Symbolic intent: Interface cortex — bridges neural input with user interface.
- Architecture: UI layer, proper separation.

### lib/utils.ts
- Utility function for merging Tailwind/clsx class names.
- Symbolic intent: Pure utility neuron.
- Architecture: Properly isolated.

---

## Architectural Notes & Violations
- Domain logic (neural/symbolic core, memory, signal extraction) is implemented in infrastructure/components, not in domain/core or domain/interfaces.
- src/domain/core and src/domain/interfaces are empty — major violation per Clean Architecture and Orch-OS thesis.
- Orchestration and cognitive logic are mixed in infrastructure services.
- Utilities and types are properly separated.
- UI logic is correctly isolated in the interface layer.

## Missing Abstractions
- Domain interfaces for memory, neural signal extraction, and core orchestration.
- Core logic for cognitive cores (MemoryCore, ValenceCore, MetacognitiveCore, etc.) in the domain layer.

---

This map should be updated whenever new domain abstractions or cognitive cores are implemented.

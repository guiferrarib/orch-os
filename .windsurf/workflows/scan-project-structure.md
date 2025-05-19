---
description: Este workflow escaneia toda a árvore de arquivos `.ts/.tsx` do projeto, extrai definições de classe e função, e grava no core de memória `orch.project.structure`.
---

{
  "name": "orchos-project-structure-scan",
  "type": "workflow",
  "description": "Scan all .ts and .tsx files in the Orch-OS project, extract all classes, functions, responsibilities, and architectural relationships. Store this map in internal memory (knowledge base) and as Markdown file for future reference.",
  "steps": [
    {
      "type": "file_search",
      "pattern": "**/*.{ts,tsx}",
      "recursive": true
    },
    {
      "type": "extract_structure",
      "targets": [
        "class_definitions",
        "function_definitions",
        "exports",
        "imports",
        "dependencies"
      ]
    },
    {
      "type": "summarize_responsibilities",
      "strategy": "symbolic-intent",
      "include_notes_on": [
        "architecture",
        "clean_architecture_violations",
        "possible_reuse",
        "missing_abstractions"
      ]
    },
    {
      "type": "store_in_memory",
      "core": "orch.project.structure",
      "label": "full-map",
      "note": "This should become Windsurf's canonical memory for project structure, reused in all future prompts and implementations."
    },
    {
      "type": "generate_markdown",
      "path": "knowledge/orchos_project_map.md",
      "content": "{{structure_map}}"
    }
  ]
}
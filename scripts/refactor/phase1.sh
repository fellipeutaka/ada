#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-src}"
OUT_DIR=".audit/phase1"
SKILLS_DIR=".claude/skills"
mkdir -p "$OUT_DIR"

MAX_PARALLEL=6

# ---------------------------------------------------------------------------
# Carrega o conteúdo de uma skill pelo nome (ex: "clean-code")
# ---------------------------------------------------------------------------
load_skill() {
  local name="$1"
  local path="$SKILLS_DIR/$name"

  for ext in "" ".md" ".txt"; do
    if [[ -f "$path$ext" ]]; then
      cat "$path$ext"
      return
    fi
  done

  echo "(skill '$name' not found at $path)"
}

# ---------------------------------------------------------------------------
# Monta o prompt para um arquivo individual
# ---------------------------------------------------------------------------
build_phase1_prompt() {
  local file_path="$1"
  local content="$2"
  local skill_clean_code="$3"
  local skill_react="$4"
  local skill_patterns="$5"

  cat <<EOF
You are a senior staff engineer doing a deep code audit.

Apply the following skills where relevant:

<skill name="clean-code">
$skill_clean_code
</skill>

<skill name="react-best-practices">
$skill_react
</skill>

<skill name="design-patterns">
$skill_patterns
</skill>

<context>
FILE_PATH: $file_path
</context>

<code>
$content
</code>

Rules:
- Apply react-best-practices ONLY if this is a React file (returns JSX, defines a React component, or uses React hooks including custom hooks)
- Apply design-patterns ONLY if there is structural logic worth abstracting
- Do NOT suggest patterns without concrete justification
- Reject superficial suggestions

Return ONLY valid JSON, no markdown, no preamble:

{
  "summary": "",
  "responsibilities": [],
  "issues": [
    {
      "type": "",
      "severity": "",
      "description": "",
      "evidence": "",
      "skill_used": "clean-code | react-best-practices | design-patterns"
    }
  ],
  "patterns_detected": [],
  "patterns_missing": [],
  "coupling": { "level": "", "details": "" },
  "cohesion": { "level": "", "reason": "" },
  "refactor_suggestions": [
    {
      "title": "",
      "impact": "",
      "effort": "",
      "description": "",
      "skill_used": ""
    }
  ]
}
EOF
}

# ---------------------------------------------------------------------------
# Processa um único arquivo (executado em background via xargs -P)
# ---------------------------------------------------------------------------
process_file() {
  local file="$1"
  local out_dir="$2"
  local skills_dir="$3"

  local content
  content=$(cat "$file")

  local skill_clean_code skill_react skill_patterns
  skill_clean_code=$(
    for ext in "" ".md" ".txt"; do
      [[ -f "$skills_dir/clean-code$ext" ]] && cat "$skills_dir/clean-code$ext" && break
    done || echo "(skill 'clean-code' not found)"
  )
  skill_react=$(
    for ext in "" ".md" ".txt"; do
      [[ -f "$skills_dir/react-best-practices$ext" ]] && cat "$skills_dir/react-best-practices$ext" && break
    done || echo "(skill 'react-best-practices' not found)"
  )
  skill_patterns=$(
    for ext in "" ".md" ".txt"; do
      [[ -f "$skills_dir/design-patterns$ext" ]] && cat "$skills_dir/design-patterns$ext" && break
    done || echo "(skill 'design-patterns' not found)"
  )

  local prompt
  prompt=$(build_phase1_prompt "$file" "$content" "$skill_clean_code" "$skill_react" "$skill_patterns")

  # Hash do caminho para nome de arquivo único
  local filename
  filename=$(printf '%s' "$file" | sha256sum | cut -d' ' -f1)

  local result
  result=$(claude --print "$prompt" 2>/dev/null) || result="{}"

  # Remove markdown fence se o Claude retornou ```json ... ```
  result=$(echo "$result" | sed 's/^```[a-z]*$//' | sed 's/^```$//')

  # Valida e salva JSON; em caso de falha salva um envelope de erro
  if echo "$result" | jq . > "$out_dir/$filename.json" 2>/dev/null; then
    # Injeta o file_path no JSON para rastreabilidade na phase2
    local tmp
    tmp=$(jq --arg fp "$file" '. + {file_path: $fp}' "$out_dir/$filename.json")
    echo "$tmp" > "$out_dir/$filename.json"
  else
    printf '{"file_path": "%s", "error": "invalid json from claude"}' "$file" \
      > "$out_dir/$filename.json"
  fi
}

export -f process_file build_phase1_prompt

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo "== Phase 1 =="

# Pré-carrega skills uma vez para não ler do disco N vezes
SKILL_CLEAN_CODE=$(load_skill "clean-code")
SKILL_REACT=$(load_skill "react-best-practices")
SKILL_PATTERNS=$(load_skill "design-patterns")

export SKILL_CLEAN_CODE SKILL_REACT SKILL_PATTERNS

find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 \
  | xargs -0 -P "$MAX_PARALLEL" -I{} \
    bash -c 'process_file "$0" "$1" "$2"' {} "$OUT_DIR" "$SKILLS_DIR"

echo "Phase 1 done — $(ls "$OUT_DIR"/*.json 2>/dev/null | wc -l) files processed"

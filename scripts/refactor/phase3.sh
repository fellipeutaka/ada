#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-src}"
OUT_DIR=".audit/final"
PHASE2_DIR=".audit/phase2"
SKILLS_DIR=".claude/skills"

mkdir -p "$OUT_DIR"

# ---------------------------------------------------------------------------
# Carrega skill pelo nome
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
# Monta o prompt de phase 3
# ---------------------------------------------------------------------------
build_phase3_prompt() {
  local tree="$1"
  local chunks="$2"
  local skill_clean_code="$3"
  local skill_react="$4"
  local skill_patterns="$5"

  cat <<EOF
You are a Staff+ engineer responsible for architecture.

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
PROJECT_STRUCTURE:
$tree

CHUNK_ANALYSIS (array of phase2 JSON objects, one per module chunk):
$chunks
</context>

Return ONLY valid JSON, no markdown, no preamble:

{
  "top_refactors": [],
  "architecture_problems": [],
  "target_architecture": {}
}
EOF
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
echo "== Phase 3 =="

# Usa `tree` se disponível; cai de volta para find ordenado
if command -v tree &>/dev/null; then
  tree_output=$(tree -L 4 --noreport "$TARGET_DIR")
else
  tree_output=$(find "$TARGET_DIR" | sort)
fi

# Agrega os JSONs da phase2 em um array; trata ausência de arquivos
chunk_outputs=$(
  shopt -s nullglob
  jsons=("$PHASE2_DIR"/*.json)
  if [[ ${#jsons[@]} -eq 0 ]]; then
    echo "[]"
  else
    jq -s '.' "${jsons[@]}"
  fi
)

skill_clean_code=$(load_skill "clean-code")
skill_react=$(load_skill "react-best-practices")
skill_patterns=$(load_skill "design-patterns")

prompt=$(build_phase3_prompt "$tree_output" "$chunk_outputs" \
  "$skill_clean_code" "$skill_react" "$skill_patterns")

result=$(claude --print "$prompt" 2>/dev/null) || result="{}"

result=$(echo "$result" | sed 's/^```[a-z]*$//' | sed 's/^```$//')

if echo "$result" | jq . > "$OUT_DIR/report.json" 2>/dev/null; then
  echo "Phase 3 done -> $OUT_DIR/report.json"
else
  printf '{"error": "invalid json from claude"}' > "$OUT_DIR/report.json"
  echo "WARN: Claude returned invalid JSON on phase 3"
  exit 1
fi

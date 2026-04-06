#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-src}"
PHASE1_DIR=".audit/phase1"
OUT_DIR=".audit/phase2"
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
# Monta o prompt de phase 2 para um chunk de módulos
# ---------------------------------------------------------------------------
build_phase2_prompt() {
  local files_content="$1"
  local analysis_content="$2"
  local skill_clean_code="$3"
  local skill_react="$4"
  local skill_patterns="$5"

  cat <<EOF
You are a principal engineer reviewing a module.

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
FILES:
$files_content

PREVIOUS_ANALYSIS (one JSON object per file, each tagged with file_path):
$analysis_content
</context>

Return ONLY valid JSON, no markdown, no preamble:

{
  "systemic_issues": [],
  "architecture_assessment": { "strengths": [], "weaknesses": [] },
  "duplication_clusters": [],
  "recommended_patterns": []
}
EOF
}

# ---------------------------------------------------------------------------
# Processa um chunk: recebe o nome e uma lista de caminhos (dirs ou arquivos)
# ---------------------------------------------------------------------------
process_chunk() {
  local name="$1"
  shift
  local paths=("$@")

  echo "== Phase 2: $name =="

  local files_content=""
  local missing_paths=()

  for p in "${paths[@]}"; do
    if [[ ! -e "$p" ]]; then
      missing_paths+=("$p")
      continue
    fi

    if [[ -d "$p" ]]; then
      while IFS= read -r -d '' f; do
        files_content+=$(printf '\n--- FILE: %s ---\n' "$f")
        files_content+=$(cat "$f")
        files_content+=$'\n'
      done < <(find "$p" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)
    elif [[ -f "$p" ]]; then
      files_content+=$(printf '\n--- FILE: %s ---\n' "$p")
      files_content+=$(cat "$p")
      files_content+=$'\n'
    fi
  done

  if [[ ${#missing_paths[@]} -gt 0 ]]; then
    echo "  WARN: paths not found — ${missing_paths[*]}"
  fi

  # Concatena análises da phase1; cada JSON já carrega file_path
  local analysis_content
  analysis_content=$(
    shopt -s nullglob
    jsons=("$PHASE1_DIR"/*.json)
    if [[ ${#jsons[@]} -eq 0 ]]; then
      echo "[]"
    else
      # Envolve em array para o LLM não receber um blob concatenado
      jq -s '.' "${jsons[@]}"
    fi
  )

  local skill_clean_code skill_react skill_patterns
  skill_clean_code=$(load_skill "clean-code")
  skill_react=$(load_skill "react-best-practices")
  skill_patterns=$(load_skill "design-patterns")

  local prompt
  prompt=$(build_phase2_prompt "$files_content" "$analysis_content" \
    "$skill_clean_code" "$skill_react" "$skill_patterns")

  local result
  result=$(claude --print "$prompt" 2>/dev/null) || result="{}"

  result=$(echo "$result" | sed 's/^```[a-z]*$//' | sed 's/^```$//')

  if echo "$result" | jq . > "$OUT_DIR/$name.json" 2>/dev/null; then
    echo "  -> $OUT_DIR/$name.json"
  else
    printf '{"chunk": "%s", "error": "invalid json from claude"}' "$name" \
      > "$OUT_DIR/$name.json"
    echo "  WARN: Claude returned invalid JSON for chunk '$name'"
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
process_chunk "components" "$TARGET_DIR/components"
process_chunk "logic"      "$TARGET_DIR/hooks" "$TARGET_DIR/core"
process_chunk "infra"      "$TARGET_DIR/lib"
process_chunk "root"       "$TARGET_DIR"

echo "Phase 2 done"

#!/bin/bash
# ─────────────────────────────────────────────────────────
# Record a flow with Playwright Codegen
# Saves the recorded test to tests/recorded/<name>.spec.ts
#
# Usage:
#   bash helpers/record-flow.sh login
#   bash helpers/record-flow.sh dashboard
#   bash helpers/record-flow.sh business-search
# ─────────────────────────────────────────────────────────

FLOW_NAME="${1:-recorded-flow}"
OUTPUT="tests/recorded/${FLOW_NAME}.spec.ts"
mkdir -p tests/recorded

echo "🎬  Recording flow: $FLOW_NAME"
echo "    Navigate the app, then close the browser."
echo "    Output → $OUTPUT"
echo ""

npx playwright codegen \
  --load-storage=playwright/.auth/user.json \
  --output="$OUTPUT" \
  https://test.bcregistry.gov.bc.ca/en-CA/

echo ""
echo "✅  Recorded to $OUTPUT"
echo "    Share that file here and Claude will clean it up into a proper test."

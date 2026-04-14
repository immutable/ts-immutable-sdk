#!/usr/bin/env bash
#
# Validate the pixel CDN bundle is deployed and within budget.
#
# Usage:
#   ./scripts/validate-cdn.sh [URL]
#
# Defaults to the production CDN URL if no argument is provided.

set -euo pipefail

CDN_URL="${1:-https://cdn.immutable.com/pixel/v1/imtbl.js}"
MAX_GZIP_BYTES=10240  # 10 KB — must match bundlebudget.json
WARN_GZIP_BYTES=8192  # 8 KB

PASS=0
FAIL=0

TMPFILE=$(mktemp)
TMPHEADERS=$(mktemp)
trap 'rm -f "$TMPFILE" "$TMPHEADERS"' EXIT

pass() { echo "  ✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }

echo "Validating pixel bundle: $CDN_URL"
echo ""

# --- Fetch the bundle (single request for body + headers) ---
HTTP_CODE=$(curl -s --connect-timeout 10 --max-time 30 -D "$TMPHEADERS" -o "$TMPFILE" -w '%{http_code}' "$CDN_URL")
CONTENT_TYPE=$(grep -i '^content-type:' "$TMPHEADERS" | tr -d '\r' | awk '{print $2}')

# --- HTTP status ---
echo "HTTP Response:"
if [ "$HTTP_CODE" = "200" ]; then
  pass "Status: $HTTP_CODE"
else
  fail "Status: $HTTP_CODE (expected 200)"
fi

# --- Content-Type ---
if echo "$CONTENT_TYPE" | grep -qi 'javascript'; then
  pass "Content-Type: $CONTENT_TYPE"
else
  fail "Content-Type: $CONTENT_TYPE (expected application/javascript)"
fi

# --- Bundle size ---
RAW_BYTES=$(wc -c < "$TMPFILE" | tr -d ' ')
GZIP_BYTES=$(gzip -c "$TMPFILE" | wc -c | tr -d ' ')

echo ""
echo "Bundle Size:"
echo "  Raw:    $RAW_BYTES bytes ($(awk -v b="$RAW_BYTES" 'BEGIN{printf "%.1f", b/1024}') KB)"
echo "  Gzip:   $GZIP_BYTES bytes ($(awk -v b="$GZIP_BYTES" 'BEGIN{printf "%.1f", b/1024}') KB)"

if [ "$GZIP_BYTES" -le "$MAX_GZIP_BYTES" ]; then
  if [ "$GZIP_BYTES" -le "$WARN_GZIP_BYTES" ]; then
    pass "Under budget ($GZIP_BYTES / $MAX_GZIP_BYTES bytes gzipped)"
  else
    pass "Under max budget but above warning threshold ($GZIP_BYTES / $WARN_GZIP_BYTES warn, $MAX_GZIP_BYTES max)"
  fi
else
  fail "Over budget! $GZIP_BYTES bytes gzipped exceeds $MAX_GZIP_BYTES limit"
fi

# --- Content markers ---
# These patterns are chosen to avoid false positives in minified code.
echo ""
echo "Content Checks:"
if grep -q '__imtbl' "$TMPFILE"; then
  pass "Contains __imtbl global"
else
  fail "Missing __imtbl global"
fi

if grep -q '"pixel"' "$TMPFILE" || grep -q "'pixel'" "$TMPFILE"; then
  pass "Contains 'pixel' surface string literal"
else
  fail "Missing 'pixel' surface string literal"
fi

if grep -q 'session_start' "$TMPFILE"; then
  pass "Contains session_start event"
else
  fail "Missing session_start event"
fi

if grep -q 'form_submitted' "$TMPFILE"; then
  pass "Contains form_submitted event"
else
  fail "Missing form_submitted event"
fi

# --- Summary ---
echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

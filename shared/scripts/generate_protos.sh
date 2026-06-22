#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROTO_DIR="${ROOT_DIR}/shared/protos"
PY_OUT="${ROOT_DIR}/shared/generated/python"
TS_OUT="${ROOT_DIR}/shared/generated/typescript"

mkdir -p "${PY_OUT}" "${TS_OUT}"

.venv/bin/python -m grpc_tools.protoc \
  -I "${PROTO_DIR}" \
  --python_out="${PY_OUT}" \
  "${PROTO_DIR}/event_envelope.proto" \
  "${PROTO_DIR}/domain_events.proto"

if command -v protoc >/dev/null 2>&1 && command -v protoc-gen-es >/dev/null 2>&1; then
  protoc \
    -I "${PROTO_DIR}" \
    --es_out="${TS_OUT}" \
    --es_opt=target=ts \
    "${PROTO_DIR}/event_envelope.proto" \
    "${PROTO_DIR}/domain_events.proto"
else
  printf 'Skipped TypeScript generation: protoc and protoc-gen-es are required.\n' >&2
fi


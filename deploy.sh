#!/bin/bash

set -euo pipefail

docker buildx build --platform linux/amd64,linux/arm64 -t jackratner/even-weaver --push .

ssh jack@pi4.jackratner.com "kubectl rollout restart deployment/even-weaver"

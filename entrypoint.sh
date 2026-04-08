#!/bin/sh
# Inject real runtime hostname into the app before nginx starts
cat > /usr/share/nginx/html/runtime-config.js << EOF
window.__RUNTIME_CONFIG__ = {
  hostname: "$(hostname)",
  env: "docker",
  platform: "$(uname -s 2>/dev/null || echo 'Linux') / $(uname -m 2>/dev/null || echo 'unknown')"
};
EOF
exec nginx -g 'daemon off;'

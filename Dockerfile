# Dependency-free Node server. Use a slim Node base.
FROM node:22-slim

WORKDIR /app
COPY server.js data.js data2.js maze.js ./
COPY public ./public

ENV PORT=8080
EXPOSE 8080

# Healthcheck hits /health (also wired in forge-config)
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]

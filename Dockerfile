# 使用輕量版的 Node.js 映像檔
FROM node:25-alpine

WORKDIR /app

# 暴露 3000 埠口
EXPOSE 3000

# 設定生產環境變數
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# 啟動命令
# 容器啟動時，會去 /app/.output 找檔案，這部分將由 Volume 提供
CMD ["node", ".output/server/index.mjs"]
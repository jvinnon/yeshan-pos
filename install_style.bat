@echo off
cd client
echo ==========================================
echo 正在安裝設計樣式工具 (Tailwind CSS)...
echo ==========================================
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p
echo.
echo 安裝完成！請按任意鍵關閉。
pause
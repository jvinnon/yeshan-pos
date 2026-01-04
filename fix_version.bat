@echo off
cd client
echo ==========================================
echo 正在將設計工具換回穩定版 (v3)...
echo 請稍候，這會解決紅字錯誤。
echo ==========================================

call npm uninstall tailwindcss postcss autoprefixer
call npm install -D tailwindcss@3.4.1 postcss@8 autoprefixer@10

echo.
echo ==========================================
echo 版本修復完成！
echo 現在請嘗試重新啟動。
echo ==========================================
pause
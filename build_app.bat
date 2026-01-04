@echo off
cd client
echo ==========================================
echo 正在將 POS 系統打包成網頁檔案...
echo 這可能需要 1~2 分鐘，請稍候...
echo ==========================================
call npm run build
echo.
echo 打包完成！請看資料夾內是否多了一個 "build" 資料夾。
pause
@echo off
echo ==========================================
echo 正在準備 iPad 點餐系統的環境...
echo 這個過程會比較久 (可能需要 3-5 分鐘)，請耐心等待...
echo ==========================================

call npx create-react-app client
cd client
echo 正在安裝圖示套件...
call npm install lucide-react

echo.
echo ==========================================
echo 環境建立完成！
echo 請繼續下一步驟：貼上代碼。
echo ==========================================
pause
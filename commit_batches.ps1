# Script PowerShell để commit từng đợt
# Chạy từng phần một cách tuần tự

Write-Host "=== fixing fontend ==="
git add frontend/.eslintrc.json
git add frontend/hooks/useRoute.js
git add frontend/hooks/useUserLocation.js
git add frontend/pages/owner/dashboard.js
git add frontend/pages/qr.js
git add frontend/pages/scan-qr.js
git add frontend/utils/qr/qrUtils.js
git commit -m "Frontend: Add chatbot, location/route hooks, owner management page, QR scanning/processing"

Write-Host "=== fixing UX ==="
git add frontend/components/chatbot/ChatbotWidget.js
git add frontend/pages/owner/dashboard.js  # (nếu chưa add, nhưng đã add ở đợt 1)
git add frontend/pages/scan-qr.js  # (đã add ở đợt 1)
git commit -m "UX : Chatbot interface, menu dashboard, QR scanning with camera"

Write-Host "=== Add API ==="
git add frontend/utils/api/client.js
git add frontend/utils/chatbot/ChatbotContext.js
git commit -m "API: Common client, chatbot context with location"

Write-Host "=== Document ==="
git add docs/PRD7.png
git add docs/PRD8.png
git commit -m "Documentation: Add PRD images"

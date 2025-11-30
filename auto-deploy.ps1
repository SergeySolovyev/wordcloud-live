# Автоматическая отправка на GitHub и деплой
Write-Host "🚀 Автоматический деплой на GitHub" -ForegroundColor Cyan
Write-Host ""

# Убеждаемся, что remote настроен правильно
git remote set-url origin https://github.com/SergeySolovyev/wordcloud-live.git

Write-Host "📋 Инструкция:" -ForegroundColor Yellow
Write-Host "1. Откройте: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: wordcloud-live" -ForegroundColor White
Write-Host "3. НЕ добавляйте README, .gitignore или лицензию" -ForegroundColor White
Write-Host "4. Нажмите 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Ожидание создания репозитория..." -ForegroundColor Yellow
Write-Host "Скрипт будет пытаться отправить код каждые 3 секунды..." -ForegroundColor Gray
Write-Host ""

$maxAttempts = 120  # 6 минут максимум
$attempt = 0
$success = $false

while ($attempt -lt $maxAttempts -and -not $success) {
    $attempt++
    
    if ($attempt % 10 -eq 0) {
        Write-Host "[$attempt/$maxAttempts] Проверка..." -ForegroundColor Gray
    }
    
    $result = git push -u origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ УСПЕХ! Код отправлен на GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📦 Репозиторий: https://github.com/SergeySolovyev/wordcloud-live" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎯 Следующие шаги для деплоя на Render:" -ForegroundColor Yellow
        Write-Host "1. Зайдите на https://render.com" -ForegroundColor White
        Write-Host "2. New → Web Service" -ForegroundColor White
        Write-Host "3. Подключите GitHub и выберите репозиторий 'wordcloud-live'" -ForegroundColor White
        Write-Host "4. Настройки:" -ForegroundColor White
        Write-Host "   - Name: wordcloud-live" -ForegroundColor Gray
        Write-Host "   - Build Command: npm install" -ForegroundColor Gray
        Write-Host "   - Start Command: npm start" -ForegroundColor Gray
        Write-Host "   - Plan: Free" -ForegroundColor Gray
        Write-Host "5. Create Web Service" -ForegroundColor White
        Write-Host ""
        $success = $true
    } else {
        if ($result -match "Repository not found") {
            Start-Sleep -Seconds 3
        } else {
            Write-Host ""
            Write-Host "❌ Ошибка: $result" -ForegroundColor Red
            break
        }
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "⏱️  Время ожидания истекло" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Выполните вручную после создания репозитория:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}


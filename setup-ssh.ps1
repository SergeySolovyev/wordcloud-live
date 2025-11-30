# Настройка SSH для GitHub и отправка кода

Write-Host "🔑 Настройка SSH для GitHub" -ForegroundColor Cyan
Write-Host ""

# Меняем remote на SSH
Write-Host "Изменение remote на SSH..." -ForegroundColor Yellow
git remote set-url origin git@github.com:SergeySolovyev/wordcloud-live.git

Write-Host "✅ Remote изменён на SSH" -ForegroundColor Green
Write-Host ""

# Проверяем подключение
Write-Host "Проверка SSH подключения к GitHub..." -ForegroundColor Yellow
ssh -T git@github.com

Write-Host ""
Write-Host "Отправка кода на GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ УСПЕХ! Код отправлен на GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Если деплой на Render уже настроен - он обновится автоматически" -ForegroundColor White
    Write-Host "2. Или в Render: Manual Deploy -> Deploy latest commit" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при отправке" -ForegroundColor Red
    Write-Host "Убедитесь, что:" -ForegroundColor Yellow
    Write-Host "- SSH ключ добавлен на GitHub" -ForegroundColor White
    Write-Host "- Репозиторий создан на GitHub" -ForegroundColor White
}


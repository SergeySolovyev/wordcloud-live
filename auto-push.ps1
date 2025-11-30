# Автоматическая отправка на GitHub
# Этот скрипт будет пытаться отправить код каждые 5 секунд
# Пока вы создаёте репозиторий на GitHub

Write-Host "🚀 Автоматическая отправка на GitHub" -ForegroundColor Cyan
Write-Host ""
Write-Host "Пока скрипт работает, создайте репозиторий:" -ForegroundColor Yellow
Write-Host "1. Откройте: https://github.com/new" -ForegroundColor White
Write-Host "2. Название: wordcloud-live" -ForegroundColor White
Write-Host "3. НЕ добавляйте README, .gitignore или лицензию" -ForegroundColor White
Write-Host "4. Нажмите 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "Скрипт будет пытаться отправить код каждые 5 секунд..." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 60  # 5 минут максимум
$attempt = 0
$success = $false

while ($attempt -lt $maxAttempts -and -not $success) {
    $attempt++
    Write-Host "Попытка $attempt/$maxAttempts..." -ForegroundColor Gray
    
    $result = git push -u origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ УСПЕХ! Код отправлен на GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Следующие шаги:" -ForegroundColor Yellow
        Write-Host "1. Если деплой на Render уже настроен - он обновится автоматически" -ForegroundColor White
        Write-Host "2. Или в Render: Manual Deploy -> Deploy latest commit" -ForegroundColor White
        $success = $true
    } else {
        if ($result -match "Repository not found") {
            Write-Host "   ⏳ Репозиторий ещё не создан, жду..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "   ❌ Ошибка: $result" -ForegroundColor Red
            break
        }
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "❌ Не удалось отправить код автоматически" -ForegroundColor Red
    Write-Host ""
    Write-Host "Выполните вручную после создания репозитория:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}


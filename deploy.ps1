# Скрипт для деплоя на GitHub и Render
# Использование: .\deploy.ps1 YOUR_GITHUB_USERNAME

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

$RepoName = "wordcloud-live"
$RepoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "Проверка Git статуса..." -ForegroundColor Cyan
git status

Write-Host "`nДобавление remote репозитория..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $RepoUrl

Write-Host "`nОтправка на GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Успешно отправлено на GitHub!" -ForegroundColor Green
    Write-Host "`nСледующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Зайдите на https://render.com" -ForegroundColor White
    Write-Host "2. Откройте ваш Web Service" -ForegroundColor White
    Write-Host "3. Нажмите 'Manual Deploy' -> 'Deploy latest commit'" -ForegroundColor White
    Write-Host "   ИЛИ просто подождите автоматического деплоя" -ForegroundColor White
} else {
    Write-Host "`n❌ Ошибка при отправке. Проверьте:" -ForegroundColor Red
    Write-Host "   - Репозиторий создан на GitHub" -ForegroundColor White
    Write-Host "   - Правильный username: $GitHubUsername" -ForegroundColor White
    Write-Host "   - Вы авторизованы в Git" -ForegroundColor White
}


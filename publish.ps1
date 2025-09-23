# publish.ps1
# Script helper para rodar localmente no PowerShell após instalar o Git.
# Substitua <your-username> e <repo-name> antes de executar.

param(
  [string]$GitRemote = "https://github.com/<your-username>/<repo-name>.git",
  [string]$Branch = "main"
)

Write-Host "Verificando git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git não foi encontrado. Instale Git: https://git-scm.com/downloads e rode novamente.";
  exit 1
}

Write-Host "Inicializando repositório (se já estiver inicializado, o comando não fará mal)..."
git init

git add .

git commit -m "Prepare site for GitHub Pages: split CSS/JS, add workflow" -q

Write-Host "Adicionando remoto e enviando para $Branch..."
# Se já existir remoto 'origin', atualize-o
$existing = git remote 2>$null
if ($existing -match 'origin') {
  git remote remove origin
}

git remote add origin $GitRemote

git branch -M $Branch

git push -u origin $Branch

Write-Host "Push finalizado. Se você configurou a workflow, as Actions devem rodar automaticamente." 
Write-Host "Verifique: https://github.com/<your-username>/<repo-name>/actions"
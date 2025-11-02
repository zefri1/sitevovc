# Script to commit and push bug fixes
$ErrorActionPreference = "Stop"

Write-Host "Adding changed files..."
git add src/catalog-enhanced.js

Write-Host "Committing changes..."
git commit -m "Fix security bugs: replace onerror with addEventListener and innerHTML with createElement"

Write-Host "Checking for remote repository..."
$remote = git remote -v
if ($remote) {
    Write-Host "Pushing to remote..."
    git push
} else {
    Write-Host "No remote repository configured. Please add remote with: git remote add origin <url>"
}

Write-Host "Done!"


$apiKey = Read-Host "Cole sua API Key da OpenRouter"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Nenhuma chave foi informada. A configuracao foi cancelada." -ForegroundColor Yellow
    exit 1
}

[Environment]::SetEnvironmentVariable("OPENROUTER_API_KEY", $apiKey, "User")
[Environment]::SetEnvironmentVariable("OPENROUTER_MODEL", "openai/gpt-4o-mini", "User")

$envContent = @"
OPENROUTER_API_KEY=$apiKey
OPENROUTER_MODEL=openai/gpt-4o-mini
"@

$envPath = Join-Path $projectDir ".env"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($envPath, $envContent, $utf8NoBom)

Write-Host "Variaveis configuradas com sucesso." -ForegroundColor Green
Write-Host "A chave tambem foi salva no arquivo .env local do projeto."
Write-Host "Pare o servidor atual com CTRL+C e execute .\executar.ps1 novamente."

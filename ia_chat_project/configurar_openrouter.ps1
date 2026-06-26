$apiKey = Read-Host "Cole sua API Key da OpenRouter"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Nenhuma chave foi informada. A configuracao foi cancelada." -ForegroundColor Yellow
    exit 1
}

[Environment]::SetEnvironmentVariable("OPENROUTER_API_KEY", $apiKey, "User")
[Environment]::SetEnvironmentVariable("OPENROUTER_MODEL", "openai/gpt-4o-mini", "User")

Write-Host "Variaveis configuradas com sucesso." -ForegroundColor Green
Write-Host "Feche e abra o PowerShell antes de executar o projeto."

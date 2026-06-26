$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

py app.py

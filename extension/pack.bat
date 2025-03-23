@echo off
setlocal EnableDelayedExpansion

SET OPENSSL_PATH="C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
SET CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

echo Limpando arquivos anteriores...
if exist "%~dp0.crx" del "%~dp0.crx"
if exist "%~dp0private.pem" del "%~dp0private.pem"

echo Verificando OpenSSL v3.4.1...
%OPENSSL_PATH% version | findstr "3.4.1" > nul
if errorlevel 1 (
    echo Erro: Versao do OpenSSL incorreta!
    echo Versao necessaria: OpenSSL 3.4.1
    echo Por favor, instale Win64 OpenSSL v3.4.1 de:
    echo https://slproweb.com/download/Win64OpenSSL-3_4_1.exe
    pause
    exit /b 1
)

echo Verificando Google Chrome...
if not exist %CHROME_PATH% (
    echo Erro: Google Chrome nao encontrado!
    echo Instale o Google Chrome no caminho padrao.
    pause
    exit /b 1
)

echo Verificando processos do Chrome...
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Erro: Chrome esta em execucao!
    echo Por favor, feche todas as janelas do Chrome e tente novamente.
    pause
    exit /b 1
)

echo Verificando estrutura da extensao...
if not exist "%~dp0manifest.json" (
    echo Erro: manifest.json nao encontrado!
    echo Verifique se voce esta no diretorio correto da extensao.
    pause
    exit /b 1
)

echo Validando manifest.json...
type "%~dp0manifest.json" | findstr "manifest_version name version" > nul
if errorlevel 1 (
    echo Erro: manifest.json invalido!
    echo Verifique se o arquivo contem os campos obrigatorios.
    pause
    exit /b 1
)

echo Verificando permissoes...
mkdir "%~dp0test_permission" 2>nul
if errorlevel 1 (
    echo Erro: Sem permissao de escrita no diretorio!
    echo Execute este script como administrador.
    pause
    exit /b 1
)
rmdir "%~dp0test_permission"

echo Preparando ambiente...
set "WORKING_DIR=%~dp0working_dir"
if exist "%WORKING_DIR%" rd /s /q "%WORKING_DIR%"
mkdir "%WORKING_DIR%"

echo Gerando chave privada no diretorio de trabalho...
cd /d "%WORKING_DIR%"
%OPENSSL_PATH% genrsa -out private.pem 2048
if not exist "private.pem" (
    echo Erro: Falha ao gerar private.pem!
    exit /b 1
)
echo Chave privada gerada em: %WORKING_DIR%\private.pem

echo Copiando arquivos necessarios...
xcopy "%~dp0manifest.json" "%WORKING_DIR%\" /Y /Q
xcopy "%~dp0background.js" "%WORKING_DIR%\" /Y /Q
xcopy "%~dp0script.js" "%WORKING_DIR%\" /Y /Q
if exist "%~dp0assets" xcopy "%~dp0assets" "%WORKING_DIR%\assets\" /E /I /Y /Q

echo -- Arquivos no diretorio de trabalho --
dir "%WORKING_DIR%" /B

REM Mover a chave para fora do diretório de empacotamento (para não ser copiada)
echo Movendo key para fora do diretório de trabalho...
move /Y "%WORKING_DIR%\private.pem" "%~dp0private.pem"
del /q "%WORKING_DIR%\private.pem" 2>nul

REM Copiar a pasta de trabalho para uma pasta temporária de empacotamento, excluindo arquivos .pem
echo Criando diretorio temporario de empacotamento...
set "PACK_TEMP=%~dp0pack_temp"
if exist "%PACK_TEMP%" rd /s /q "%PACK_TEMP%"
robocopy "%WORKING_DIR%" "%PACK_TEMP%" /E /XF "private.pem" > nul

echo Empacotando extensao usando diretorio temporario...
set "EXT_DIR=%PACK_TEMP%"
set "PRIVATE_KEY=%~dp0private.pem"
echo Executando: "C:\Program Files\Google\Chrome\Application\chrome.exe" --pack-extension="%EXT_DIR%" --pack-extension-key="%PRIVATE_KEY%" --no-sandbox --enable-logging=stderr --v=1
"C:\Program Files\Google\Chrome\Application\chrome.exe" --pack-extension="%EXT_DIR%" --pack-extension-key="%PRIVATE_KEY%" --no-sandbox --enable-logging=stderr --v=1
timeout /t 15 /nobreak > nul

REM Procurar o arquivo .crx gerado na pasta temporaria
for %%F in (
    "%EXT_DIR%.crx"
    "%PACK_TEMP%.crx"
) do (
    if exist "%%~F" (
        echo Encontrado: %%~F
        move /Y "%%~F" "%~dp0extension.crx" > nul
        echo Arquivo movido para: %~dp0extension.crx
        goto :PACK_SUCCESS
    )
)

echo ERRO: Arquivo .crx nao encontrado
echo -- Debug Info --
echo Chrome Path: %CHROME_PATH%
echo EXT_DIR: %EXT_DIR%
dir "%EXT_DIR%"
exit /b 1

:PACK_SUCCESS
echo Limpando arquivos temporarios...
rd /s /q "%WORKING_DIR%"
rd /s /q "%PACK_TEMP%"

echo Verificando arquivo final...
if exist "%~dp0extension.crx" (
    echo Extensao empacotada com sucesso!
    echo Tamanho do arquivo:
    dir "%~dp0extension.crx" | findstr "extension.crx"
) else (
    echo Erro: Arquivo final nao encontrado!
    exit /b 1
)

pause

# ZENOVA - Upload FTP Automatico
# ================================

Write-Host "ZENOVA - Upload automatico su OVH" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Credenziali FTP
$ftpServer = "ftp://ftp.cluster100.hosting.ovh.net"
$ftpUsername = "zenovab"
$ftpRemotePath = "/shop"
$localPath = "C:\Users\giorg\zenova-ecommerce\frontend-production"

# Chiedi password
Write-Host "Inserisci la password FTP:" -ForegroundColor Yellow
$ftpPasswordSecure = Read-Host -AsSecureString
$ftpPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPasswordSecure))

Write-Host ""
Write-Host "Cartella locale: $localPath" -ForegroundColor Cyan
Write-Host "Server FTP: $ftpServer" -ForegroundColor Cyan
Write-Host "Username: $ftpUsername" -ForegroundColor Cyan
Write-Host "Cartella remota: $ftpRemotePath" -ForegroundColor Cyan
Write-Host ""

# Funzione upload file
function Upload-File {
    param($localFile, $remoteUrl, $username, $password)
    
    try {
        $fileName = Split-Path $localFile -Leaf
        Write-Host "Caricamento: $fileName..." -NoNewline
        
        $ftpRequest = [System.Net.FtpWebRequest]::Create($remoteUrl)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($username, $password)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $ftpRequest.ContentLength = $fileContent.Length
        
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        Write-Host " OK" -ForegroundColor Green
        return $true
    } catch {
        Write-Host " ERRORE: $_" -ForegroundColor Red
        return $false
    }
}

# Test connessione
Write-Host "Test connessione FTP..." -ForegroundColor Yellow
try {
    $testRequest = [System.Net.FtpWebRequest]::Create("$ftpServer/")
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $testRequest.GetResponse() | Out-Null
    Write-Host "Connessione FTP riuscita!" -ForegroundColor Green
} catch {
    Write-Host "ERRORE: Impossibile connettersi al server FTP" -ForegroundColor Red
    Write-Host "Verifica username e password" -ForegroundColor Red
    Read-Host "Premi INVIO per chiudere"
    exit 1
}

Write-Host ""
Write-Host "Inizio caricamento file..." -ForegroundColor Yellow
Write-Host ""

# Conta file
$files = Get-ChildItem -Path $localPath -File | Where-Object { $_.Name -ne "README-UPLOAD.md" }
$totalFiles = $files.Count
$uploadedFiles = 0
$failedFiles = 0

# Upload di tutti i file
foreach ($file in $files) {
    $remoteUrl = "$ftpServer$ftpRemotePath/$($file.Name)"
    
    if (Upload-File -localFile $file.FullName -remoteUrl $remoteUrl -username $ftpUsername -password $ftpPassword) {
        $uploadedFiles++
    } else {
        $failedFiles++
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "RIEPILOGO UPLOAD" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Totale file: $totalFiles" -ForegroundColor Cyan
Write-Host "Caricati: $uploadedFiles" -ForegroundColor Green
Write-Host "Falliti: $failedFiles" -ForegroundColor Red
Write-Host ""

if ($failedFiles -eq 0) {
    Write-Host "UPLOAD COMPLETATO CON SUCCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Il tuo sito sara disponibile tra 15-30 minuti su:" -ForegroundColor Yellow
    Write-Host "https://shop.zenova.ovh" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANTE: Dopo il deploy del backend, ricorda di aggiornare config.js!" -ForegroundColor Yellow
} else {
    Write-Host "Upload completato con alcuni errori" -ForegroundColor Yellow
    Write-Host "Verifica i file falliti e riprova" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Premi INVIO per chiudere..."
Read-Host

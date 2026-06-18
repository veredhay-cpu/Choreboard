# PowerShell Native Local Web Server with Dynamic Path Resolution
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "=================================================="
    Write-Host " Server started successfully at http://localhost:$port/"
    Write-Host " Open this link in your browser to play the game!"
    Write-Host " Press Ctrl+C in this terminal to stop the server."
    Write-Host "=================================================="
    Write-Host " Serving files from: $PSScriptRoot"
} catch {
    Write-Host "Failed to start listener on port $port. It might already be in use."
    Exit
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        Write-Host "Incoming Request: $($request.HttpMethod) $urlPath"
        
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        # Translate to local path
        $cleanPath = $urlPath.Replace("/", "\")
        if ($cleanPath.StartsWith("\")) {
            $cleanPath = $cleanPath.Substring(1)
        }
        
        # Dynamic path resolution using $PSScriptRoot
        $filePath = Join-Path $PSScriptRoot $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css; charset=utf-8" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript; charset=utf-8" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "Response: 200 OK ($contentType)"
        } else {
            $response.StatusCode = 404
            $errorMsg = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: " + $urlPath)
            $response.OutputStream.Write($errorMsg, 0, $errorMsg.Length)
            Write-Host "Response: 404 Not Found"
        }
    } catch {
        Write-Host "Request handling error: $_"
    } finally {
        if ($response) {
            try { $response.Close() } catch {}
        }
    }
}

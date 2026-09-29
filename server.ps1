$port = 8080
$root = $PSScriptRoot
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Output "TCP Server listening on port $port"

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".ico"  = "image/x-icon"
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $stream.ReadTimeout = 2000
            $stream.WriteTimeout = 2000
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
            $requestLine = $reader.ReadLine()
            if (-not [string]::IsNullOrEmpty($requestLine)) {
                $parts = $requestLine.Split(' ')
                $method = $parts[0]
                $url = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
                
                # Consume headers
                while ($true) {
                    $headerLine = $reader.ReadLine()
                    if ([string]::IsNullOrEmpty($headerLine)) { break }
                }

                $clean = $url.Split('?')[0].TrimStart('/')
                if ([string]::IsNullOrEmpty($clean)) { $clean = "index.html" }
                $filePath = Join-Path $root $clean

                if (Test-Path $filePath -PathType Leaf) {
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
                    
                    $resHeader = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $hBytes = [System.Text.Encoding]::ASCII.GetBytes($resHeader)
                    $stream.Write($hBytes, 0, $hBytes.Length)
                    if ($method -ne "HEAD") {
                        $stream.Write($bytes, 0, $bytes.Length)
                    }
                } else {
                    $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                    $resHeader = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($notFound.Length)`r`nConnection: close`r`n`r`n"
                    $hBytes = [System.Text.Encoding]::ASCII.GetBytes($resHeader)
                    $stream.Write($hBytes, 0, $hBytes.Length)
                    if ($method -ne "HEAD") {
                        $stream.Write($notFound, 0, $notFound.Length)
                    }
                }
                $stream.Flush()
            }
        } catch {
            # Handle socket read/write timeouts or disconnects
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}

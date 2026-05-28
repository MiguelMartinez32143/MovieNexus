param(
    [string]$srcPath = "C:\Users\SENA\.gemini\antigravity-ide\brain\d0b29dfc-4c96-4517-a2e2-3d85aad1ee69\movienexus_pwa_logo_safe_1779997993879.png",
    [string]$destDir = "c:\Users\SENA\Desktop\m\MovieNexus\public\assets\icons"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

# Load the source image
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

foreach ($size in $sizes) {
    Write-Host "Resizing to ${size}x${size}..."
    $destPath = Join-Path $destDir "icon-${size}x${size}.png"
    
    # Create the destination bitmap
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Set high quality resizing options
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw the resized image
    $g.DrawImage($srcImg, 0, 0, $size, $size)
    
    # Save as PNG
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Clean up resources for this size
    $g.Dispose()
    $bmp.Dispose()
}

$srcImg.Dispose()
Write-Host "All icons resized successfully!"

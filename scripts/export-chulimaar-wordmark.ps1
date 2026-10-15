param([string]$FontFamily = 'Georgia')

# Export logo lettering as paths without shipping a system-font binary.
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap 1,1
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$family = New-Object System.Drawing.FontFamily $FontFamily
$font = New-Object System.Drawing.Font($family,100,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$format = [System.Drawing.StringFormat]::GenericTypographic
$xPosition = [single]0
$paths = @()
$all = New-Object System.Drawing.Drawing2D.GraphicsPath
$culture = [System.Globalization.CultureInfo]::InvariantCulture

foreach ($character in 'Chulimaar.'.ToCharArray()) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $origin = New-Object System.Drawing.PointF($xPosition,0)
  $path.AddString([string]$character,$family,0,100,$origin,$format)
  $points = $path.PathPoints
  $types = $path.PathTypes
  $commands = New-Object System.Collections.Generic.List[string]
  for ($index=0; $index -lt $points.Count; $index++) {
    $type = $types[$index] -band 7
    $px = $points[$index].X.ToString('0.###',$culture)
    $py = $points[$index].Y.ToString('0.###',$culture)
    if ($type -eq 0) { $commands.Add("M$px,$py") }
    elseif ($type -eq 1) { $commands.Add("L$px,$py") }
    elseif ($type -eq 3) {
      $p2 = $points[$index+1]
      $p3 = $points[$index+2]
      $commands.Add(('C{0},{1} {2},{3} {4},{5}' -f $px,$py,$p2.X.ToString('0.###',$culture),$p2.Y.ToString('0.###',$culture),$p3.X.ToString('0.###',$culture),$p3.Y.ToString('0.###',$culture)))
      $index += 2
    }
    if (($types[$index] -band 128) -ne 0) { $commands.Add('Z') }
  }
  $paths += @{ d=($commands -join ' '); period=($character -eq '.') }
  $all.AddPath($path,$false)
  $xPosition += $graphics.MeasureString([string]$character,$font,[System.Drawing.PointF]::Empty,$format).Width - 7
  $path.Dispose()
}
$bounds = $all.GetBounds()
$data = @{ font="$FontFamily Regular"; trackingEm=-0.07; em=100; bounds=@{ x=$bounds.X; y=$bounds.Y; width=$bounds.Width; height=$bounds.Height }; paths=$paths }
$destination = Join-Path (Split-Path $PSScriptRoot -Parent) 'src/data/chulimaar-wordmark.json'
[System.IO.File]::WriteAllText($destination,($data | ConvertTo-Json -Depth 6),[System.Text.UTF8Encoding]::new($false))
Write-Output ('Wordmark outlines created: {0} by {1}' -f $bounds.Width,$bounds.Height)

# Share headlines use the same display face without depending on an OG font fallback.
$headline = New-Object System.Drawing.Drawing2D.GraphicsPath
$headline.AddString('Rooted in Skardu.',$family,0,100,[System.Drawing.PointF]::new(0,0),$format)
$headline.AddString('Pressed in Skardu.',$family,0,100,[System.Drawing.PointF]::new(0,115),$format)
$points = $headline.PathPoints
$types = $headline.PathTypes
$commands = New-Object System.Collections.Generic.List[string]
for ($index=0; $index -lt $points.Count; $index++) {
  $type = $types[$index] -band 7
  $px = $points[$index].X.ToString('0.###',$culture)
  $py = $points[$index].Y.ToString('0.###',$culture)
  if ($type -eq 0) { $commands.Add("M$px,$py") }
  elseif ($type -eq 1) { $commands.Add("L$px,$py") }
  elseif ($type -eq 3) {
    $p2 = $points[$index+1]
    $p3 = $points[$index+2]
    $commands.Add(('C{0},{1} {2},{3} {4},{5}' -f $px,$py,$p2.X.ToString('0.###',$culture),$p2.Y.ToString('0.###',$culture),$p3.X.ToString('0.###',$culture),$p3.Y.ToString('0.###',$culture)))
    $index += 2
  }
  if (($types[$index] -band 128) -ne 0) { $commands.Add('Z') }
}
$headlineBounds = $headline.GetBounds()
$headlineData = @{ d=($commands -join ' '); bounds=@{x=$headlineBounds.X;y=$headlineBounds.Y;width=$headlineBounds.Width;height=$headlineBounds.Height} }
[System.IO.File]::WriteAllText((Join-Path (Split-Path $PSScriptRoot -Parent) 'src/data/chulimaar-share-headline.json'),($headlineData | ConvertTo-Json -Depth 5),[System.Text.UTF8Encoding]::new($false))
$headline.Dispose()
$all.Dispose()
$font.Dispose()
$family.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

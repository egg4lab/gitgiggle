#Requires -Version 5.1
<#
  Enables GitHub Pages for egg4lab/gitgiggle using the GitHub REST API.
  Requires a personal access token (classic) with "repo" scope, or a fine-grained token
  with Administration repository permissions (or "Pages: write" where applicable).

  Usage:
    $env:GITHUB_TOKEN = "ghp_xxxxxxxx"   # or fine-grained PAT
    .\tools\Enable-GitHubPages.ps1

  Then in the repo: Settings -> Pages -> ensure source is "GitHub Actions",
  and run workflow "Deploy Ashtanga tracker to GitHub Pages" once if the site does not build.
#>
$ErrorActionPreference = 'Stop'
$owner = 'egg4lab'
$repo = 'gitgiggle'
$token = $env:GITHUB_TOKEN
if (-not $token) { $token = $env:GH_TOKEN }
if (-not $token) {
  Write-Error "Set environment variable GITHUB_TOKEN (or GH_TOKEN) to a PAT with repo admin access."
  exit 1
}

$headers = @{
  Accept                 = 'application/vnd.github+json'
  Authorization        = "Bearer $token"
  'X-GitHub-Api-Version' = '2022-11-28'
}
$uri = "https://api.github.com/repos/$owner/$repo/pages"
$bodyWorkflow = '{"build_type":"workflow"}'

try {
  Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $bodyWorkflow -ContentType 'application/json'
  Write-Host "GitHub Pages enabled (build_type: workflow). Site: https://$owner.github.io/$repo/"
  exit 0
} catch {
  $err = $_.Exception.Response
  if ($err -and $err.StatusCode -eq [System.Net.HttpStatusCode]::Conflict) {
    try {
      Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $bodyWorkflow -ContentType 'application/json'
      Write-Host "GitHub Pages updated to workflow builds. Site: https://$owner.github.io/$repo/"
      exit 0
    } catch {
      Write-Host $_
      exit 1
    }
  }
  Write-Host $_
  exit 1
}

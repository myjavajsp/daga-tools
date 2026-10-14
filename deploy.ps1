# 部署脚本 - 在本地 PowerShell 中执行
$distPath = "D:\MTC\daga-clone\frontend\dist"
$serverIP = "149.88.74.104"
$serverPath = "/opt/1panel/www/sites/www.ityvip.xyz/index"
$sshKey = "$env:USERPROFILE\.ssh\id_rsa"

Write-Output "开始部署..."

# 使用 scp 上传
Write-Output "上传 index.html..."
scp -i $sshKey -o StrictHostKeyChecking=no "$distPath\index.html" "root@$serverIP:$serverPath/"

Write-Output "上传 assets 目录..."
scp -r -i $sshKey -o StrictHostKeyChecking=no "$distPath\assets" "root@$serverIP:$serverPath/"

Write-Output "上传 sw.js..."
scp -i $sshKey -o StrictHostKeyChecking=no "D:\MTC\daga-clone\frontend\public\sw.js" "root@$serverIP:$serverPath/"

Write-Output "验证部署..."
ssh -i $sshKey -o StrictHostKeyChecking=no "root@$serverIP" "ls -la $serverPath && ls -la $serverPath/assets"

Write-Output "部署完成!"

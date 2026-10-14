# 部署指南

## 问题
SSH 密钥认证未配置，需要手动添加公钥到服务器。

## 解决方案

### 步骤 1: 登录服务器
通过 1panel 控制面板或 VNC 控制台登录服务器：
- 服务器 IP: 149.88.74.104
- 用户名: root
- 需要输入密码

### 步骤 2: 添加公钥
在服务器上执行以下命令：

\\\ash
mkdir -p ~/.ssh
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDls3s+7SP1z1nLmsLWoZcITGkQDkZlpzcS8bvA6HCgib3p1cLU6oXJfk1QC3sl4pJgoGJRJOsJjgXnpN7d952mKLNhGmdptgqyMmM90MNety+ywpm/FQBau0g8U3oKjReA6+mYgruumH/HvxmlKLwKqdaWJOVebmLKB42O6q/8Oh0A68N9JdCTTz606bhU8QJzgFR31ttTUH499QL0EfYNLtY+x7ivuFlEkDxr6PdtWzX3i6bYkXcvPqzzJwnYhp80P3kUmQCfIIq34IvyTqDUSf1CD9/LEiPK8Si6+ajACjn0X3gK/9zjTj/ga/ra0vXlZeKSbcbRxgUd/0DQGv1V administrator@PC-20251231QRMV' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
\\\

### 步骤 3: 验证 SSH 密钥登录
\\\ash
ssh -i ~/.ssh/id_rsa root@149.88.74.104 "hostname"
\\\

### 步骤 4: 部署文件
添加公钥后，可以执行以下命令部署：

\\\powershell
# 上传 dist 目录
scp -r -i C:\Users\Administrator\.ssh\id_rsa D:\MTC\daga-clone\frontend\dist\* root@149.88.74.104:/opt/1panel/www/sites/www.ityvip.xyz/index/
\\\

## 当前构建文件
- 路径: D:\\MTC\\daga-clone\\frontend\\dist\\
- index.html
- assets/index-DrqHhR9R.js
- assets/index-hPM8n1HL.css
- assets/*.js (vendor)
- sw.js (daga-v48)

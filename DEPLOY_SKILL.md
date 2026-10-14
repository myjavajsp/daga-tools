# Daga Frontend Deploy Skill

## 构建
```bash
cd D:\MTC\daga-clone\frontend
npm run build
```

## 部署到服务器
```bash
node deploy.js
```

## 手动部署（如果需要）
1. 创建 zip：
   ```bash
   cd D:\MTC\daga-clone\frontend\dist\assets
   Compress-Archive -Path * -DestinationPath ../frontend_assets.zip -Force
   ```

2. 上传到服务器：
   ```bash
   scp frontend_assets.zip root@149.88.74.104:/tmp/
   ```

3. 解压到容器：
   ```bash
   docker cp /tmp/frontend_assets.zip 1Panel-openresty-mbKK:/tmp/
   docker exec 1Panel-openresty-mbKK unzip -o /tmp/frontend_assets.zip -d /www/sites/www.ityvip.xyz/index/assets
   ```

## 服务器信息
- IP: 149.88.74.104
- SSH: root / 6ccNd5KeYR9y
- 容器: 1Panel-openresty-mbKK
- 网站根目录: /www/sites/www.ityvip.xyz/index

# FoodPlan

一个本地可用的吃饭选择应用，支持每日随机、收藏、记录和计划。

## 开发运行

在项目目录执行：

```powershell
npm install
npm run dev
```

浏览器打开终端提示的地址，默认通常是 `http://localhost:5173/`。

## 生成可分发 Windows 包

在项目目录执行：

```powershell
.\package.ps1
```

打包完成后，成品目录在：

```text
release\FoodPlan-Windows
```

把整个 `FoodPlan-Windows` 文件夹发给别人即可。对方双击 `FoodPlan.exe` 就会自动启动并在默认浏览器中打开应用，不需要安装 Node.js。

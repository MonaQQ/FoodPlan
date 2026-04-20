# 正确导入方式

请在微信开发者工具中导入这个目录：

- `wechat-project`

不要直接导入：

- `miniapp`
- `wechat-project/miniprogram`

原因：

- 当前目录是标准小程序工程根目录
- `miniprogram/` 才是业务代码目录
- 这样更接近微信官方工程结构，能减少被误判成小游戏的概率

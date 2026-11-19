TravelTalk V1.5 — 完整更新包

更新步骤（iPhone Safari）：
1. 在 GitHub 仓库 Mpvv/traveltalk 的 main 根目录选择 Upload file。
2. 一次上传本文件夹中的 index.html、manifest.webmanifest、sw.js、recovery.js、translation-v15.js（不要上传整个 ZIP，也不要上传外层文件夹）。
3. 点击 Commit changes，等待 GitHub Pages 完成部署。
4. 从桌面完全关闭 TravelTalk 后重新打开。如果仍是旧版，等待缓存更新；必要时在 Safari 中先打开网站确认更新。

功能：保留 V1.3 原有功能，加入 V1.5 翻译层（常见短语本地翻译、在线翻译主备与异常过滤），并替换 V1.4 前台恢复脚本。
限制：免费翻译端点可能随时限流、禁止跨域或停止工作；本版本没有在你的 iPhone 上实测。iOS 不保证 PWA 切换应用后能无点击恢复麦克风；无法识别时点击“恢复监听”。错误译文可能仍然出现，重要内容须核对原文。
隐私：语音识别由浏览器服务提供；在线翻译文本会发送到第三方接口。请勿输入敏感信息。

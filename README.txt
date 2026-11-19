TravelTalk V2.1 Continuity Fix

基于 V2.0 Beta 修复：
1. 识别启动状态防重入与启动超时恢复。
2. onend 后清理状态并安排自动重连。
3. 重连计时器执行后清空引用，避免看门狗失效。
4. 英日朗读增加超时兜底，朗读结束恢复监听。
5. 更新 Service Worker 缓存版本。

重要：仍使用 Safari Web Speech API，不能保证快速连续讲话无漏词；iOS 可能限制自动重启，需要手动点击“重新启动识别”。

部署：将本文件夹内 index.html、translation-v15.js、context-replies.js、manifest.webmanifest、sw.js 上传至 GitHub 仓库根目录，覆盖对应旧文件。先备份旧版。
测试：连续播放两分钟日语，检查识别状态及重启次数。

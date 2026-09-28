# 采集脚本 — 目标站点数据抓取
用于从 m.sessionhd.com 后台抓取菜单结构、页面截图、接口 HAR，供 1:1 还原使用。
## 前置
```bash
cd scripts && npm install
```
## 执行
```bash
node scrape.mjs --user=13385075162 --pass=你的密码
```
## 产出
- `out/menu.json` 菜单树
- `out/screenshots/` 每个菜单一张截图
- `out/traffic.har` 所有请求的 HAR
- `out/summary.md` 采集简报

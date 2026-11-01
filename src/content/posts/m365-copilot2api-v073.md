---
title: M365-Copilot2API v0.7.3 已发布
published: 2026-10-06
updated: 2026-10-06
draft: false
description: v0.7.3 修了四个 bug：流式缓冲吞 Flush、围栏截断、200 空正文、codex 工具调用读不到。每个都是查出来才知道的毛病。
tags: ["技术"]
category: "技术"
lang: "zh"
noindex: false
pinned: false
---

v0.7.3 已发布：https://github.com/HEXUXIU/M365-Copilot2API/releases/tag/v0.7.3
Release 和 CI 成功，26 个跨平台产物齐全。

这版发布了什么？
修的 4 个 bug：
1. 流式缓冲 — recoverPanics 吞掉 Flush，所有 SSE 响应一直攒到 handler 返回才一次性下发。首字节从"等于总时长"变成真正的增量下发。
2. 围栏截断（issue #102）— 代码块之后的正文被丢弃，任何带代码块的回复都在第一个围栏处被截断。现在非工具调用的围栏按顺序就地发出。
3. 200 空正文 — 首字节前失败时返回 200 + 空 body + 一个硬编码成 rate_limit 的错误帧。严格按 OpenAI 规范解析的客户端会静默丢弃整个请求（10 并发 40 发里出现 3 次）。现在返回真实状态码并如实命名原因。
4. codex 工具调用 — codex 把工具声明塞在 input[ ].additional_tools 里还套了层 namespace，网关压根没读。codex 每个会话只说一句"我来执行"就结束，零工具调用。这是本轮最严重的发现。

改进：
换号重试加抖动退避（避免突发时所有排队请求同刻重试再次撞墙）
首字节超时换号（75s→40s）
新增 /api/metrics（p50/p95/p99、错误率、分端点、账号健康）
英文 README 和完整英文控制台（#99）。

原发于 NodeLoc 论坛：https://www.nodeloc.com/t/topic/112706

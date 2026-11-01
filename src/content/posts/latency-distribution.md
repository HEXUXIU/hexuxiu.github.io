---
title: 啊这，我还怎么开ai站呢
published: 2026-10-10
updated: 2026-10-10
draft: false
description: 各模型延迟实测：muse-spark-1.3 要 56.7 秒，同一厂商的 1.2 只要 2 秒，是上游对特定模型的资源紧张，不是链路问题。
tags: ["技术"]
category: "技术"
lang: "zh"
noindex: false
pinned: false
---

延迟分布：

模型	延迟	备注

fledge-alpha	0.5s	400，不可用

muse-spark-1.2-contributor	2.0s	正常

big-pickle	2.6s	正常

nemotron-3.5-lightning	2.8s	正常

space-bunny	2.5s	正常

longcat-2.5-preview	6.3s	偏慢

mimo-v2.6-flash	7.5s	偏慢

mimo-v2.5	15.2s	很慢

muse-spark-1.3-contributor	56.7s	严重超时

其中muse-spark-1.3-contributo是上游排队。同一模型 muse-spark-1.2 只有 2.0 秒，两者差 28 倍。同一厂商同一渠道，一个2 秒一个 57 秒，说明是上游对特定模型的资源紧张，不是我的链路的问题。这种情况我这边做任何优化都无效，只能等上游扩容或换模型了 <img src="/images/emoji/xhj32.jpeg" alt=":xhj32:" style="display:inline-block;height:2em;width:2em;vertical-align:-0.4em">

还有就是、fledge-alpha 上游列表里已经没有它了（fledge → 无），直接返回 Model fledge-alpha is not supported。模型在 OpenCode 侧不存在了。mimo-v2.5 上游也没了（mimo-v2.5 → 无）。同样的 Model mimo-v2.5-free has been deprecated

原发于 NodeLoc 论坛：https://www.nodeloc.com/t/topic/113355

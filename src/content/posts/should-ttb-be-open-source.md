---
title: 我在思考一件事，到底该不该开源TTB呢
published: 2026-10-30
updated: 2026-10-30
draft: false
description: TTB 开不开源的两难：开源是透明负责但暴露攻击面、徒增工作量，不开源就是个黑盒；还在纠结。
tags: ["随笔"]
category: "未分类"
lang: "zh"
noindex: false
pinned: false
---

因为之前说过如果TTB要搞模型训练数据的自动化获取的话（很显然现在并没有这玩意，所以说各位的数据目前都是暂存的，只是为了缓存，是会自动删掉的，因为服务器的储存一点也不大…<img src="/images/emoji/05-qiongku.png" alt=":05-qiongku:" style="display:inline-block;height:2em;width:2em;vertical-align:-0.4em"> ）

肯定要全公开的，全透明的，我才敢把这个功能加上

目前TTB是故障多次，限速过一个用户，但是至今为止，从未对用户进行路由/查看审核消息（正是因为这个原因，所以说之前出现过误判一个用户的使用，进行了限速）/乃至于泄露信息（如果没被攻击过或者上游程序被植入后们的话，反正我是不知情的）

可是这样就相当于直接把整个TTB的攻击面展示了，可能反而对数据安全有不好的可能性 <img src="/images/emoji/xhj32.jpeg" alt=":xhj32:" style="display:inline-block;height:2em;width:2em;vertical-align:-0.4em">

我自认为自己的vibe水平并不能让TTB足以透明安全的公开，所以说目前就是一个大难题了 🫠

开源吧，是对用户隐私的不负责，而且徒增大量工作量 <img src="/images/emoji/12-fuwuqi.png" alt=":12-fuwuqi:" style="display:inline-block;height:2em;width:2em;vertical-align:-0.4em">

不开源吧，对于用户来说，TTB就是一个黑盒，到底是什么，怎么样，大家也不清楚

而且并不能实现我最初希望的，只是整理自己发现的免费渠道，更好的使用一些个人本来不敢想的渠道（就比如说chatgpt，grok的账号2api，个人会觉得过于麻烦，而且少了话没有价值，多了话就是浪费）

同时把个人整理的渠道分享给大家，毕竟受人以鱼不如授人以渔

如此TTB可能会因为服务器/域名到期而消失，但是我探索TTB整理到的知识并不会消失

原发于 NodeLoc 论坛：https://www.nodeloc.com/t/topic/115989

---
title: 自训练的Prochlo-190M-SFT发布！现在模型可以基础的聊天了！
published: 2026-10-07
updated: 2026-10-07
draft: false
description: 从头训练的 190M 小模型做了 SFT，现在能基础聊天了：20 层 LLaMA 架构、20B tokens 预训练、46 万条对话微调。
tags: ["技术"]
category: "技术"
lang: "zh"
noindex: false
pinned: false
---

https://huggingface.co/CyanoAI/Prochlo-190M-SFT

较Base版本（CyanoAI/Prochlo-190M-Base）

该模型目前已经可以基础的聊天了

| 项目 | Prochlo-190M-SFT |
|---|---|
| 参数量 | **约 190M / 0.2B** |
| 类型 | Dense Causal Language Model |
| 架构 | **20 层，LLaMA-style** |
| 词表 | **50,261** |
| 基础模型 | Prochlo-190M-Base |
| Base 预训练量 | **20B tokens** |
| SFT 数据 | HuggingFaceTB/smol-smoltalk |
| SFT 数据量 | **约 46 万条对话** |
| SFT epoch | 2 |
| SFT 最大长度 | **1024 tokens** |
| 训练精度 | FP16 |
| 主要语言 | **英语** |
| 权重格式 | Safetensors / F16 |
| License | **Apache-2.0** |

# “SFT”是什么意思？

这里的：

> **Prochlo-190M-SFT**

中的 SFT 是：

**Supervised Fine-Tuning，监督微调。**

它的训练实际上分为两个主要阶段。

### 第一阶段：预训练

先训练：

**Prochlo-190M-Base**

这是一个从头训练的 190M 参数模型称其使用 **20B tokens** 进行预训练，拥有 **20 层 LLaMA-style 架构和 50,261 大小的词表**。 [CyanoAI/Prochlo-190M-SFT · Hugging Face](https://huggingface.co/CyanoAI/Prochlo-190M-SFT)

在这个阶段，它主要学的是：

> 根据前面的 token 预测下一个 token。

所以 Base 模型本身并不天然知道应该像 AI 助手一样回答你。

---

### 第二阶段：SFT 对话训练

然后使用：

**HuggingFaceTB/smol-smoltalk**

对 Base 进行监督微调，数据大约有 **46 万段英语对话**。 [[huggingface.co]](https://huggingface.co/CyanoAI/Prochlo-190M-SFT)

训练时对话采用类似：

&lt;|user|>

…

&lt;|assistant|>

…

这样的聊天格式。

> loss masking on assistant tokens

即训练针对 assistant 输出部分计算相应的监督训练目标，使模型学习：

**“用户这样说 → Assistant 应该这样回答。”**

因此 SFT 版本相比 Base 版本才真正具有明显的聊天/指令执行属性。

**不过，这尚且不是最终版本**，后续还有DPO / RLAIF阶段才算完成

原发于 NodeLoc 论坛：https://www.nodeloc.com/t/topic/112770

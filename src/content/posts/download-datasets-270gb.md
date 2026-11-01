---
title: 下载了一点点的数据集，准备搓一个小的模型玩玩（约 270 GB）
published: 2026-08-19
updated: 2026-08-19
draft: false
description: 下载了 28 个数据集仓库、937 个文件、约 270GB，覆盖文学、法律、医学、教材和古汉语。
tags: ["技术"]
category: "技术"
lang: "zh"
noindex: false
pinned: false
---

RT，以下是我下载的数据：

* 28 个数据集仓库
* 937 个文件
* 约 270 GB
* 主要覆盖文学、公共领域图书、法律、医学、教材和少量专业文本
* 文件格式包括 Parquet、JSON/JSONL、压缩 JSONL、CSV、TXT，以及 README、数据集说明等仓库元数据

1. 文学与公共领域图书
   这是其中最主要的一类，尤其包含多个 Project Gutenberg 衍生语料库：

* ACOSharma/literature
* BAAI/IndustryCorpus_literature
* BEE-spoke-data/fineweb-literature-100k
* BEE-spoke-data/gutenberg-en-v1-clean
* biglam/gutenberg-poetry-corpus
* CalvinU/project-gutenberg
* collabora/project-gutenberg-wds-preprocessed
* Geralt-Targaryen/Literature-zh
* matthh/gutenberg-poetry-corpus
* rzgar/kurdish_sorani_literatures
* rzgar/kurdish_sorani_literatures_it
* sedthh/gutenberg_english
* sedthh/gutenberg_multilang
* SinclairSchneider/project_gutenberg
* stevez80/Sci-Fi-Books-gutenberg
* suolyer/pile_gutenberg
  从数据集名称和已核验的文件结构看，这部分主要用于提供：
* 英文及多语言长篇书籍文本
* Gutenberg 公共领域作品
* 诗歌和文学作品
* 中文文学
* 库尔德语文学
* 科幻作品
* 已清洗或预处理的文学网页文本
  例如，SinclairSchneider/project_gutenberg 包含多个约 280–300 MB 的 Parquet 分片；ACOSharma/literature 中的主文本 main.txt 约 27.9 MB。BAAI/IndustryCorpus_literature 则包含大量压缩的 jsonl.gz 分片，预计是此次 270 GB 中占比较大的部分。

2. 法律语料
   法律类包括：

* AI-team-UoA/greek_legal_code
* dlwh/Multi_Legal_Pile
* joelniklaus/legal-mc4
* stjiris/portuguese-legal-sentences-v0
  其覆盖方向包括：
* 希腊法律法规文本
* 多语言法律文本集合
* 从多语言网页语料中筛选出的法律内容
* 葡萄牙语法律句子
  AI-team-UoA/greek_legal_code 的文件按 chapter、subject、volume 等维度组织，并包含 train、validation、test Parquet 文件。因此它不只是原始法条文本，也带有一定的数据划分或结构化组织。
  这类数据适合后续建设法律领域预训练语料，但目前还不能仅凭仓库名断言所有字段都是纯法条；仍需要读取 Parquet schema 和抽样内容后再细分。

3. 医学语料
   医学类包括：

* HiTZ/Multilingual-Medical-Corpus
* Medilora/us_medical_license_exam_textbooks_en
* nlp-guild/medical-data
* shibing624/medical
  大致覆盖：
* 多语言医学文本
* 美国医学执照考试相关英文教材
* 医学领域数据集合
* 中文或中英混合医学语料
  这部分可能包含教材、医学知识文本及结构化数据。不过，目前证据只能确认这些仓库和文件已完整下载；尚未完成字段级检查，因此不能确定其中问答、教材正文、术语或其他文本各占多少。
  另外，筛选过程中有不少医学数据集因许可证不符合要求而没有下载，例如许可证未知、GPL、非商业或禁止演绎类数据。也就是说，这 4 个是通过当前许可与任务规则后保留下来的集合，并非把搜索到的医学数据全部下载。

4. 教材和专业知识文本
   教材类包括：

* izumi-lab/open-text-books
* Sridevi/python_textbooks
* Yotam/economics-textbook
  分别面向：
* 开放教材
* Python 编程教材
* 经济学教材
  其中 Yotam/economics-textbook 已确认包含：
  economics_for_life.csv
  该 CSV 约 139 KB。此外还下载了对应 README 和仓库元数据。
  这类数据更接近连续知识文本，适合作为通用预训练中的教材或专业知识组成部分，但仍需要后续进行正文提取、去重和质量过滤。

5. 古汉语语料
   最终保留了：

* QingHong258/Ancient-Chinese-Language-CUZ
  这部分从名称判断是古汉语相关数据。此前候选中还出现过古汉语机器翻译数据，但因为任务模式命中翻译类过滤规则，最终没有进入这 28 个正式下载仓库。
  因此，现在保存的是更接近古汉语文本本身的数据，而不是法中翻译对或 pivot 翻译数据。
  完整的 28 个数据集
  ACOSharma/literature
  AI-team-UoA/greek_legal_code
  BAAI/IndustryCorpus_literature
  BEE-spoke-data/fineweb-literature-100k
  BEE-spoke-data/gutenberg-en-v1-clean
  biglam/gutenberg-poetry-corpus
  CalvinU/project-gutenberg
  collabora/project-gutenberg-wds-preprocessed
  dlwh/Multi_Legal_Pile
  Geralt-Targaryen/Literature-zh
  HiTZ/Multilingual-Medical-Corpus
  izumi-lab/open-text-books
  joelniklaus/legal-mc4
  matthh/gutenberg-poetry-corpus
  Medilora/us_medical_license_exam_textbooks_en
  nlp-guild/medical-data
  QingHong258/Ancient-Chinese-Language-CUZ
  rzgar/kurdish_sorani_literatures
  rzgar/kurdish_sorani_literatures_it
  sedthh/gutenberg_english
  sedthh/gutenberg_multilang
  shibing624/medical
  SinclairSchneider/project_gutenberg
  Sridevi/python_textbooks
  stevez80/Sci-Fi-Books-gutenberg
  stjiris/portuguese-legal-sentences-v0
  suolyer/pile_gutenberg
  Yotam/economics-textbook

下载了整整一天awa <img src="/images/emoji/xhj002.png" alt=":xhj002:" style="display:inline-block;height:2em;width:2em;vertical-align:-0.4em">

准备进一步的清洗

原发于 NodeLoc 论坛：https://www.nodeloc.com/t/topic/104363

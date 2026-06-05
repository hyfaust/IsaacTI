# IsaacTI — 以撒人格测试

[English](README.md) | [简体中文](README_zh.md)

---

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-单文件-orange.svg)]()
[![Characters](https://img.shields.io/badge/角色-34-red.svg)]()

> 一个以《以撒的结合》为主题的人格测试网站 — 找出你在 34 个可玩角色中最匹配的那一个！

---

## 目录

- [简介](#简介)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [使用方法](#使用方法)
- [工作原理](#工作原理)
  - [SBTI 模型](#sbti-模型)
  - [评分系统](#评分系统)
  - [匹配算法](#匹配算法)
  - [彩蛋机制](#彩蛋机制)
- [开发说明](#开发说明)
- [许可证](#许可证)
- [致谢](#致谢)

---

## 简介

**IsaacTI**（全称 *Isaac Type Indicator*，以撒类型指标）是一个灵感来自 SBTI（Soul, Barrage, Talent, Identity）模型的人格测试，以《以撒的结合：忏悔》为主题。通过回答 15 个人格维度上的 30 道题目，你将被匹配到 34 个可玩角色之一 — 包括 17 个基础角色和 17 个堕化角色。

整个应用是**单个 `index.html` 文件**，无需构建工具、无需服务器、无任何依赖。在浏览器中打开即可使用。

## 功能特性

- **34 个角色** — 《忏悔》全部 17 个基础角色 + 17 个堕化角色
- **15 个人格维度** — 基于 SBTI 模型（灵魂、心性、信仰、成就、社交）
- **30 道题目** — 每个维度 2 道题，每题 3 个选项（低 / 中 / 高）
- **曼哈顿距离匹配** — 基于模式字符串的匹配算法
- **中英双语** — 支持中文和英文，运行时可切换
- **雷达图** — 基于 Canvas 的 15 轴人格模式可视化
- **彩蛋** — 全选 M、全选 H 或全选 L 时触发特殊结果
- **零依赖** — 单个 HTML 文件，无需 npm，无需构建，打开即用

## 项目结构

```
IsaacTI/
├── index.html            # 完整应用（HTML + CSS + JS + 内嵌图片）
├── characters.json       # 角色数据（34 个角色的模式、台词、描述）
├── questions.json        # 题目数据（15 个维度 × 2 道题 = 30 题）
├── char_images.json      # Base64 编码的角色头像（用于重新生成）
├── characters/           # 34 个 WebP 角色图标文件（32×32）
├── isaacti-characters.md # 详细设计文档（中文）
├── LICENSE               # GPL v3 许可证
└── README_zh.md          # 本文件
```

## 使用方法

在任何现代浏览器中打开 `index.html` 即可：

```bash
# 双击 index.html，或：
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

无需服务器，无需安装，无需构建。

### 操作流程

1. 在欢迎界面点击 **START TEST / 开始测试**
2. 回答 30 道题 — 每题 3 个选项（A / B / C）
3. 完成后查看匹配结果
4. 查看雷达图了解你的人格分布
5. 浏览前 5 名匹配角色
6. 右上角 **EN/中** 按钮可随时切换语言

## 工作原理

### SBTI 模型

测试基于 5 个模型，每个模型包含 3 个维度，共 15 个人格维度：

| 模型 | 维度 | 代码 |
|------|------|------|
| **灵魂** (Soul) | 勇气、战斗风格、冒险精神 | S1, S2, S3 |
| **心性** (Heart) | 韧性、压力反应、节奏偏好 | E1, E2, E3 |
| **信仰** (Faith) | 资源观、贪婪度、挑战欲 | A1, A2, A3 |
| **成就** (Achievement) | 耐心、玩法偏好、风险偏好 | Ac1, Ac2, Ac3 |
| **社交** (Social) | 社交倾向、领导力、竞争心 | So1, So2, So3 |

### 评分系统

每个维度有 2 道题，每道题 3 个选项：

| 选项 | 分值 | 标签 |
|------|------|------|
| A | 1 (L) | 低 — 谨慎、保守 |
| B | 2 (M) | 中 — 平衡 |
| C | 3 (H) | 高 — 大胆、极端 |

维度得分 = 2 道题分数之和（范围：2–6）

| 得分范围 | 等级 |
|----------|------|
| 2–3 | **L**（低） |
| 4 | **M**（中） |
| 5–6 | **H**（高） |

最终生成一个 15 位模式字符串，例如 `HMLMM LHMHL MHLHM`。

### 匹配算法

使用**曼哈顿距离**比较你的模式与每个角色的预设模式：

```
L = 0, M = 1, H = 2

距离 = Σ |你的值[i] - 角色值[i]|   （i = 1..15）
匹配度% = max(0, round((1 - 距离 / 30) × 100))
```

- **最大距离**：30（完全相反的模式，0% 匹配）
- **最小距离**：0（完全相同的模式，100% 匹配）
- 匹配度最高的角色即为你的结果

### 彩蛋机制

| 条件 | 触发 |
|------|------|
| 所有维度 = M | 🥚 Echo — "一个真正的虚空行者" |
| 所有维度 = H 或 所有维度 = L | 🌀 Chaos — "混沌之王降临！" |

## 开发说明

如需从 JSON 数据文件和角色图片重新生成 `index.html`，需要：

1. **Python 3.6+** — 用于构建脚本
2. **角色图片** — 已包含在 `characters/` 目录中（WebP 格式）

构建流水线详见 `isaacti-characters.md`（中文）。关键 JSON 数据结构：

- `characters.json` — 对象数组，包含 `code`、`en`、`cn`、`pattern`、`quote_cn/en`、`desc_cn/en`、`char_desc_cn/en`、`img`
- `questions.json` — 对象数组，包含 `dim`、`q`、`cn`、`en`、`a_cn/en`、`b_cn/en`、`c_cn/en`
- `char_images.json` — 键值对对象，键为图片名，值为 `data:image/webp;base64,...` URI

## 许可证

本项目基于 **GNU 通用公共许可证 v3.0** 发布 — 详见 [LICENSE](LICENSE) 文件。

## 致谢

- **《以撒的结合：忏悔》** — Edmund McMillen 和 Nicalis 开发的游戏，本项目的灵感来源
- **SBTI** 人格模型 — 理论框架
- 角色图标来源：[Binding of Isaac Wiki](https://bindingofisaacrebirth.fandom.com/)
- 像素字体：[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by Google Fonts

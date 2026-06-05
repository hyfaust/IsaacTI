# IsaacTI

[English](README.md) | [简体中文](README_zh.md)

---

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-Single%20File-orange.svg)]()
[![Characters](https://img.shields.io/badge/Characters-34-red.svg)]()

> A personality test website for *The Binding of Isaac* — find out which of the 34 playable characters matches you best!

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [How It Works](#how-it-works)
  - [The SBTI Model](#the-sbti-model)
  - [Scoring System](#scoring-system)
  - [Matching Algorithm](#matching-algorithm)
  - [Easter Eggs](#easter-eggs)
- [Development](#development)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Introduction

**IsaacTI** (short for *Isaac Type Indicator*) is a personality quiz inspired by the SBTI (Soul, Barrage, Talent, Identity) model, themed around *The Binding of Isaac: Repentance*. By answering 30 questions across 15 personality dimensions, you get matched to one of 34 playable characters — 17 base characters and 17 Tainted variants.

The entire application is a **single `index.html` file** with no build tools, no server, and no dependencies. Just open it in a browser.

## Features

- **34 Characters** — All 17 base characters + 17 Tainted characters from *Repentance*
- **15 Personality Dimensions** — Based on the SBTI model (Soul, Heart, Faith, Achievement, Social)
- **30 Questions** — 2 questions per dimension, 3 options each (Low / Medium / High)
- **Manhattan Distance Matching** — Pattern-based algorithm to find your closest character match
- **Bilingual Support** — Chinese and English, switchable at runtime
- **Radar Chart** — Canvas-based 15-axis visualization of your personality pattern
- **Easter Eggs** — Special results for all-Medium, all-High, or all-Low answers
- **Zero Dependencies** — Single HTML file, no npm, no build step, just open and go

## Project Structure

```
IsaacTI/
├── index.html            # The complete application (HTML + CSS + JS + embedded images)
├── characters.json       # Character data (34 characters with patterns, quotes, descriptions)
├── questions.json        # Question data (30 questions across 15 dimensions)
├── char_images.json      # Base64-encoded character portraits (used for regeneration)
├── characters/           # 34 WebP character icon files (32×32)
├── isaacti-characters.md # Detailed design document (Chinese)
├── LICENSE               # GPL v3 License
└── README.md             # This file
```

## Usage

Simply open `index.html` in any modern browser:

```bash
# Double-click index.html, or:
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

No server, no installation, no build step required.

### How to Play

1. Click **START TEST** on the welcome screen
2. Answer 30 questions — each has 3 options (A / B / C)
3. After answering all questions, view your matched character
4. Check the radar chart for your personality breakdown
5. Browse the top 5 matches
6. Switch language with the **EN/中** button (top-right corner)

## How It Works

### The SBTI Model

The test is built on 5 models, each with 3 dimensions, for a total of 15 personality dimensions:

| Model | Dimensions | Codes |
|-------|-----------|-------|
| **Soul** (灵魂) | Courage, Combat Style, Adventurousness | S1, S2, S3 |
| **Heart** (心性) | Resilience, Pressure Response, Pace Preference | E1, E2, E3 |
| **Faith** (信仰) | Resource View, Greed, Challenge Drive | A1, A2, A3 |
| **Achievement** (成就) | Patience, Playstyle, Risk Taking | Ac1, Ac2, Ac3 |
| **Social** (社交) | Social Tendency, Leadership, Competitiveness | So1, So2, So3 |

### Scoring System

Each dimension has 2 questions. Each question has 3 options:

| Option | Score | Label |
|--------|-------|-------|
| A | 1 (L) | Low — cautious, conservative |
| B | 2 (M) | Medium — balanced |
| C | 3 (H) | High — bold, extreme |

Dimension score = sum of 2 questions (range: 2–6)

| Score Range | Level |
|-------------|-------|
| 2–3 | **L** (Low) |
| 4 | **M** (Medium) |
| 5–6 | **H** (High) |

This produces a 15-character pattern string, e.g. `HMLMM LHMHL MHLHM`.

### Matching Algorithm

The matching uses **Manhattan distance** between your pattern and each character's predefined pattern:

```
L = 0, M = 1, H = 2

distance = Σ |your_value[i] - character_value[i]|   (for i = 1..15)
match% = max(0, round((1 - distance / 30) × 100))
```

- **Maximum distance**: 30 (opposite patterns, 0% match)
- **Minimum distance**: 0 (identical patterns, 100% match)
- The character with the highest match percentage is your result

### Easter Eggs

| Condition | Trigger |
|-----------|---------|
| All dimensions = M | 🥚 Echo — "A true void walker" |
| All dimensions = H or all = L | 🌀 Chaos — "The Chaos King arrives!" |

## Development

To regenerate `index.html` from the JSON data files and character images, you would need:

1. **Python 3.6+** — for the build scripts
2. **Character images** — already included in `characters/` as WebP files

The build pipeline is documented in `isaacti-characters.md` (Chinese). The key JSON schemas:

- `characters.json` — array of objects with `code`, `en`, `cn`, `pattern`, `quote_cn/en`, `desc_cn/en`, `char_desc_cn/en`, `img`
- `questions.json` — array of objects with `dim`, `q`, `cn`, `en`, `a_cn/en`, `b_cn/en`, `c_cn/en`
- `char_images.json` — object mapping image names to `data:image/webp;base64,...` URIs

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **The Binding of Isaac: Repentance** by Edmund McMillen and Nicalis — the game that inspired this project
- **SBTI** personality model — the theoretical framework
- Character icons sourced from the [Binding of Isaac Wiki](https://bindingofisaacrebirth.fandom.com/)
- Pixel font: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by Google Fonts

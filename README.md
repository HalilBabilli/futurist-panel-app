# Futurist Panel

A multi-perspective strategic foresight analysis tool powered by AI. Generate comprehensive analyses by combining insights from specialized futurist analysts.

## Live Demo

[View the app on GitHub Pages](https://haribaran.github.io/futurist-panel-app)

## Overview

The Futurist Panel orchestrates a structured analysis where multiple specialist perspectives examine a topic, followed by an integrated synthesis. It's designed to help you think through complex futures questions with rigor and depth.

## Features

- **5 Specialized Analysts**: Each brings a unique lens to the topic
  - Tech Trajectory Analyst - Technology feasibility & timelines
  - Geopolitical Technologist - Power dynamics & governance
  - Societal Transformation Analyst - Human & cultural change
  - AI-Age Strategist - Business implications
  - Historical Pattern Analyst - Precedents & analogies

- **Integrated Synthesis**: Futurist Prime combines all perspectives into actionable insights

- **Flexible Analysis Modes**:
  - Quick (1 paragraph per analyst)
  - Standard (2-3 paragraphs)
  - Deep Dive (comprehensive analysis)

- **Easy Workflow**:
  1. Enter your topic
  2. Select which analysts to include
  3. Choose analysis depth
  4. Copy the generated prompt
  5. Paste into Claude and run
  6. Paste results back for organized viewing

## How to Use

1. **Enter a Topic**: Type any futures question in the input field, e.g.:
   - "The future of work in the age of AI agents"
   - "Will quantum computing break current encryption?"
   - "How will AI transform education in the next decade?"

2. **Select Analysts**: Choose which specialist perspectives you want included

3. **Choose Depth**: Select Quick, Standard, or Deep Dive analysis

4. **Click Analyze**: This generates a comprehensive prompt

5. **Copy Prompt**: Click "Copy Prompt" to get the full analysis prompt

6. **Run in Claude**: Paste the prompt into [Claude.ai](https://claude.ai) and run it

7. **View Results**: Paste each analyst's response back into the app to organize your analysis

## Project Structure

```
futurist-panel-app/
├── index.html          # Main application UI
├── css/
│   └── style.css       # Futuristic dark theme
├── js/
│   ├── skills.js       # Analyst definitions & prompt generation
│   └── app.js          # Main application logic
├── skills/             # Claude skill files (for reference)
│   ├── futurist-prime.md
│   ├── tech-trajectory-analyst.md
│   ├── geopolitical-technologist.md
│   ├── societal-transformation-analyst.md
│   ├── ai-age-strategist.md
│   ├── historical-pattern-analyst.md
│   ├── futurist-panel.md
│   └── futurist-toolkit-index.md
└── README.md
```

## Local Development

Simply open `index.html` in a browser - no build process required.

```bash
# Clone the repository
git clone https://github.com/haribaran/futurist-panel-app.git
cd futurist-panel-app

# Open in browser
open index.html
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Go to repository Settings > Pages
3. Select "main" branch as source
4. Your app will be live at `https://[username].github.io/futurist-panel-app`

## The Analyst Framework

### Tech Trajectory Analyst
Examines the technical feasibility and development trajectory of technologies. Uses S-curve analysis, technology readiness levels, and innovation dynamics to assess timelines and constraints.

### Geopolitical Technologist
Analyzes the intersection of technology and international relations. Considers US-China competition, regulatory landscapes, supply chain dependencies, and technology as an instrument of power.

### Societal Transformation Analyst
Studies how technologies reshape human societies, cultures, and daily life. Examines adoption patterns, inequality dimensions, workforce effects, and cultural implications.

### AI-Age Strategist
Focuses on business and economic implications of technological change. Analyzes industry disruption, new business models, competitive dynamics, and strategic imperatives.

### Historical Pattern Analyst
Brings deep historical knowledge to illuminate present challenges. Identifies relevant precedents, long-wave cycles, and patterns while acknowledging what's genuinely novel.

### Futurist Prime (Synthesis)
Integrates all perspectives into coherent conclusions. Identifies convergent insights, key tensions, critical uncertainties, scenarios, and actionable recommendations.

## Intellectual Commitments

These skills share common principles:

1. **Historical Grounding**: The past illuminates (but doesn't determine) the future
2. **Multi-Domain Integration**: Technology, economics, society, politics are inseparable
3. **Uncertainty Embrace**: Multiple futures are possible; plan for portfolio of scenarios
4. **AI Awareness**: Current transformation is qualitatively different; adjust mental models
5. **Intellectual Humility**: Strong opinions, loosely held; update on evidence
6. **Actionable Insight**: Analysis should enable better decisions

## License

MIT License - feel free to use, modify, and distribute.

## Acknowledgments

- Built for use with [Claude AI](https://claude.ai) by Anthropic
- Inspired by strategic foresight methodologies and scenario planning frameworks

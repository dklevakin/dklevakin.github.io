---
title: "My daily Claude skills, opened up"
date: 2026-03-21
description: "The Claude skills I use every day as a cloud architect — what they do, how I built them, and why they save more time than I expected."
category: "AI & vibe coding"
---

## Background

I've been using Claude Code as my primary development environment for about eight months. Over that time I've built and refined a set of custom skills — reusable tools that Claude can call to do specific things in my workflow.

These are the ones I use daily.

## 1. The architecture review skill

**What it does:** Takes a description of a system (or a diagram description) and produces a structured Well-Architected review covering reliability, security, performance, cost, and operational excellence.

**How I built it:** It's a prompt template with a specific output schema. I feed it context about the system, cloud provider, team size, and constraints. It produces a markdown report with findings, recommendations, and priority ratings.

**Why it saves time:** An architecture review that used to take me 2–3 hours of note-taking and structuring now takes 30 minutes. I still do the thinking — the skill handles the formatting and the framework checklist.

## 2. The IaC generator

**What it does:** Given a description of what I want to deploy, generates Bicep or Terraform with my team's conventions pre-applied.

**How I built it:** I trained it on our internal module patterns and naming conventions. The output isn't production-ready — it's a first draft that already follows our standards, which is better than starting from scratch or a generic example.

**Why it saves time:** The first 60% of any IaC file is boilerplate. Having that generated correctly (including our tagging strategy, naming conventions, and common patterns) means I spend time on the interesting 40%.

## 3. The incident notes skill

**What it does:** Takes raw notes from a production incident — timeline, commands run, observations — and formats them into a structured post-mortem template.

**How I built it:** It's surprisingly simple. The skill knows our post-mortem format and handles the restructuring. I just dump my raw notes in.

**Why it saves time:** Post-mortems are important but writing them when you're tired after an incident is painful. This removes the formatting friction and lets me focus on the analysis.

## 4. The PR description generator

**What it does:** Given a git diff or a description of changes, writes a pull request description that explains *why* the change was made, not just what changed.

**How I built it:** I was frustrated with PR descriptions that just repeated the commit messages. The skill has a template that explicitly asks for motivation, impact, and testing notes.

**Why it saves time:** I write better PRs now than I did before, in less time. The skill acts as a forcing function for the right structure.

## 5. The "what does this do" skill

**What it does:** Explains a piece of infrastructure code or configuration in plain language, at the level of detail I specify.

**How I built it:** This is mostly prompt engineering. The skill takes a code snippet, a target audience ("explain to a developer who knows Python but not Azure"), and a detail level.

**Why it saves time:** Onboarding new team members to existing infrastructure is slow. This skill doesn't replace pairing, but it handles the "what is this pipeline actually doing" questions at any hour.

## What I've learned about building skills

**Specificity beats generality.** The skills that are most useful are the ones tuned to our specific context — our naming conventions, our templates, our team's way of working. Generic skills are less useful than specific ones.

**Start with something you hate doing.** Every skill I use daily started with something I found tedious. The frustration is the signal.

**Output format matters.** A skill that produces markdown that needs heavy editing is less useful than one that produces something close to final. Invest time in the output format.

**Treat them like code.** Version control your skills, document what they do, iterate on them. I have a repo of skills that I maintain the same way I maintain any other tool.

## The honest limitation

These skills make me faster at things I already know how to do. They don't replace judgment. The architecture review skill doesn't catch the tradeoffs I haven't thought to look for. The IaC generator doesn't know when to break the convention. The human in the loop is still doing the work that matters.

That's fine. Faster at the known things means more time for the unknown ones.

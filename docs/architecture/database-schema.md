# Database Schema

This document defines the business entities used by AJ-OS.

Databases are implementations of these entities.

---

# Core Entities

## Project

Represents a piece of work.

Examples:

- Freelance game
- Personal portfolio project
- Audio redesign
- Internal demo

---

## Client

A company or individual commissioning work.

A client may own multiple projects.

---

## Contact

Any professional relationship.

Examples:

- Developer
- Producer
- Composer
- Sound Designer
- Recruiter

---

## Studio

Game development companies and organizations.

Studios may have many contacts.

---

## Game Jam

Represents one game jam event.

Contains:

- Team
- Theme
- Results
- Lessons
- New contacts

---

## Portfolio Piece

A public showcase of work.

Usually linked to one project.

Contains:

- Videos
- Images
- Technical breakdown
- GitHub
- Website

---

## Production Music Cue

One production music track.

Contains:

- Genre
- Mood
- BPM
- Libraries
- Royalties

---

## Learning Note

Knowledge collected while studying.

Examples:

- Wwise
- Unity
- Mixing
- Composition
- GDC

---

## Content Post

A public post.

Examples:

- LinkedIn
- Website article
- Blog
- Devlog

Usually connected to a project.

---

## Weekly Review

Weekly business reflection.

Tracks:

- Wins
- Challenges
- Lessons
- Priorities

---

## Goal

Objectives for:

- Weekly
- Monthly
- Quarterly
- Annual

---

## Asset

Reusable resources.

Examples:

- Field recordings
- Sound effects
- Templates
- Music sketches

---

# Relationships

```
Client
    │
    ▼
Project
    │
    ├────────► Portfolio Piece
    │
    ├────────► Content Post
    │
    ├────────► Weekly Review
    │
    └────────► Assets

Studio
    │
    ▼
Contact
    │
    ▼
Game Jam
    │
    ▼
Project

Project
    │
    ▼
Invoice (future)

Production Music Cue
    │
    ▼
Libraries (future)
```

---

# Schema Evolution

Database schemas are defined in TypeScript.

Running AJ-OS synchronizes the Notion workspace with the current schema.

The codebase—not Notion—is the authoritative definition of every database.

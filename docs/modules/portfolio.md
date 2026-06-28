# Portfolio Module

## Purpose

The Portfolio module manages publicly showcaseable work.

It represents the work that best demonstrates professional skills and experience.

Unlike the Projects module, which tracks ongoing work, the Portfolio module focuses on work intended to be presented to clients, collaborators and employers.

---

# Responsibilities

The Portfolio module is responsible for:

- Organizing portfolio entries
- Tracking publication status
- Managing featured work
- Recording public links
- Connecting portfolio items to projects

The Portfolio becomes the public-facing representation of completed work.

---

# Core Properties

The module currently includes:

- Title
- Category
- Status
- Release Date
- Public URL
- Repository
- Featured
- Notes

Additional properties may be introduced as the portfolio evolves.

---

# Relations

Current relationships:

```
Portfolio

↓

Projects

↓

Production Music
```

Future relationships may include:

- Game Jams
- Clients
- Marketing

Relations remain declarative and are synchronized automatically.

---

# Templates

The Portfolio module provides templates for common portfolio entries.

Examples include:

- Released Game
- Audio Demo
- Tool
- Prototype

Templates provide a consistent starting point for new portfolio items.

---

# Dashboard Integration

The CEO Dashboard summarizes portfolio activity.

Typical information includes:

- Published entries
- Featured work
- Draft portfolio items

The Dashboard recommends publishing new work when the portfolio becomes inactive.

The Dashboard links directly to the Portfolio database for detailed management.

---

# Design Principles

The Portfolio is intentionally selective.

Not every completed project belongs in the portfolio.

Instead, it represents the strongest examples of professional work.

The module remains independent from infrastructure and presentation.

---

# Future Ideas

Potential future enhancements include:

- Screenshots
- Videos
- Demo reels
- Steam links
- itch.io links
- GitHub repositories
- Downloadable assets

These additions should extend the module without changing its core architecture.

---

# Guiding Principle

The Portfolio answers one question:

> **What is the best work I can show today?**

It represents the public identity of the business and should evolve alongside professional growth.

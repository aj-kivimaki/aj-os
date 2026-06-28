# AJ-OS Principles

These principles guide every architectural and implementation decision.

---

# 1. Code First

The source code is the single source of truth.

The Notion workspace is generated from code.

Manual schema changes inside Notion should be avoided.

---

# 2. Projects First

Projects are the heart of the business.

Everything should connect to a project whenever it makes sense.

Projects generate:

- Portfolio pieces
- Content
- Invoices
- Reviews
- Learning
- Relationships

---

# 3. Single Source of Truth

Every piece of information should exist only once.

Relationships should be preferred over duplicated data.

---

# 4. Documentation Drives Development

Architecture is documented first.

Implementation follows.

Documentation is updated whenever architecture changes.

---

# 5. Small Modules

Each module has a single responsibility.

Avoid large files.

Prefer composition over complexity.

---

# 6. Automation

If a task is performed repeatedly, AJ-OS should eventually automate it.

Automation should reduce cognitive load.

---

# 7. Five-Year Thinking

Design for the business I want to have five years from now.

Avoid short-term solutions that create long-term maintenance.

---

# 8. Simplicity

Choose the simplest architecture that scales.

Avoid unnecessary abstractions.

---

# 9. Professional Quality

AJ-OS should be written to production standards.

The codebase should be clean, documented and suitable for public release.

---

# 10. Continuous Improvement

AJ-OS is a living system.

Every project, every game jam and every client should improve both the business and the operating system.

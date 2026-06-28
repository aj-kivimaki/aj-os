# Business Rules

## Purpose

Business Rules transform raw business data into actionable information.

They are the intelligence layer of AJ-OS.

Business modules describe the business.

Business Rules interpret the business.

The CEO Dashboard consumes Business Rules to determine priorities, recommendations, warnings, and business health.

---

# Design Philosophy

Business Rules are deterministic.

They do not use artificial intelligence.

They do not make decisions for the user.

Instead, they identify situations that require attention.

The goal is to reduce cognitive load.

The Dashboard should answer:

> What needs my attention today?

rather than:

> What information exists?

---

# Architecture

Business Modules

↓

Synchronization

↓

Business Rules

↓

Dashboard Builder

↓

CEO Dashboard

Business Rules never modify business data.

They only interpret it.

---

# Rule Structure

Every rule follows the same lifecycle.

Condition

↓

Evaluation

↓

Priority

↓

Recommendation

↓

Dashboard Widget

Rules are independent from one another.

Each rule evaluates one business concern.

---

# Rule Categories

Business Rules are grouped into categories.

## Projects

Examples

- Project deadline approaching
- Overdue project
- Blocked project
- Too many active projects

---

## CRM

Examples

- Follow-up overdue
- No client contact for extended period
- New contact requires action

---

## Finance

Examples

- Outstanding invoices
- Monthly expenses exceed income
- No income recorded this month
- Large upcoming payment

---

## Production Music

Examples

- Ready tracks available for submission
- Catalogue inactive for extended period
- New royalty payment received

---

## Portfolio

Examples

- No portfolio update recently
- Featured work needs refreshing
- Draft portfolio items available

---

## Game Jams

Examples

- Upcoming event approaching
- Registration deadline
- No networking activity for extended period

---

# Rule Severity

Every rule has a severity.

Possible values

Information

Warning

Critical

Severity affects dashboard ordering.

Critical items always appear first.

---

# Rule Priority

Rules also define priority.

Suggested scale

1

Low

2

Normal

3

High

4

Urgent

Priority determines dashboard ordering.

---

# Recommendations

Rules generate recommendations.

Examples

Project deadline approaching

↓

Finish milestone before Friday.

---

Invoice overdue

↓

Contact client regarding payment.

---

Five production music tracks ready

↓

Prepare next library submission.

---

Portfolio inactive for sixty days

↓

Publish a new portfolio piece.

---

CRM follow-up overdue

↓

Reconnect with the client.

Recommendations should always describe an action.

---

# Business Health

Business Health summarizes the current state of the business.

Possible values

🟢 Healthy

🟡 Needs Attention

🔴 Critical

Business Health is calculated from active rules.

The Dashboard never requires users to calculate business health manually.

---

# Dashboard Integration

The Dashboard consumes rule output.

Each widget displays:

Metrics

↓

Insight

↓

Recommendation

Rules are responsible for generating the Insight and Recommendation.

Widgets remain presentation components.

---

# Rule Independence

Rules must never depend directly on Notion.

Rules evaluate the business model.

This allows future support for additional storage backends.

---

# Future Evolution

Future versions may introduce:

- Rule configuration
- User-defined rules
- Rule scheduling
- Trend analysis
- Goal tracking
- AI-assisted recommendations

These features extend the Business Rules system without replacing it.

---

# Examples

## Example

Condition

Project deadline within seven days

↓

Severity

Warning

↓

Recommendation

Complete remaining milestone before deadline.

---

## Example

Condition

No income this month

↓

Severity

Critical

↓

Recommendation

Focus on client outreach or production music submissions.

---

## Example

Condition

Five or more production music cues ready

↓

Severity

Information

↓

Recommendation

Prepare the next library submission.

---

## Example

Condition

Portfolio unchanged for sixty days

↓

Severity

Warning

↓

Recommendation

Publish a recent project to strengthen your portfolio.

---

# Guiding Principle

Business Rules transform business data into meaningful decisions.

Business modules answer:

"What exists?"

Business Rules answer:

"What matters?"

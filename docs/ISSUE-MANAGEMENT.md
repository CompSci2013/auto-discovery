# Issue Management & Legacy Cleanup
## Navigating Years of GitLab History

**Problem**: After years of development and team turnover, GitLab is full of milestones, epics, and issues. Many are obsolete, vague, or irrelevant to the current 26-week phase. New team members are overwhelmed. Team Lead lacks visibility into whether work is relevant or yak-shaving.

**Solution**: This document provides processes for issue triage, cleanup, and alignment with current phase goals.

---

## TABLE OF CONTENTS

1. [The Problem We're Solving](#the-problem-were-solving)
2. [Issue Quality Standards](#issue-quality-standards)
3. [Phase Alignment Process](#phase-alignment-process)
4. [Issue Triage Framework](#issue-triage-framework)
5. [Legacy Cleanup Process](#legacy-cleanup-process)
6. [Team Lead Visibility](#team-lead-visibility)
7. [Preventing Yak-Shaving](#preventing-yak-shaving)
8. [Onboarding New Team Members](#onboarding-new-team-members)
9. [Weekly Issue Hygiene](#weekly-issue-hygiene)
10. [Templates & Checklists](#templates--checklists)

---

## THE PROBLEM WE'RE SOLVING

### The Legacy Mess

After several years of development:
- **Hundreds of issues** accumulated in GitLab
- **Institutional knowledge lost** through team turnover
- **Unclear priorities**: Which issues matter for current 26-week phase?
- **Vague issues**: No clear acceptance criteria or outcomes
- **Overcome by events**: Requirements changed, issues now obsolete
- **Team Lead blind**: Doesn't know what team is working on or why

### The Consequences

**For Team Members**:
- Uncertainty about what work is relevant
- Wasted effort on obsolete issues
- Risk of yak-shaving (solving irrelevant problems)
- Difficulty prioritizing work

**For Team Lead**:
- No visibility into team's activities
- Can't determine if work aligns with phase goals
- Can't provide effective guidance
- Can't report accurate progress to Project Manager

**For Project**:
- Missed deadlines (working on wrong things)
- Budget waste (solving irrelevant problems)
- Customer dissatisfaction (not delivering what matters)

---

## ISSUE QUALITY STANDARDS

### Anatomy of a Good Issue

Every issue MUST have these elements to be considered "ready for work":

#### 1. **Clear Title** (One-line summary)
```
✅ Good: "Implement JWT token refresh endpoint with 1-hour grace period"
❌ Bad: "Fix auth stuff"
```

#### 2. **Context** (Why this matters)
```
✅ Good: "Users are being logged out after 8 hours even if actively using
         the application. This creates poor UX and support tickets.
         Implements spec Section 4.3 token refresh flow."

❌ Bad: "Need to add refresh"
```

#### 3. **Acceptance Criteria** (How we know it's done)
```
✅ Good:
- [ ] POST /api/v1/auth/refresh endpoint implemented
- [ ] Accepts refresh token, returns new access token
- [ ] Works within 1 hour of token expiration
- [ ] Returns 401 if refresh token expired
- [ ] 90%+ test coverage
- [ ] Documented in API spec

❌ Bad:
- [ ] Make refresh work
```

#### 4. **Specification Reference** (Where requirements come from)
```
✅ Good: "Spec: specs/auth/authentication-service.md, Section 4.3"
❌ Bad: "Mentioned in some meeting last year"
```

#### 5. **Phase Alignment** (Is this relevant to current 26-week phase?)
```
✅ Good: "Phase 1 - Foundation (Week 1-2) - REQUIRED for MVP"
❌ Bad: "Nice to have someday"
```

#### 6. **Estimate** (How much effort?)
```
✅ Good: "3 days (includes testing and documentation)"
❌ Bad: "Dunno, a while?"
```

#### 7. **Dependencies** (What must be done first?)
```
✅ Good: "Depends on: #127 (JWT service), Blocks: #145 (Frontend auth)"
❌ Bad: "Probably depends on other stuff"
```

### Issue Quality Checklist

Before starting work on ANY issue, verify:

- [ ] **Title is clear**: Can understand what it is from title alone
- [ ] **Context explains WHY**: Business justification or user need stated
- [ ] **Acceptance criteria are testable**: Each criterion can be verified objectively
- [ ] **Spec reference exists**: Points to specific specification section
- [ ] **Phase alignment confirmed**: Relevant to current 26-week phase
- [ ] **Estimate is realistic**: Team Lead or expert has reviewed effort
- [ ] **Dependencies identified**: Know what must be done first

**If ANY checkbox is unchecked**: Issue is NOT ready for work. Comment on issue requesting missing information. Do NOT start work until issue is complete.

---

## PHASE ALIGNMENT PROCESS

### Current Phase Definition (26-Week Example)

Every 26-week phase MUST have:

1. **Phase Goals Document** (created at phase kickoff)
2. **In-Scope Features** (explicit list)
3. **Out-of-Scope Features** (explicit exclusions)
4. **Success Criteria** (how we measure success)

**Example Phase Goals Document** (create as `docs/PHASE-GOALS-2025-Q2.md`):

```markdown
# Phase Goals: Q2 2025 (Weeks 1-26)
**Start Date**: 2025-04-01
**End Date**: 2025-09-30
**Theme**: Authentication & Core Discovery Features

## Primary Objectives

1. **User Authentication** (Weeks 1-4)
   - JWT-based login/logout
   - Role-based access control (admin, analyst, viewer)
   - Domain-based authorization
   - Success: Users can log in and access features per role

2. **Core Vehicle Discovery** (Weeks 5-12)
   - Manufacturer/model filtering
   - Year range filtering
   - Results table with sorting
   - Success: Users can search and view vehicles

3. **Basic Visualization** (Weeks 13-20)
   - Bar chart (manufacturer distribution)
   - Pie chart (body class distribution)
   - Success: Users can visualize data

4. **Production Deployment** (Weeks 21-26)
   - Kubernetes deployment
   - HTTPS with Let's Encrypt
   - Monitoring and logging
   - Success: Application live at https://auto-discovery.example.com

## EXPLICITLY OUT OF SCOPE

- Multi-window pop-out system (deferred to Phase 2)
- Advanced charts (scatter, line) (deferred to Phase 2)
- Social login (OAuth) (deferred to Phase 3)
- User management UI (admins use CLI for Phase 1)
- Mobile responsiveness (desktop-only for Phase 1)
- Internationalization (English-only for Phase 1)

## Success Metrics

- 100% of in-scope features delivered
- 85%+ code coverage
- < 5 critical bugs in production
- Customer approves functionality
```

### How to Determine if Issue is In-Scope

**Decision Tree**:

```
Is this issue mentioned in Phase Goals document?
  ↓ YES → In-scope, prioritize
  ↓ NO
  ↓
Does this issue support an in-scope feature?
  ↓ YES → In-scope, prioritize
  ↓ NO
  ↓
Is this issue explicitly listed as out-of-scope?
  ↓ YES → OUT OF SCOPE, defer to future phase
  ↓ NO
  ↓
Is this a bug in existing functionality?
  ↓ YES → In-scope (bugs always in-scope)
  ↓ NO
  ↓
Is this a security vulnerability?
  ↓ YES → In-scope (security always in-scope)
  ↓ NO
  ↓
→ UNCLEAR - Escalate to Team Lead for decision
```

### Labeling System for Phase Alignment

Use GitLab labels to indicate phase alignment:

- `phase-current` - Relevant to current 26-week phase
- `phase-next` - Deferred to next phase
- `phase-future` - Someday/maybe, not prioritized
- `phase-unclear` - Needs Team Lead decision
- `overcame-by-events` - No longer relevant, candidate for closure

**Rule**: ONLY work on issues labeled `phase-current`.

---

## ISSUE TRIAGE FRAMEWORK

### Weekly Triage Meeting (30 minutes)

**Who**: Team Lead + 1-2 senior team members
**When**: Every Monday 10:00 AM
**Purpose**: Review new issues, clean up old issues, align with phase goals

**Agenda**:

1. **Review new issues** (created last week) - 10 minutes
   - Apply quality checklist
   - Assign phase labels
   - Request missing information

2. **Review stale issues** (no activity in 30+ days) - 10 minutes
   - Determine if still relevant
   - Close if overcome by events
   - Defer to future phase if not current priority

3. **Review unclear issues** (labeled `phase-unclear`) - 10 minutes
   - Team Lead makes decision: current, next, future, or close
   - Document decision in issue comment

### Triage Decision Matrix

| Issue Type | Age | Activity | Decision |
|------------|-----|----------|----------|
| **Bug in production** | Any | Any | `phase-current` + high priority |
| **Security vulnerability** | Any | Any | `phase-current` + critical priority |
| **Feature in Phase Goals** | Any | Active | `phase-current` |
| **Feature NOT in Phase Goals** | Any | Active | `phase-next` or `phase-future` |
| **Feature with no spec** | Any | Any | `blocked` until spec written |
| **Vague issue (no acceptance criteria)** | Any | Any | Comment requesting clarification, set 7-day deadline |
| **No activity in 90+ days** | > 90 days | None | Close with comment "Overcome by events, reopen if still relevant" |
| **Duplicate issue** | Any | Any | Close with reference to original issue |

### Triage Outcome Examples

**Example 1: New Feature Request**

```
Issue #456: "Add dark mode toggle"

Triage Decision:
- Quality: ❌ No acceptance criteria, no spec reference
- Phase Alignment: ❌ Not in Phase Goals (Phase 1 is desktop light theme only)
- Decision: Label `phase-future`, comment requesting spec

Comment:
"This feature is not in scope for Phase 1 (see Phase Goals doc).
 Dark mode is deferred to Phase 3 per roadmap.

 If this becomes a priority, please:
 1. Create spec in specs/ui/dark-mode.md
 2. Get customer approval
 3. Update Phase Goals document

 Labeling `phase-future` for now."
```

**Example 2: Vague Legacy Issue**

```
Issue #89: "Improve search performance" (created 2 years ago, no activity)

Triage Decision:
- Quality: ❌ No acceptance criteria ("improve" is not measurable)
- Phase Alignment: ❓ Unclear if this is still a problem
- Age: 2 years, no recent activity
- Decision: Request clarification with 7-day deadline, then close

Comment:
"This issue is 2 years old with no recent activity. To keep this open:

 1. Provide current performance metrics (baseline)
 2. Define target performance (goal)
 3. Specify how to measure (acceptance criteria)
 4. Confirm this is still a problem (we've upgraded Elasticsearch since)

 If no response in 7 days, closing as overcome by events.
 Reopen if still relevant with updated information."
```

**Example 3: Good Issue, Wrong Phase**

```
Issue #234: "Implement OAuth social login (Google, GitHub)"

Triage Decision:
- Quality: ✅ Clear acceptance criteria, spec reference
- Phase Alignment: ❌ Explicitly out-of-scope for Phase 1
- Decision: Label `phase-next` (Phase 2), defer

Comment:
"This is a well-written issue with clear acceptance criteria.
 However, per Phase Goals document, social login is deferred to Phase 2.

 Phase 1 focuses on username/password auth only (MVP).

 Labeling `phase-next`. Will revisit at Phase 2 kickoff."
```

---

## LEGACY CLEANUP PROCESS

### The 90-Day Rule

**Principle**: If an issue has no activity in 90 days and is not labeled `phase-current`, it's a candidate for closure.

**Process**:

1. **Identify candidates** (automated GitLab search):
   ```
   label:!phase-current updated:<90d
   ```

2. **Review each issue**:
   - Read issue and comments
   - Determine if overcome by events
   - Check if related to current phase

3. **Comment with 14-day notice**:
   ```
   This issue has had no activity in 90+ days. We're cleaning up legacy
   issues to focus on current phase priorities.

   If this is still relevant, please:
   - Update with current context
   - Explain how it relates to current phase
   - Provide acceptance criteria

   If no response in 14 days, we'll close this. You can reopen later if needed.
   ```

4. **Close after 14 days** (if no response):
   ```
   Closing due to no activity. Reopen if this becomes relevant to a future phase.
   ```

### Epic Consolidation

**Problem**: Dozens of old epics with 1-2 issues each, hard to navigate.

**Solution**: Consolidate into phase-based epics.

**New Epic Structure**:

```
Epic: Phase 1 - Authentication & Core Discovery (2025 Q2)
├── Issue #127: JWT Token Service
├── Issue #128: Auth Middleware
├── Issue #145: Frontend AuthService
└── ... (all Phase 1 issues)

Epic: Phase 2 - Advanced Features (2025 Q3)
├── Issue #234: OAuth Social Login
├── Issue #267: Multi-Window System
└── ... (all Phase 2 issues)

Epic: Legacy - Pre-Spec Work (Archive)
└── (All issues from before spec-driven approach)
    Close and document learnings
```

### Milestone Cleanup

**Old Way** (confusing):
- Milestone: "Sprint 47" (what does this mean 2 years later?)
- Milestone: "Auth Improvements" (vague, never closed)
- Milestone: "Bug Fixes" (ongoing forever)

**New Way** (clear):
- Milestone: "Phase 1 - Weeks 1-4 (Auth Foundation)" - dates, clear scope
- Milestone: "Phase 1 - Weeks 5-12 (Core Discovery)" - dates, clear scope
- Milestone: "Production Hotfixes" - ongoing, for urgent bugs only

**Cleanup Process**:

1. Close all milestones older than current phase
2. Move open issues from old milestones to current milestones (if relevant)
3. Close issues from old milestones that are no longer relevant

---

## TEAM LEAD VISIBILITY

### The Problem

Team Lead doesn't have direct authority but needs to know:
- What is each team member working on?
- Why are they working on it?
- Is it aligned with phase goals?
- Are they yak-shaving?

### The Solution: Weekly Work Declaration

**Every Monday by 10:00 AM**, each team member posts a comment in a "Weekly Work Planning" GitLab issue (created by Team Lead):

**Template**:

```markdown
## [Team Member Name] - Week of [Date]

### Planned Work This Week

1. **Issue #127: JWT Token Service**
   - Why: Phase 1 requirement, blocks frontend auth
   - Estimated effort: 3 days
   - Acceptance criteria: POST /refresh endpoint working, 90% test coverage
   - Spec: specs/auth/authentication-service.md Section 4.3

2. **Issue #145: Frontend AuthService**
   - Why: Phase 1 requirement, needed for login UI
   - Estimated effort: 2 days
   - Acceptance criteria: login(), logout(), isAuthenticated() methods working
   - Spec: specs/auth/authentication-service.md Section 6.1

### Blockers / Questions

- None this week

### Carryover from Last Week

- Issue #120 (90% complete, finishing tests)
```

**Team Lead Reviews** (Monday 10:30 AM - 11:00 AM):

For each planned item, Team Lead asks:

1. **Is this issue labeled `phase-current`?**
   - If NO → Ask: "How does this relate to phase goals?"

2. **Does the issue have clear acceptance criteria?**
   - If NO → Request criteria before work starts

3. **Is the estimate realistic?**
   - If uncertain → Pair with senior team member to validate

4. **Are there dependencies?**
   - If YES → Ensure blocking issues are complete

5. **Is this yak-shaving?**
   - Red flags: "Refactoring for fun", "Trying new library", "General improvements"
   - If YES → Redirect to phase-aligned work

**Team Lead Response** (in same GitLab issue):

```markdown
## Team Lead Review - Week of [Date]

**[Team Member A]**: ✅ Approved
- Both issues are phase-current and well-defined
- Estimates look reasonable

**[Team Member B]**: ⚠️ Questions
- Issue #234 (OAuth) is labeled `phase-next`, not `phase-current`
- Recommend working on Issue #267 (Phase 1 results table) instead
- Let's sync offline to reprioritize

**[Team Member C]**: ❌ Needs Clarification
- Issue #89 has no acceptance criteria
- Please update issue with measurable criteria before starting
- See Issue Quality Checklist in ISSUE-MANAGEMENT.md
```

### Benefits of Weekly Work Declaration

**For Team Members**:
- Clarity on priorities
- Early feedback before investing time
- Alignment with phase goals

**For Team Lead**:
- Visibility without micromanaging
- Opportunity to redirect before work starts
- Data for weekly summary to Project Manager

**For Project**:
- Everyone working on right things
- Early detection of misalignment
- Reduced waste

---

## PREVENTING YAK-SHAVING

### What is Yak-Shaving?

**Definition**: Working on a task that seems necessary but is actually tangential to the real goal. Often involves solving a problem that leads to another problem, which leads to another, getting further from the original objective.

**Example**:

```
Goal: Implement login form (Phase 1 requirement)

Yak-Shaving Path:
1. "I need to implement login form"
2. "But our form validation library is old"
3. "Let me upgrade to the latest version"
4. "Oh, the new version has breaking changes"
5. "Let me refactor all forms in the app to use new API"
6. "Wait, this form library doesn't support our design system"
7. "Let me research alternative form libraries"
8. "Actually, let me build a custom form framework"
9. [3 weeks later, no login form]

Direct Path:
1. "I need to implement login form"
2. "Current form library works fine for this use case"
3. [Login form complete in 1 day]
```

### Recognizing Yak-Shaving

**Red Flags**:

1. **"While I'm at it..."**
   - "While implementing login, I should refactor all auth code"
   - "While adding this chart, I should rewrite our chart abstraction"

2. **"This would be better if..."**
   - "This would be better if we used a different library"
   - "This would be better if we completely redesigned this"

3. **"Let me just..."**
   - "Let me just upgrade this dependency first"
   - "Let me just refactor this module first"

4. **Scope creep within a single issue**
   - Issue says: "Implement login button"
   - Work includes: New design system, new state management, new testing framework

5. **Solving problems that don't exist yet**
   - "We might need to support 10 million users someday, so let me optimize now"
   - "We might add feature X in 2 years, so let me make this super generic"

6. **Research with no time limit**
   - "I'm researching the best approach" (3 weeks later, still researching)

### Preventing Yak-Shaving

#### 1. Stick to Acceptance Criteria

**Before starting work**:
- Read acceptance criteria
- If criteria don't exist, request them
- ONLY do what's in acceptance criteria

**Example**:

```
Issue #127: Implement JWT Token Service

Acceptance Criteria:
- [ ] generateToken(userId) returns valid JWT
- [ ] verifyToken(token) validates signature
- [ ] 90%+ test coverage

NOT in Acceptance Criteria:
- ❌ Refactoring existing auth code
- ❌ Upgrading all dependencies
- ❌ Building generic token framework for future use
```

**If you think of "improvements" while working**:
1. Create a NEW issue for the improvement
2. Label it `phase-next` or `phase-future`
3. Return to current issue's acceptance criteria

#### 2. Time-Box Exploration

If you need to research or experiment:

1. **Define the question**: "Which form validation library: Formik vs. React Hook Form?"
2. **Set time limit**: "2 hours maximum"
3. **Define deliverable**: "1-page comparison document with recommendation"
4. **Timer starts NOW**: Use actual timer
5. **When timer ends**: Make decision with available info, move on

**Example**:

```
Research Task: Evaluate JWT libraries
Time Box: 2 hours
Deliverable: Recommendation document

Hour 1:
- List requirements (HS256 signing, token verification, expiration)
- Find 3 popular libraries (jsonwebtoken, jose, paseto)
- Read documentation for each

Hour 2:
- Create pros/cons table
- Check bundle size, security audit, maintenance status
- Make recommendation

2:00:00 - DONE
Decision: Use jsonwebtoken (most mature, best docs, smallest bundle)
Document saved: docs/research/jwt-library-comparison.md
Move on to implementation
```

#### 3. "Is This in the Spec?" Test

Before doing ANY work, ask:

**"Is this required by the specification for the current phase?"**

- If YES → Do it
- If NO → Don't do it (or create future issue)

**Example Decision Matrix**:

| Work Item | In Spec? | Phase? | Decision |
|-----------|----------|--------|----------|
| Implement JWT signing | ✅ Yes | Current | DO IT |
| Add refresh token endpoint | ✅ Yes | Current | DO IT |
| Refactor entire auth module | ❌ No | N/A | DON'T (create future issue if valuable) |
| Add OAuth support | ✅ Yes | Phase 2 | DON'T (deferred, not current phase) |
| Optimize for 1M users | ❌ No | N/A | DON'T (premature optimization) |

#### 4. Team Lead "Sanity Check"

If you've been working on a task for > 50% of estimate with < 25% progress:

**STOP and ask Team Lead**:

```
"I'm working on Issue #127 (JWT service).
 Estimated 3 days, I'm on day 2, but only 20% done.

 I've been:
 - Researching JWT libraries (4 hours)
 - Refactoring auth module structure (6 hours)
 - Trying to make token service super generic (4 hours)

 Should I continue this approach, or simplify?"
```

**Team Lead Response**:

```
"Stop. The spec just says 'implement JWT signing and verification.'

 Use jsonwebtoken library (industry standard).
 Don't refactor existing auth module (out of scope).
 Don't make it super generic (YAGNI - You Aren't Gonna Need It).

 Focus on acceptance criteria only:
 - generateToken() works
 - verifyToken() works
 - Tests pass

 Should take 1 more day, not 4 more days."
```

---

## ONBOARDING NEW TEAM MEMBERS

### The Legacy Overwhelm Problem

New team member joins, sees:
- 500+ GitLab issues
- Dozens of milestones
- Vague issue descriptions
- No clear starting point

**Result**: Paralysis, wasted time, wrong priorities

### The Solution: Onboarding Issue Navigation Guide

**Create**: `docs/NEW-TEAM-MEMBER-ONBOARDING.md`

**Contents**:

```markdown
# Welcome to Auto Discovery!

## Ignore 95% of GitLab

**Important**: We have years of legacy issues. IGNORE THEM.

**ONLY look at issues with these labels**:
- `phase-current` - Relevant to current 26-week phase
- `onboarding-friendly` - Good first issues for new team members

## Start Here

1. **Read these docs** (4 hours):
   - README.md (project overview)
   - GETTING-STARTED.md (development setup)
   - docs/PHASE-GOALS-2025-Q2.md (current phase goals)
   - WORKFLOW.md (how we work)

2. **Review current specifications** (4 hours):
   - specs/01-architectural-analysis.md
   - specs/auth/authentication-service.md (current phase focus)

3. **Pick your first issue** (from filtered list):
   GitLab search: `label:phase-current label:onboarding-friendly`

   Example first issues:
   - #156: "Add validation to login form" (2 days, clear spec)
   - #178: "Write E2E test for logout flow" (1 day, example provided)

4. **Set up your development environment** (2 hours):
   - Follow GETTING-STARTED.md
   - Build and run the app
   - Run tests

5. **Start working** (Week 2):
   - Follow WORKFLOW-QUICK-REFERENCE.md
   - Ask questions early and often
   - Update issues Friday by 2:00 PM

## What to IGNORE

- ❌ Milestones older than current phase
- ❌ Epics labeled "Legacy"
- ❌ Issues with no labels
- ❌ Issues labeled `phase-future`
- ❌ Anything not in Phase Goals document

## Questions?

- Technical questions: Ask in team chat
- Process questions: Ask Team Lead
- Spec clarifications: Comment on issue, tag Team Lead
```

### Onboarding Checklist for Team Lead

When new team member joins:

**Week 1**:
- [ ] Send link to NEW-TEAM-MEMBER-ONBOARDING.md
- [ ] Grant GitLab access
- [ ] Add to team chat
- [ ] Assign mentor (senior team member)
- [ ] Schedule 1-on-1 kickoff (30 min)

**Week 2**:
- [ ] Review first issue selection (is it appropriate?)
- [ ] Check in mid-week (blockers?)
- [ ] Review first merge request (learning opportunity)

**Week 3-4**:
- [ ] Gradually increase issue complexity
- [ ] Introduce to phase planning process
- [ ] Include in weekly work declaration

**Month 2**:
- [ ] Full contributor, no special treatment
- [ ] May mentor next new team member

---

## WEEKLY ISSUE HYGIENE

### Team Lead: Monday Morning Routine (30 minutes)

**9:00-9:15 AM: Review New Issues**

```bash
# GitLab search
created:>7d label:!phase-current label:!phase-next label:!phase-future
```

- Apply phase labels (current, next, future)
- Comment if missing acceptance criteria
- Assign to appropriate epic/milestone

**9:15-9:25 AM: Review Stale Issues**

```bash
# GitLab search
updated:<30d label:phase-current
```

- Check if still being worked on
- If blocked, identify blocker
- If abandoned, reassign or defer

**9:25-9:30 AM: Check for Yak-Shaving**

```bash
# GitLab search
updated:>1d assignee:@current-team-members
```

- Look at recent comments
- Red flag: "While I'm at it..." or "Let me just refactor..."
- Comment: "Is this in the acceptance criteria? If not, please create separate issue."

### Team Member: Friday Afternoon Routine (15 minutes)

**Before updating issues (1:45 PM)**:

1. **Review your issues**:
   - What did you actually accomplish this week?
   - What's still in progress?
   - Any blockers emerged?

2. **Close completed issues**:
   - Verify all acceptance criteria met
   - Add closing comment with summary
   - Link to merge request

3. **Update in-progress issues**:
   - Update % complete
   - Add notes on progress
   - Flag blockers

4. **Plan next week**:
   - Which issues will you work on?
   - Review phase alignment (all `phase-current`?)
   - Prepare for Monday work declaration

---

## TEMPLATES & CHECKLISTS

### Template: Issue Triage Comment

```markdown
## Triage Review - [Date]

**Quality Check**:
- [ ] Title is clear
- [ ] Context explains WHY
- [ ] Acceptance criteria are testable
- [ ] Spec reference provided
- [ ] Phase alignment indicated
- [ ] Estimate is realistic
- [ ] Dependencies identified

**Decision**: [phase-current | phase-next | phase-future | needs-info | close]

**Rationale**: [Explain decision]

**Action Required**: [What issue creator needs to do]

**Deadline**: [If requesting info, set deadline]
```

### Template: Legacy Issue Closure

```markdown
## Closure Notice

This issue is being closed as part of our legacy cleanup process.

**Reason**: [Select one]
- [ ] Overcome by events (requirements changed)
- [ ] No activity in 90+ days
- [ ] Duplicate of issue #[number]
- [ ] Out of scope for foreseeable future
- [ ] Vague/unmaintainable (no clear acceptance criteria)

**Context**: We're focusing on Phase 1 priorities (see docs/PHASE-GOALS-2025-Q2.md).
This issue doesn't align with current or next phase goals.

**If you believe this should remain open**:
1. Explain how it relates to current phase goals
2. Provide clear acceptance criteria
3. Reference relevant specification
4. We'll reconsider

**Otherwise**: This will remain closed. Reopen if it becomes relevant to a future phase.
```

### Template: Yak-Shaving Intervention

```markdown
## Scope Alert

I noticed this issue has expanded beyond the original acceptance criteria.

**Original Acceptance Criteria**:
- [List original criteria from issue description]

**Additional Work Being Done**:
- [List work not in acceptance criteria]

**Recommendation**:

1. **Focus on original acceptance criteria** to close this issue
2. **Create separate issues** for improvements:
   - Issue for: [Improvement 1]
   - Issue for: [Improvement 2]
3. **Label new issues** `phase-next` or `phase-future` for prioritization

**Why this matters**: We need to deliver Phase 1 scope on time. Scope creep
within individual issues delays the entire phase.

Let's sync to reprioritize if needed.
```

### Checklist: Phase Kickoff (Team Lead)

When starting a new 26-week phase:

- [ ] **Create Phase Goals Document** (docs/PHASE-GOALS-YYYY-QX.md)
  - Define primary objectives
  - List in-scope features
  - List explicitly out-of-scope features
  - Define success metrics

- [ ] **Create Phase Epic** in GitLab
  - Title: "Phase X - [Theme] (YYYY QX)"
  - Description links to Phase Goals doc
  - Due date set to phase end date

- [ ] **Create Phase Milestones** (4-6 milestones, each 4-6 weeks)
  - Milestone 1: Weeks 1-4
  - Milestone 2: Weeks 5-8
  - etc.

- [ ] **Triage All Open Issues**
  - Label with phase-current, phase-next, or phase-future
  - Move `phase-current` issues to phase epic
  - Defer `phase-next` and `phase-future` issues

- [ ] **Close Legacy Epics/Milestones**
  - Document learnings in epic/milestone description
  - Close with summary comment

- [ ] **Create Weekly Work Planning Issue**
  - Title: "Weekly Work Planning - Phase X"
  - Team members comment each Monday with planned work
  - Team Lead reviews and provides feedback

- [ ] **Communicate to Team**
  - Email with Phase Goals document
  - Kickoff meeting (1 hour)
  - Q&A session

- [ ] **Update ROADMAP.md** to reflect phase

---

## SUMMARY: How This Solves the Problem

### Before (The Mess)

- 500+ issues, unclear which are relevant
- Team members working on obsolete issues
- Team Lead has no visibility
- Yak-shaving common
- New team members overwhelmed

### After (The System)

**For Team Members**:
- ✅ Clear phase goals document defines scope
- ✅ GitLab labels indicate phase alignment
- ✅ Issue quality standards prevent vague work
- ✅ Weekly work declaration provides early feedback
- ✅ Onboarding guide helps new members navigate

**For Team Lead**:
- ✅ Weekly triage keeps issues clean
- ✅ Phase labels make priorities clear
- ✅ Work declaration provides visibility without micromanaging
- ✅ Intervention patterns prevent yak-shaving
- ✅ Can confidently report progress to Project Manager

**For Project**:
- ✅ Everyone working on phase-aligned goals
- ✅ Legacy issues archived, not cluttering workflow
- ✅ Clear acceptance criteria prevent misunderstandings
- ✅ 26-week phases delivered on time and in scope

---

## APPENDIX: Quick Reference

### GitLab Label System

| Label | Meaning | Who Applies |
|-------|---------|-------------|
| `phase-current` | Relevant to current 26-week phase | Team Lead (triage) |
| `phase-next` | Deferred to next phase | Team Lead (triage) |
| `phase-future` | Someday/maybe, no timeline | Team Lead (triage) |
| `phase-unclear` | Needs Team Lead decision | Anyone (Team Lead resolves) |
| `overcame-by-events` | No longer relevant | Team Lead (triage) |
| `onboarding-friendly` | Good first issue for new members | Team Lead |
| `blocked` | Cannot proceed, waiting on dependency | Issue assignee |
| `needs-spec` | No specification exists | Anyone |
| `yak-shaving` | Scope creep detected | Team Lead (warning flag) |

### Quick Decisions

| Situation | Decision |
|-----------|----------|
| Issue has no acceptance criteria | Don't start work, request criteria |
| Issue not labeled `phase-current` | Don't start work, check phase alignment |
| Issue not in Phase Goals doc | Ask Team Lead before starting |
| Tempted to add "while I'm at it" work | Create separate issue, stay focused |
| Research taking > 2 hours | Stop, make decision with available info |
| Issue > 50% over estimate | Alert Team Lead, may be yak-shaving |
| New issue created | Team Lead triages within 48 hours |
| Issue inactive 90+ days | Team Lead closes with notice |

---

**Document Version**: 1.0
**Last Updated**: [Date]
**Maintained By**: Team Lead
**Questions?**: Create GitLab issue with label `issue-management-question`

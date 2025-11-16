# Workflow & Team Organization
## Auto Discovery Project Management Framework

**Purpose**: Define workflow processes that maximize customer satisfaction, team autonomy, and project success.

**Audience**: Project Manager, Team Lead, Individual Contributors

**Philosophy**: Specification-driven development with expert autonomy and transparent progress tracking.

---

## TABLE OF CONTENTS

1. [Guiding Principles](#guiding-principles)
2. [Roles & Responsibilities](#roles--responsibilities)
3. [Specification-Driven Workflow](#specification-driven-workflow)
4. [Work Organization](#work-organization)
5. [Weekly Reporting Cycle](#weekly-reporting-cycle)
6. [Communication Patterns](#communication-patterns)
7. [Quality Gates](#quality-gates)
8. [Conflict Resolution](#conflict-resolution)
9. [Templates](#templates)

---

## GUIDING PRINCIPLES

### 1. Respect for Expertise

**Principle**: Trust domain experts to make technical decisions within their area of expertise.

**In Practice**:
- Team Lead provides **context and constraints**, not implementation details
- Experts propose **solutions** based on specifications
- Decisions are **documented** for team visibility
- Disagreements are resolved through **technical discussion**, not authority

**Example**:
```
❌ Bad: "Use bcrypt with 12 rounds for password hashing"
✅ Good: "Spec requires secure password hashing. What's your recommendation?"

Expert Response: "I recommend bcrypt with 10 rounds minimum (per spec).
                  For our threat model, 12 rounds provides better security
                  with acceptable performance (50ms per hash on our hardware)."
```

### 2. Specifications as Contract

**Principle**: Specifications are the **single source of truth** for what to build, not how to build it.

**Spec Defines**:
- ✅ **What**: Feature requirements, API contracts, behavior
- ✅ **Why**: Business justification, user needs
- ✅ **Constraints**: Performance targets, compatibility, security requirements
- ✅ **Acceptance Criteria**: How we know it's done

**Spec Does NOT Define**:
- ❌ **How**: Specific implementation approach (unless critical)
- ❌ **Who**: Assignment of work to individuals
- ❌ **When**: Specific completion dates (that's in ROADMAP)

**Example Spec Section**:
```markdown
## Requirement: Password Reset Flow

**What**: Users must be able to reset forgotten passwords via email

**Why**: Industry standard expectation; reduces support burden

**Constraints**:
- Reset token valid for 1 hour maximum
- Must use cryptographically secure random tokens
- Rate limit: 3 reset requests per 15 minutes per email

**Acceptance Criteria**:
- User receives email within 60 seconds
- Token works exactly once
- Expired tokens return clear error message
- 90%+ test coverage on reset flow

**Implementation Notes**:
Expert should choose token generation method, email service,
and database schema that meets constraints above.
```

### 3. Transparency Without Micromanagement

**Principle**: Make work visible without creating surveillance culture.

**How**:
- Work tracked in GitLab issues (what, not how fast)
- Weekly summaries focus on **accomplishments**, not hours worked
- Blockers are surfaced early, not hidden
- Time-boxing prevents scope creep, not productivity measurement

**Team Lead Role**: **Facilitator**, not supervisor
- "What do you need to complete this?"
- "Are there any blockers I can help remove?"
- "Does the spec provide enough clarity?"

**NOT**: "Why is this taking so long?" or "You should work faster"

### 4. Professional Autonomy with Accountability

**Principle**: Contributors are professionals who manage their own work, but commit to team success.

**Expectations**:
- ✅ Take ownership of assigned work
- ✅ Communicate blockers proactively
- ✅ Ask for help when stuck
- ✅ Deliver quality work per specs
- ✅ Update issues regularly (weekly minimum)

**Not Expected**:
- ❌ Work overtime regularly
- ❌ Know everything without asking
- ❌ Complete work at unrealistic pace
- ❌ Sacrifice quality for speed

### 5. Customer Success Through Iterative Delivery

**Principle**: Deliver working features incrementally to validate direction and build trust.

**Approach**:
- Implement in **phases** (per ROADMAP.md)
- Each phase delivers **demonstrable value**
- Customer sees **progress weekly**
- Feedback incorporated into **next iteration**

---

## ROLES & RESPONSIBILITIES

### Project Manager

**Primary Responsibilities**:
1. **Customer Liaison**: Understand customer needs, communicate progress
2. **Budget & Timeline**: Manage resources, set realistic expectations
3. **Risk Management**: Identify risks, escalate blockers
4. **Stakeholder Communication**: Weekly status to customer/management

**Inputs**:
- Weekly team summary from Team Lead
- Customer feedback and requirements
- Budget and timeline constraints

**Outputs**:
- Customer status reports
- Requirement clarifications
- Prioritization decisions (with Team Lead)

**NOT Responsible For**:
- Technical implementation decisions
- Day-to-day task assignment
- Code review or technical quality (that's the team)

---

### Team Lead

**Primary Responsibilities**:
1. **Specification Stewardship**: Ensure specs are clear, complete, actionable
2. **Work Coordination**: Help team organize work, remove blockers
3. **Progress Tracking**: Collect weekly accomplishments, surface issues
4. **Technical Facilitation**: Enable experts to do their best work

**Authority**: **None** (by design)

**Influence**: Through **expertise**, **facilitation**, **communication**

**Weekly Activities**:
- **Monday AM**: Share last week's summary + this week's plan with team (async, 5 min)
- **Wednesday**: Send reminder to team "Issue updates due Friday 2 PM" (1 min)
- **Mid-week**: Check-in on blockers (async unless urgent, 15-30 min)
- **Friday AM**: Send reminder "Issue updates due at 2 PM today" (1 min)
- **Friday 2:00-3:00 PM**: Compile weekly summary for Project Manager (60 min, strict time-box)
  - **Must send summary by 3:00 PM** (Project Manager has Monday customer meeting)

**Key Skills**:
- Active listening
- Asking good questions
- Summarizing technical work for non-technical audiences
- Recognizing when specs need refinement
- Knowing when to escalate vs. when team can self-resolve

**NOT Responsible For**:
- Telling experts how to do their work
- Performance reviews (not a manager)
- Enforcing deadlines (facilitates, doesn't mandate)

---

### Individual Contributors (Developers, Designers, QA, etc.)

**Primary Responsibilities**:
1. **Implement to Spec**: Build features exactly as specified
2. **Ask Questions**: Clarify ambiguities before implementing
3. **Update Progress**: Keep GitLab issues current
4. **Collaborate**: Help teammates, share knowledge
5. **Maintain Quality**: Tests, documentation, code review

**Autonomy**:
- Choose **how** to implement (within spec constraints)
- Manage own **schedule** (within phase timeline)
- Propose **spec improvements** when issues found
- Decide when to **ask for help**

**Accountability**:
- Commit to **realistic** timelines
- Communicate **blockers** proactively
- Deliver work that **meets spec**
- Participate in **code review**

**Example of Healthy Autonomy**:
```
Developer: "The auth spec requires rate limiting. I'm planning to use
            Redis for distributed rate limiting since we'll have 2+ backend
            replicas in k8s. I'll implement token bucket algorithm with
            5 requests per 15-minute window as specified. Estimated 3 days
            including tests. Any concerns?"

Team Lead: "Sounds good. Document the Redis dependency in the deployment
            section of the spec. Let me know if you hit issues."
```

---

## SPECIFICATION-DRIVEN WORKFLOW

### Specification Lifecycle

```
1. DRAFT → 2. REVIEW → 3. APPROVED → 4. IMPLEMENTATION → 5. MAINTENANCE
```

#### 1. DRAFT Phase

**Who**: Domain expert(s) with input from Team Lead

**Activities**:
- Research existing systems (if greenfield rebuild)
- Define requirements (what, why, constraints)
- Document API contracts, data models
- Include examples and test scenarios
- Identify dependencies on other specs

**Output**: Draft specification in `specs/` directory

**Example**: `specs/auth/authentication-service.md` (DRAFT)

**Checklist**:
- [ ] Clear scope definition
- [ ] Acceptance criteria defined
- [ ] Dependencies identified
- [ ] Examples included
- [ ] Novice-friendly explanations (where applicable)

---

#### 2. REVIEW Phase

**Who**: Team (all contributors invited)

**Activities**:
- **Technical Review**: Is spec technically sound?
- **Completeness Review**: Any missing requirements?
- **Clarity Review**: Can implementers understand it?
- **Feasibility Review**: Can we build this with resources available?

**Format**: Async (GitLab merge request) with optional sync discussion

**Review Checklist**:
- [ ] Spec matches customer requirements
- [ ] API contracts are complete
- [ ] Data models are well-defined
- [ ] Security considerations addressed
- [ ] Performance requirements stated
- [ ] Testing strategy included
- [ ] No ambiguities remain

**Time-box**: 3 business days for review

**Outcome**: Approved, Needs Revision, or Rejected (rare)

---

#### 3. APPROVED Phase

**Who**: Team Lead (facilitates consensus, not dictator)

**Criteria for Approval**:
- All technical concerns addressed
- Team consensus reached (not unanimous, but no blocking concerns)
- Project Manager confirms alignment with customer needs

**Actions**:
- Mark spec as `APPROVED` (update status in document)
- Add to ROADMAP.md with phase assignment
- Create GitLab epic/issues for implementation

---

#### 4. IMPLEMENTATION Phase

**Who**: Individual contributors (assigned or self-selected)

**Process**:
1. Create feature branch: `feat/feature-name`
2. Implement **exactly to spec** (deviations must be documented)
3. Write tests (coverage targets per CONTRIBUTING.md)
4. Create merge request with spec reference
5. Code review by peer(s)
6. Merge to main

**Spec Deviations**:
If spec is **ambiguous** or **infeasible**:
1. Create GitLab issue documenting the problem
2. Propose solution with justification
3. Get Team Lead + relevant expert approval
4. Document decision in **both** code and spec
5. Continue implementation

**Example Deviation**:
```
Issue #42: Auth Spec - Rate Limiting Implementation Detail

Spec says: "Implement rate limiting for login endpoint"
Problem: Spec doesn't specify how to handle distributed rate limiting
         across 2 backend replicas.

Proposed Solution: Use Redis for distributed rate limit state.
Justification: We already use Redis for session storage. Atomic INCR
               operations provide accurate counting across replicas.
Alternative Considered: PostgreSQL, but would create DB bottleneck.

Decision: APPROVED by Team Lead + Backend Expert
Action: Update spec Section 7.2 to document Redis requirement
```

---

#### 5. MAINTENANCE Phase

**Who**: Anyone who finds issues

**Activities**:
- Update spec when requirements change
- Clarify ambiguities found during implementation
- Document learnings from production

**Process**:
- Small clarifications: Create merge request
- Significant changes: Follow DRAFT → REVIEW → APPROVED cycle

---

### Specification Quality Standards

Every spec must include:

1. **Executive Summary** (2-3 paragraphs)
   - What is being built
   - Why it matters
   - High-level approach

2. **Requirements** (WHAT and WHY)
   - User stories or use cases
   - Business justification
   - Success criteria

3. **Technical Design** (HOW, high-level)
   - Architecture overview
   - API contracts
   - Data models
   - Integration points

4. **Constraints & Non-Functional Requirements**
   - Performance targets
   - Security requirements
   - Compatibility requirements
   - Accessibility standards

5. **Testing Strategy**
   - Unit test scenarios
   - Integration test scenarios
   - E2E test scenarios
   - Coverage targets

6. **Implementation Phases** (optional for complex features)
   - Breakdown into deliverable increments
   - Dependencies between phases
   - Estimated effort (story points or time)

7. **Appendices**
   - Glossary (for novice-friendly specs)
   - Examples
   - Reference materials

---

## WORK ORGANIZATION

### GitLab Issue Structure

```
Epic: Authentication & Authorization System
│
├── Issue: Implement JWT Token Service (Backend)
│   ├── Spec: specs/auth/authentication-service.md, Section 5.1
│   ├── Estimate: 3 days
│   ├── Assignee: (self-assigned or Team Lead suggests)
│   ├── Labels: backend, authentication, phase-1
│   └── Acceptance Criteria:
│       - [ ] generateToken() method implemented
│       - [ ] verifyToken() method implemented
│       - [ ] 90%+ test coverage
│       - [ ] Integration test with login endpoint
│
├── Issue: Implement Auth Middleware (Backend)
│   ├── Spec: specs/auth/authentication-service.md, Section 5.2
│   ├── Estimate: 2 days
│   └── ...
│
├── Issue: Implement AuthService (Frontend)
│   ├── Spec: specs/auth/authentication-service.md, Section 6.1
│   └── ...
│
└── Issue: Implement AuthGuard (Frontend)
    └── ...
```

### Work Assignment Philosophy

**Preference Order**:
1. **Self-Selection**: Contributor volunteers (ideal)
2. **Suggestion**: Team Lead suggests based on expertise
3. **Discussion**: Team discusses who's best suited
4. **Assignment**: Last resort, Team Lead assigns

**Why Self-Selection?**
- Increases ownership and motivation
- Respects contributor autonomy
- Leverages hidden expertise/interest

**Example**:
```
Team Lead (Monday standup):
"We have 3 new issues for auth implementation. JWT service, middleware,
and frontend guard. Anyone interested in picking these up?"

Developer A: "I'll take the JWT service. I've worked with jsonwebtoken
              library before."

Developer B: "I can do the middleware. Should integrate nicely with the
              error handling I built last week."

Team Lead: "Great. The frontend guard is still open. Developer C, would
            you be interested? I know you're wrapping up the table
            component this week."

Developer C: "Sure, I can start it mid-week after table PR is merged."
```

### Time-Boxing Vague Work

Some work is **exploratory** or **research-oriented** without clear completion criteria.

**Solution**: Time-box instead of defining completion.

**Example**:
```
Issue: Research MFA Options for Future Enhancement

Time-box: 4 hours maximum
Goal: Produce 1-page summary comparing TOTP, SMS, and WebAuthn
Deliverable: Recommendation document in docs/research/mfa-options.md

Acceptance Criteria:
- Document includes pros/cons of each approach
- Security considerations noted
- Integration complexity estimated (high/medium/low)
- Recommendation stated with justification
```

**Benefits**:
- Prevents scope creep
- Provides clear stopping point
- Respects contributor's time
- Deliverable is still useful (research doc, not implementation)

---

## WEEKLY REPORTING CYCLE

### Weekly Timeline Overview

```
Monday Morning:
├─ Project Manager: Customer/Management meeting
│                   (uses Friday's prepared presentation)
└─ Team Lead: Shares last week summary + this week plan with team (async)

Tuesday-Thursday:
├─ Team Members: Work on assigned tasks
├─ Team Lead: Mid-week check-ins, remove blockers
└─ All: Update GitLab issues as work progresses

Wednesday:
└─ Team Lead: Send reminder "Issue updates due Friday 2 PM"

Friday Morning:
└─ Team Lead: Send reminder "Issue updates due at 2 PM today"

Friday 2:00 PM:
└─ **DEADLINE**: Team Members update GitLab issues
                  (Status, % complete, blockers, notes)

Friday 2:00-3:00 PM:
└─ Team Lead: Compile weekly summary
              (Review issues, identify patterns, write summary)

Friday 3:00 PM:
└─ **DEADLINE**: Team Lead sends summary to Project Manager

Friday 3:00-5:00 PM:
└─ Project Manager: Prepare for Monday customer/management meeting
                    (Review all teams, aggregate, translate to business value)

→ Cycle repeats Monday morning
```

---

### Friday 2:00 PM: Team Members Update Issues

**Deadline**: Every contributor updates their GitLab issues by **2:00 PM Friday**

**Why 2:00 PM?** Team Lead needs time to compile summary by 3:00 PM for Project Manager, who prepares for Monday customer/management meetings.

**What to Update**:
- **Status**: In Progress, Blocked, Ready for Review, Done
- **% Complete**: Rough estimate (0%, 25%, 50%, 75%, 100%)
- **Blockers**: Any issues preventing progress
- **Notes**: Brief summary of work done this week

**Time Required**: 5-10 minutes per issue

**Reminder Strategy**:
- Team Lead sends reminder Wednesday: "Reminder: Issue updates due Friday 2 PM"
- Team Lead sends reminder Friday morning: "Issue updates due at 2 PM today - please prioritize"

**Example Issue Update**:
```
Issue #127: Implement JWT Token Service

Status: In Progress (75% complete)

This Week:
- Implemented generateToken() method
- Implemented verifyToken() method
- Added unit tests (25/30 scenarios covered)
- Integrated with login endpoint

Next Week:
- Complete remaining 5 test scenarios
- Add integration tests
- Update documentation

Blockers: None
```

---

### Friday 3:00 PM: Team Lead Compiles Weekly Summary

**Deadline**: Summary sent to Project Manager by **3:00 PM Friday**

**Why 3:00 PM?** Project Manager needs summaries from all Team Leads to prepare for Monday customer/management meetings. Late submissions delay customer communication.

**Input**: All updated GitLab issues (due 2:00 PM)

**Process** (complete between 2:00 PM - 3:00 PM):
1. Review all issue updates (2:00-2:15 PM)
2. Identify patterns (common blockers, areas of progress) (2:15-2:30 PM)
3. Summarize accomplishments (team-level, no names) (2:30-2:45 PM)
4. Compile planned work for next week (2:45-2:55 PM)
5. Add optional kudos for exceptional work (with names) (2:55-3:00 PM)
6. Send to Project Manager by 3:00 PM

**Output**: Weekly summary document for Project Manager (see template below)

**Time Required**: 60 minutes (strict time-box)

**If issues missing at 2:00 PM**:
- Quickly ping individuals with missing updates
- If no response by 2:30 PM, note in summary: "Issue #127 - no update this week (contributor unresponsive)"
- Don't delay summary waiting for stragglers

---

### Weekly Summary Template

See [Templates](#weekly-summary-to-project-manager) section below.

---

### Friday 3:00-5:00 PM: Project Manager Prepares for Monday

**Deadline**: Receive all Team Lead summaries by **3:00 PM Friday**

**Process** (3:00 PM - 5:00 PM Friday):
1. Review summaries from all Team Leads (3:00-3:30 PM)
2. Identify cross-team patterns, blockers, risks (3:30-4:00 PM)
3. Prepare customer/management presentation (4:00-5:00 PM)
   - Translate technical accomplishments to business value
   - Aggregate progress across all teams
   - Highlight risks and mitigation plans
   - Prepare asks/needs from customer

**Output**: Customer status presentation for Monday meeting

**If Team Lead summary missing at 3:00 PM**:
- Immediately contact Team Lead
- If no response by 3:30 PM, escalate to management
- Use previous week's data as fallback (note as "unconfirmed" in presentation)

---

### Monday: Team Lead Shares Summary & Planned Work

**Format**: Async (GitLab comment, wiki page, or email)

**Contents**:
- What we accomplished last week
- What we're working on this week
- Any team-wide announcements or changes

**Purpose**:
- Team sees their collective progress
- Everyone knows what others are working on
- Creates shared context

**Time Required**: 5 minutes for team to read

---

## COMMUNICATION PATTERNS

### 1. Async-First, Sync When Needed

**Default**: Async communication (GitLab comments, wiki, email)

**When to Go Sync** (meeting, call, instant message):
- Urgent blocker affecting multiple people
- Complex technical discussion with many back-and-forth
- Conflict that needs real-time resolution
- Design decision requiring whiteboarding

**Example**:
```
❌ Bad: Schedule 1-hour meeting to discuss variable naming
✅ Good: Post naming proposal in GitLab, async discussion,
         decide in 24 hours

❌ Bad: Send Slack message "we need to talk" (anxiety-inducing)
✅ Good: "Quick question about auth middleware - can we use a
         shared secret for all environments or do we need
         env-specific secrets? Thoughts in #123 when you have time."

✅ Good (Sync): "Redis is down in staging and blocking 3 people.
                Can we jump on a call to troubleshoot?"
```

### 2. Documentation Over Meetings

**Principle**: If it's important, write it down.

**Examples**:
- Spec clarification → Update spec document
- Design decision → Document in ADR (Architecture Decision Record)
- Process change → Update WORKFLOW.md (this doc)

**Benefits**:
- Searchable
- Versioned
- Accessible to future team members
- No "I wasn't in that meeting" excuses

### 3. Escalation Path

```
Level 1: Team Self-Resolution (default)
  ↓ (if unresolved after 2 days)
Level 2: Team Lead Facilitation
  ↓ (if still unresolved or needs external input)
Level 3: Project Manager / Customer Input
```

**Example Escalation**:
```
Day 1: Developer A and Developer B disagree on auth token storage
       (localStorage vs. httpOnly cookies)

Day 2: Discussion continues in GitLab issue #145

Day 3: Team Lead steps in: "Let's evaluate against our security
       requirements in the spec. Per Section 8.2, we need XSS
       protection. httpOnly cookies provide that, localStorage doesn't.
       Developer A, does that resolve your concern?"

If yes → Resolved at Level 2
If no → "Let me bring this to Project Manager. There may be a
        customer requirement we're not aware of."
```

### 4. Question-Asking Culture

**Principle**: No question is stupid. Ambiguity is the enemy.

**Encouraged**:
- "I don't understand section 3.2 of the spec. Can someone clarify?"
- "Is this the right approach, or am I overthinking it?"
- "I'm stuck on X. Can someone pair with me for 30 minutes?"

**Team Lead Response**:
- ✅ "Great question. Let me clarify..."
- ✅ "I don't know. Let's find someone who does."
- ✅ "That ambiguity is in the spec. Let me update it."

**NOT**:
- ❌ "You should know this already."
- ❌ "Read the spec more carefully."
- ❌ "Figure it out yourself."

---

## QUALITY GATES

### Definition of Done

Work is **not done** until all criteria are met:

**For Features**:
- [ ] Implemented per specification
- [ ] Unit tests written (coverage meets target per CONTRIBUTING.md)
- [ ] Integration tests written (where applicable)
- [ ] E2E tests written (for critical paths)
- [ ] Code reviewed by peer(s)
- [ ] Documentation updated (JSDoc, README, etc.)
- [ ] No TypeScript errors (strict mode)
- [ ] ESLint passing
- [ ] Manually tested in dev environment
- [ ] Spec updated if implementation deviated

**For Specs**:
- [ ] Peer reviewed (3+ business days)
- [ ] Technical concerns addressed
- [ ] Customer requirements validated (by Project Manager)
- [ ] Acceptance criteria defined
- [ ] Examples included
- [ ] Dependencies identified

### Code Review Standards

**Purpose**: Knowledge sharing, quality improvement, bug prevention

**NOT**: Gatekeeping, nitpicking, showing off knowledge

**Reviewer Responsibilities**:
- Review within 24 hours (or notify if unable)
- Provide **constructive** feedback
- Ask questions, don't make demands
- Approve if concerns are addressed

**Author Responsibilities**:
- Provide context in MR description
- Reference spec sections
- Respond to feedback promptly
- Don't take feedback personally

**Good Code Review Comment**:
```
✅ "This looks like it duplicates logic from auth.service.ts.
    Could we extract a shared helper function?"

✅ "Per the spec, we need rate limiting here. Is that handled
    elsewhere, or should we add it?"

✅ "Nice solution! One question: how does this handle the case
    where the token is expired?"
```

**Bad Code Review Comment**:
```
❌ "This is wrong."
❌ "Did you even read the spec?"
❌ "I would never write it this way."
```

---

## CONFLICT RESOLUTION

### Technical Disagreements

**Principle**: Specs are the tie-breaker.

**Process**:
1. Review relevant spec section together
2. If spec is clear → Follow spec
3. If spec is ambiguous → Document both options, escalate to Team Lead
4. Team Lead facilitates decision (may involve domain expert or Project Manager)
5. Decision is documented in spec and code

**Example**:
```
Conflict: Should we use cookies or localStorage for JWT tokens?

Developer A: "localStorage is easier to work with in Angular"
Developer B: "Cookies are more secure against XSS"

Team Lead: "Let's check the spec... Section 8.2 says 'Tokens must be
            protected against XSS attacks.' Developer B, can you
            elaborate on why cookies are more secure?"

Developer B: "httpOnly cookies can't be accessed by JavaScript,
              preventing XSS token theft. localStorage is readable
              by any script on the page."

Team Lead: "Developer A, does that address your ease-of-use concern?"

Developer A: "Yes, I can work with cookies. I wasn't aware of the
              XSS protection requirement."

Resolution: Use httpOnly cookies per security spec requirements.
Action: Document decision in auth spec Section 6.3.
```

### Scope Creep

**Warning Signs**:
- "While we're at it, we should also..."
- "This would be better if..."
- Feature takes 2x longer than estimated

**Response**:
1. Acknowledge the idea has merit
2. Separate from current work
3. Create new issue for future consideration
4. Return focus to spec requirements

**Example**:
```
Developer: "I'm implementing the login form, and I think we should
            add social login (Google, GitHub) while we're at it."

Team Lead: "That's a great feature idea. The current spec only
            covers username/password login for MVP. Let's create
            an issue to discuss social login for Phase 2. For now,
            let's complete the spec as written so we can get user
            feedback on the core flow first."

Action: Create Issue #234: "Evaluate Social Login for Phase 2"
```

### Interpersonal Conflicts

**Principle**: Assume good intent. Focus on work, not people.

**If conflict arises**:
1. Team Lead facilitates private discussion (1-on-1 or mediation)
2. Focus on **behaviors**, not personalities
3. Find common ground (we all want project to succeed)
4. Agree on working norms going forward
5. Escalate to Project Manager only if unresolvable

**Example**:
```
Developer A feels Developer B is "always rejecting their code reviews"

Team Lead (to Developer B): "I've noticed your code review feedback
  on A's MRs is quite detailed. Can you help me understand your
  review process?"

Developer B: "I just want to make sure we catch issues early.
  I thought that's what code review is for?"

Team Lead: "Absolutely. The feedback is valuable. One thought: could
  we frame comments as questions rather than statements? Instead of
  'This is wrong,' try 'How does this handle case X?' It invites
  discussion rather than sounding like criticism."

Developer B: "I can do that. I didn't realize it was coming across
  negatively."

Team Lead (to Developer A): "Developer B is going to work on the tone
  of review feedback. On your side, can you make sure MR descriptions
  include context about your approach? It helps reviewers understand
  your thinking."

Developer A: "Yeah, I can add more detail."

Resolution: Both sides adjust behavior. Team Lead monitors next few MRs.
```

---

## TEMPLATES

### Weekly Summary to Project Manager

```markdown
# Auto Discovery - Weekly Team Summary
**Week of**: [Start Date] - [End Date]
**Prepared by**: [Team Lead Name]
**Team Size**: [X developers, Y designers, Z QA, etc.]

---

## ACCOMPLISHMENTS THIS WEEK

### Phase 1: Foundation (Week X of Y)

**Backend**:
- Completed JWT authentication service with token generation, verification, and refresh capabilities (Issue #127)
- Implemented auth middleware for route protection with role and domain checks (Issue #128)
- Added rate limiting for login endpoint (5 attempts per 15 minutes) using Redis (Issue #130)
- All backend auth endpoints deployed to staging and tested successfully

**Frontend**:
- Completed AuthService with login, logout, and token refresh methods (Issue #145)
- Implemented AuthGuard for route protection based on roles and domains (Issue #146)
- Built login component with form validation and error handling (Issue #147)

**Infrastructure**:
- Created Kubernetes Secret for JWT signing key (Issue #152)
- Updated backend deployment with auth environment variables (Issue #153)

**Testing**:
- Backend: 92% test coverage on auth services (target: 80%)
- Frontend: 85% test coverage on auth components (target: 70%)
- E2E: Login flow tested successfully in staging environment

**Documentation**:
- Updated authentication specification with Redis dependency details (Spec Amendment #42)

---

## BLOCKERS & RISKS

**Resolved This Week**:
- Redis connectivity issue in staging environment (resolved by DevOps on Wednesday)

**Current Blockers**:
- None

**Risks**:
- Frontend login component waiting on final UX design approval from customer (expected Monday)
- Minor risk: May delay Phase 1 completion by 2-3 days if major design changes requested

---

## PLANNED WORK FOR NEXT WEEK

### Phase 1: Foundation (Completion)

**Backend**:
- Implement user management endpoints (create, read, update, delete users) - 3 days
- Add default admin user bootstrapping on first startup - 1 day
- Create Elasticsearch index for user storage - 1 day

**Frontend**:
- Finalize login component with approved UX design - 1 day
- Implement user profile component - 2 days
- Add logout functionality to main navigation - 0.5 days

**Testing**:
- E2E tests for complete authentication flow (login, logout, protected routes) - 2 days
- Load testing for rate limiting and concurrent authentication - 1 day

**Documentation**:
- Update deployment guide with authentication setup instructions - 0.5 days

**Goal**: Complete Phase 1 (Foundation) by EOD Friday, ready for customer demo

---

## KUDOS & RECOGNITION

**Developer [Name]**: Excellent work on the JWT service implementation. Code was clean, well-tested (95% coverage), and included comprehensive JSDoc comments. The PR description clearly referenced the spec and explained implementation choices. This is exactly the standard we want to maintain.

**Developer [Name]**: Proactively identified ambiguity in auth spec regarding distributed rate limiting, proposed a solution with clear justification, and documented the decision. Great example of specification-driven development in action.

---

## METRICS

**Velocity**:
- Issues completed: 12
- Story points completed: 28 (estimated) vs. 25 (planned) - 112% of plan

**Quality**:
- Code coverage: 88% overall (target: 75%)
- Bugs found in staging: 2 (both fixed within 24 hours)
- Spec deviations: 1 (documented and approved)

**Team Health**:
- All team members updated issues by Friday
- No escalated conflicts
- 2 pair programming sessions initiated by team (knowledge sharing)

---

## NOTES FOR PROJECT MANAGER

- Phase 1 is 90% complete. On track for completion next week.
- Customer feedback on authentication spec was positive (received Tuesday).
- Team morale is high. Self-organization working well.
- Recommend scheduling customer demo for Friday afternoon to showcase authentication flow.

---

**Next Report**: [Next Friday's Date]
```

---

### GitLab Issue Template

```markdown
## Summary
[Brief 1-2 sentence description of what needs to be done]

## Specification Reference
- **Spec**: [specs/path/to/spec.md](../specs/path/to/spec.md)
- **Section**: X.Y - Section Title
- **Link**: [Direct link to section if available]

## Context
[Why this work is needed. How it fits into the larger feature/project.]

## Acceptance Criteria
- [ ] Criterion 1 (must be testable/verifiable)
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Tests written (unit, integration, E2E as applicable)
- [ ] Code reviewed and approved
- [ ] Documentation updated

## Implementation Notes
[Optional: Hints, constraints, or approaches to consider. NOT prescriptive.]

## Dependencies
[Other issues that must be completed first, or related issues]
- Blocks: #XXX
- Blocked by: #YYY
- Related: #ZZZ

## Estimate
[Story points or time estimate: 1 day, 3 days, etc.]

## Labels
`phase-1` `backend` `authentication` [etc.]

## Assignee
[Leave blank for self-selection, or Team Lead can suggest]

---

**For Team Member Updates** (update weekly):

### Progress This Week
[What was accomplished]

### Status
[In Progress / Blocked / Ready for Review / Done]

### % Complete
[0% / 25% / 50% / 75% / 100%]

### Blockers
[Any issues preventing progress, or "None"]

### Next Steps
[What will be worked on next]
```

---

### Spec Deviation Documentation Template

```markdown
## Spec Deviation: [Brief Title]

**Issue**: #XXX
**Spec**: [specs/path/to/spec.md](../specs/path/to/spec.md), Section X.Y
**Date**: YYYY-MM-DD
**Approved By**: [Team Lead + Domain Expert names]

---

### Spec Requirement (Original)
[Quote the exact spec language]

```
Example: "Implement rate limiting for login endpoint"
```

### Problem Identified
[Describe the ambiguity, infeasibility, or issue encountered]

**Example**:
The spec does not specify how to implement distributed rate limiting across 2 backend replicas in Kubernetes. If each replica maintains its own counter, a user could make 5 login attempts to replica A and 5 to replica B (10 total), bypassing the 5-attempt limit.

### Proposed Solution
[Describe the implementation approach that deviates from or clarifies the spec]

**Example**:
Use Redis for distributed rate limit state. Each login attempt increments a key in Redis with atomic INCR operations. All replicas check the same Redis key, ensuring accurate counting across the cluster.

### Justification
[Why this solution is appropriate]

**Example**:
- Redis already used for session storage (no new dependency)
- Atomic operations guarantee accuracy
- Low latency (< 5ms per check)
- Scales with backend replicas

### Alternatives Considered
[Other approaches evaluated and why they were rejected]

**Example**:
- **PostgreSQL**: Would create database bottleneck and add latency
- **In-memory per replica**: Allows circumvention of rate limit
- **Sticky sessions**: Increases system complexity and reduces scalability

### Decision
**APPROVED** / REJECTED / NEEDS REVISION

### Action Items
- [ ] Update spec Section X.Y to document Redis requirement
- [ ] Update k8s deployment to ensure Redis is available
- [ ] Document Redis configuration in deployment guide
- [ ] Add comment in code referencing this decision (Issue #XXX)

### Spec Update
[Link to MR or commit that updates the spec]

MR: !YYY - Update auth spec to document distributed rate limiting approach
```

---

### Architecture Decision Record (ADR) Template

For significant technical decisions not covered by specs.

```markdown
# ADR-XXX: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Proposed / Accepted / Rejected / Superseded
**Deciders**: [Names of people involved in decision]
**Related Issues**: #XXX, #YYY

---

## Context
[Describe the problem or situation requiring a decision]

**Example**:
We need to choose a state management approach for the Angular frontend. The spec requires URL-first state management, but doesn't specify the internal state management library.

## Decision Drivers
[Factors influencing the decision]

- Spec requirement for URL synchronization
- Team familiarity
- Bundle size impact
- Complexity vs. power trade-off
- Long-term maintainability

## Options Considered

### Option 1: NgRx (Redux pattern)
**Pros**:
- Industry standard
- Powerful DevTools
- Time-travel debugging

**Cons**:
- Steep learning curve
- Significant boilerplate
- Large bundle size (+200KB)
- Overkill for our use case

### Option 2: BehaviorSubject + Services (Lightweight)
**Pros**:
- Minimal boilerplate
- Team already familiar
- Small bundle size
- Easy to sync with URL

**Cons**:
- No DevTools
- Manual debugging
- Less opinionated (could lead to inconsistency)

### Option 3: Akita (Middle ground)
**Pros**:
- Less boilerplate than NgRx
- Decent DevTools
- Good documentation

**Cons**:
- Another dependency to maintain
- Team unfamiliar
- Moderate bundle size (+50KB)

## Decision
**Option 2: BehaviorSubject + Services**

We will use lightweight RxJS-based state management with BehaviorSubjects in services, following the pattern in `specs/04-state-management-specification.md`.

## Rationale
1. Spec emphasizes **URL as source of truth**. Complex state libraries add overhead for minimal benefit in our use case.
2. Team is already proficient with RxJS and Angular services.
3. Minimal bundle size impact (critical for performance target).
4. Simpler mental model for greenfield project.
5. Can refactor to NgRx later if complexity increases (unlikely based on spec).

## Consequences

**Positive**:
- Fast implementation
- No learning curve
- Small bundle size
- Easy to understand for new developers

**Negative**:
- Manual state synchronization with URL (mitigated by UrlStateService)
- No time-travel debugging (use browser DevTools instead)
- Potential for inconsistent patterns (mitigated by code review and examples in specs)

**Mitigation**:
- Document state management pattern in CONTRIBUTING.md
- Provide code examples in specs
- Enforce pattern in code reviews

## Follow-Up
- Create example state service demonstrating the pattern (Issue #XXX)
- Update CONTRIBUTING.md with state management guidelines (Issue #YYY)
- Review decision after Phase 2 completion (3 months)

---

**Superseded By**: [ADR-XXX if this decision is later reversed]
```

---

## SUMMARY: MAXIMIZING CUSTOMER SATISFACTION

### The Formula

```
Customer Satisfaction = f(Quality, Progress Transparency, Delivered Value)

Quality = Spec Fidelity × Code Quality × Test Coverage
Progress Transparency = Weekly Updates × Honest Communication × No Surprises
Delivered Value = Working Features × User Feedback × Iterative Improvement
```

### How This Workflow Achieves It

**1. Quality Through Specifications**
- Specs define "done" before coding starts
- Peer review catches issues early
- Test coverage ensures reliability
- Code review maintains standards

**2. Transparency Through Weekly Reporting**
- Customer sees progress every week (via Project Manager)
- Blockers surfaced early, not at deadline
- Honest estimates, not optimistic promises
- Team accomplishments celebrated

**3. Value Through Iterative Delivery**
- Phased implementation (per ROADMAP.md)
- Working features demonstrated regularly
- Customer feedback incorporated
- Course corrections early and often

### What Makes People More Than "Cogs"

**Autonomy**:
- Choose **how** to implement (within spec constraints)
- Self-select work when possible
- Manage own schedule
- Propose improvements

**Mastery**:
- Work on challenging problems
- Learn new technologies
- Grow expertise
- Share knowledge through code review and specs

**Purpose**:
- Understand **why** features matter (specs explain business value)
- See impact of work (customer demos, usage metrics)
- Contribute to project success
- Recognition for excellent work (kudos in weekly reports)

**Respect**:
- Expertise valued over hierarchy
- Questions encouraged
- Mistakes are learning opportunities
- Work-life balance maintained (no overtime culture)

---

## FINAL THOUGHTS

This workflow is a **living document**. As the team discovers what works and what doesn't:

1. **Propose changes** via GitLab issue or MR
2. **Discuss as team** (async preferred)
3. **Update this document** when consensus reached
4. **Communicate changes** to everyone

**The goal**: Not perfection, but **continuous improvement**.

**The measure**: Happy team building great software for satisfied customers.

---

**Good luck and Godspeed!** 🚀

---

**Document Version**: 1.0
**Last Updated**: [Date]
**Maintained By**: Team Lead
**Questions?**: Create GitLab issue with label `workflow`

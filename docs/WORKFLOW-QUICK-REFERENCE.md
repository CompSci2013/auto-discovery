# Workflow Quick Reference
## Auto Discovery Project - Common Scenarios

**Full Documentation**: See [WORKFLOW.md](./WORKFLOW.md)

This is a **quick reference** for common scenarios. For detailed processes, consult the main workflow document.

---

## FOR INDIVIDUAL CONTRIBUTORS

### "I'm starting a new task"

1. ✅ Read the relevant spec section **first**
2. ✅ Create feature branch: `feat/feature-name`
3. ✅ Self-assign GitLab issue (or ask Team Lead if unsure)
4. ✅ Ask questions if spec is unclear (before coding!)
5. ✅ Update issue status to "In Progress"

**Time investment**: 10-15 minutes of planning saves hours of rework.

---

### "The spec is ambiguous"

**DO**:
1. Create GitLab issue documenting the ambiguity
2. Propose 2-3 possible interpretations
3. Tag Team Lead and relevant domain expert
4. Wait for clarification (usually < 24 hours)
5. Document decision in spec and code

**DON'T**:
- ❌ Guess and implement wrong interpretation
- ❌ Implement "what makes sense" without checking
- ❌ Skip documentation of the decision

**Example**:
```
Issue #245: Auth Spec Ambiguity - Token Expiration Handling

Spec says: "Tokens expire after 8 hours"
Question: What happens when user makes request with expired token?

Option 1: Return 401, force re-login
Option 2: Auto-refresh token if within grace period
Option 3: Return 401, frontend auto-attempts refresh

Which approach should we use?

@team-lead @backend-expert
```

---

### "I'm blocked"

**If blocked < 2 hours**: Keep trying, search documentation, ask peer

**If blocked > 2 hours**:
1. Update GitLab issue with "Blocked" status
2. Describe blocker clearly
3. Tag Team Lead
4. Work on something else while waiting

**Example Blocker Updates**:
```
✅ Good: "Blocked: Redis connection failing in staging.
         Error: ECONNREFUSED. Verified Redis pod is running.
         Suspect network policy issue. Need DevOps help."

❌ Bad: "Blocked: Redis doesn't work."
```

**Team Lead Response Time**: < 4 hours during business hours

---

### "I need to deviate from the spec"

**Small deviation** (implementation detail):
- Document in code comment
- Mention in PR description
- No spec update needed

**Example**:
```typescript
// Using Map instead of Array for O(1) lookup performance.
// Spec doesn't specify data structure, only behavior.
private cache = new Map<string, CacheEntry>();
```

**Significant deviation** (changes behavior or requirements):
- Follow [Spec Deviation Process](./WORKFLOW.md#spec-deviation-documentation-template)
- Get approval before merging
- Update spec document

---

### "Friday 2:00 PM - time to update issues"

**DEADLINE: 2:00 PM Friday** (strict - takes 5-10 minutes)

**Why 2:00 PM?** Team Lead compiles summary by 3:00 PM for Project Manager, who has Monday customer meeting.

For each assigned issue:
1. Update status: `In Progress` / `Blocked` / `Ready for Review` / `Done`
2. Add % complete estimate: `25%` / `50%` / `75%` / `100%`
3. Add brief note on progress this week
4. List blockers (or "None")
5. Note what you'll work on next week

**Why this matters**:
- Team Lead needs this by 3:00 PM for Project Manager
- Project Manager needs ALL teams' updates to prepare for Monday customer meeting
- Late updates delay customer communication and make team look unprofessional
- Demonstrates progress to customer
- Helps identify patterns and blockers early

**Set a recurring calendar reminder**: Fridays 1:50 PM - "Update GitLab issues (due 2 PM)"

---

### "Code review - how detailed should I be?"

**Review within**: 24 hours (or notify author if unable)

**Focus on**:
- ✅ Does it match the spec?
- ✅ Are there edge cases missed?
- ✅ Is it tested adequately?
- ✅ Could it be clearer/simpler?
- ✅ Are there security concerns?

**Don't focus on**:
- ❌ Style nitpicks (ESLint handles this)
- ❌ Personal preferences ("I would do it differently")
- ❌ Micro-optimizations (unless performance-critical)

**Tone**:
- ✅ "Could we...", "What if...", "Have you considered..."
- ❌ "This is wrong", "You should...", "Obviously..."

**Approval criteria**:
- All acceptance criteria met
- Tests passing
- No blocking concerns (minor suggestions are OK)

---

## FOR TEAM LEAD

### Monday: Start of Week

**Action**: Share last week's summary + this week's plan

**Format**: Async (GitLab comment, wiki, email)

**Time**: 5 minutes to prepare, 5 minutes for team to read

**Contents**:
- What we accomplished last week
- What we're working on this week
- Any announcements or changes

**Purpose**: Shared context, team sees collective progress

---

### Mid-Week: Check-Ins

**Action**: Review GitLab issues for blockers

**Time**: 15-30 minutes

**Look for**:
- Issues marked "Blocked"
- Issues with no updates in > 3 days
- Common patterns (multiple people stuck on same thing)

**Response**:
- Unblock people (provide info, escalate, facilitate discussion)
- Clarify specs if needed
- Connect people who might help each other

**Don't**:
- ❌ Micromanage progress
- ❌ Ask "why isn't this done yet?"
- ❌ Assign blame

---

### Friday 3:00 PM: Weekly Summary

**DEADLINE: 3:00 PM Friday** (strict)

**Why 3:00 PM?** Project Manager manages multiple teams and needs ALL summaries by 3:00 PM to prepare for Monday customer/management meetings.

**Time**: 60 minutes (2:00 PM - 3:00 PM, strict time-box)

**Process**:
1. Review all updated GitLab issues (issues due 2:00 PM)
2. Categorize accomplishments by area (backend, frontend, etc.)
3. Note blockers (resolved and current)
4. List planned work for next week
5. Add kudos for exceptional work (1-2 people max)
6. Calculate metrics (issues closed, story points, etc.)
7. **Send to Project Manager by 3:00 PM** (non-negotiable)

**Use Template**: [Weekly Summary Template](./WORKFLOW.md#weekly-summary-to-project-manager)

**If issues missing at 2:00 PM**:
- Ping individuals immediately
- If no response by 2:30 PM, note in summary: "Issue #127 - no update this week"
- **Do NOT delay summary past 3:00 PM** waiting for stragglers

**Preparation Tips**:
- Block 2:00-3:00 PM on calendar every Friday (no meetings)
- Have template ready to fill in
- Track metrics throughout week (don't wait until Friday)

---

### "Spec is unclear - someone asked a question"

**Process**:
1. Acknowledge the question (validates contributor)
2. Review spec with domain expert if needed
3. Provide clarification in GitLab issue
4. Update spec document via MR
5. Notify original questioner

**Timeline**: < 24 hours for response

**Example**:
```
Developer: "Does rate limiting apply per user or per IP?"

Team Lead: "Great question - spec doesn't specify. Let me check with
            @security-expert... OK, it should be per IP to prevent
            a single attacker from locking out many users. I'll update
            Section 7.2 of the auth spec to clarify."

Action: MR !89 - Clarify rate limiting scope in auth spec
```

---

### "Two developers disagree on approach"

**Don't**: Pick a side immediately

**Do**: Facilitate decision-making

**Process**:
1. Ask both to explain their reasoning
2. Check what the spec requires
3. Identify if this is a spec ambiguity or implementation preference
4. If spec is clear → Follow spec
5. If spec is ambiguous → Facilitate discussion, document decision

**Example**:
```
Developer A: "We should use cookies for tokens"
Developer B: "We should use localStorage"

Team Lead: "Both valid approaches. Let's check the spec..."
           [Reviews Section 8.2: Security Requirements]
           "Spec requires XSS protection. Developer B, can you explain
           how localStorage protects against XSS?"

Developer B: "It doesn't. I was thinking of ease of use."

Team Lead: "Developer A, can httpOnly cookies provide XSS protection?"

Developer A: "Yes, they can't be accessed by JavaScript."

Team Lead: "Sounds like cookies meet the spec requirement. Let's go
            with that. Developer B, I'll document this decision so
            others understand why."

Action: Document in auth spec Section 6.3
```

---

### "Someone is stuck and not asking for help"

**Signs**:
- Issue hasn't been updated in > 3 days
- % complete not increasing
- Lots of commits but no progress on acceptance criteria

**Approach**:
1. Reach out privately (not publicly)
2. Ask open-ended questions
3. Offer help, don't criticize

**Example**:
```
❌ Bad: "Issue #127 hasn't been updated. What's going on?"

✅ Good: "Hey, I noticed #127 hasn't had updates this week. Just
         checking in - is everything going OK, or are you stuck
         on something I can help with? No worries either way,
         just want to make sure you have what you need."
```

**Possible outcomes**:
- They're fine, just forgot to update issue (remind them)
- They're stuck but embarrassed to ask (offer pairing or expertise)
- Task is harder than estimated (adjust estimate, break into smaller tasks)
- They don't understand the spec (clarify or update spec)

---

### "Project Manager asks: 'When will X be done?'"

**Don't**: Promise a specific date

**Do**: Provide realistic range with confidence level

**Format**:
```
"Current Status": [% complete based on acceptance criteria]
"Remaining Work": [List outstanding tasks]
"Blockers": [Any known issues]
"Estimate": [Range with confidence]
"Risks": [What could delay it]

Example:
"Login feature is 75% complete. Remaining work is E2E tests and
 UX polish. No blockers. Estimate: 2-3 days with 80% confidence.
 Risk: If UX feedback requires redesign, could add 1-2 days."
```

**If pushed for exact date**:
```
"I can commit to a date, but it reduces our buffer for quality.
 Would you prefer a firm date with potential quality impact,
 or a range that ensures we meet spec requirements?"
```

---

## FOR PROJECT MANAGER

### "I need to communicate progress to customer"

**Input**: Weekly summary from Team Lead (received Friday)

**Your job**: Translate to customer language

**Team Lead gives you**:
- Technical accomplishments
- Blockers and risks
- Planned work
- Metrics

**You translate to**:
- Business value delivered ("Users can now log in securely")
- Impact on timeline ("On track for Phase 1 completion")
- Needs from customer ("Design approval needed by Monday")
- Confidence level ("High confidence in delivery next week")

**Example Translation**:
```
Team Lead Says:
"Completed JWT authentication service with token generation,
 verification, and refresh capabilities (Issue #127)"

You Tell Customer:
"✅ User authentication system is now functional. Users can
    securely log in, and their sessions are protected with
    industry-standard encryption. This completes 60% of the
    Phase 1 security requirements."
```

---

### "Customer wants to add a feature mid-sprint"

**Don't**: Say "yes" immediately

**Do**: Assess impact with Team Lead

**Questions to ask**:
1. Does this require a spec, or is it a small change?
2. What's the priority vs. current work?
3. What's the effort estimate?
4. What gets delayed if we add this now?

**Response to customer**:
```
Option A: "We can add this to the next sprint (starting [date]).
           That way we can spec it properly and maintain quality."

Option B: "We can add this now, but it will delay [current feature]
           by approximately [X days]. Which is higher priority?"

Option C: "This is small enough to squeeze in without impact.
           We'll have it by [date]."
```

**Document decision**: Add to ROADMAP.md or create new issue

---

### "Team seems slow - how do I address it?"

**First**: Check the data
- Are issues being completed?
- Is velocity consistent week-to-week?
- Are quality metrics being met?

**If velocity is actually low**:
1. Ask Team Lead for context (before assuming laziness)
2. Possible reasons:
   - Specs are unclear (fix specs)
   - Unrealistic estimates (re-estimate together)
   - External blockers (infrastructure, access, etc.)
   - Technical debt slowing things down
   - Team learning new technology (expected slowdown)
   - Quality standards are high (good thing!)

**If velocity is normal but customer expects more**:
1. Revisit estimates with Team Lead
2. Negotiate scope or timeline with customer
3. Add resources if justified

**Don't**:
- ❌ Compare to other teams (different contexts)
- ❌ Pressure for overtime (burnout reduces quality)
- ❌ Bypass Team Lead to micromanage individuals

---

## COMMON PITFALLS & SOLUTIONS

### Pitfall: "Spec is too rigid, we can't be agile"

**Solution**: Specs define **what**, not **how**

- You can change **how** you implement anytime
- You can update **specs** when requirements change
- Agility is in **iteration**, not in skipping planning

**Example**:
```
Spec says: "Users must be able to reset passwords via email"

Agile:
- Sprint 1: Basic email with reset link (meets spec)
- Sprint 2: Add fancy email template (based on user feedback)
- Sprint 3: Add SMS option (new spec based on customer request)

NOT Agile:
- "Let's skip the spec and just build something"
- Results: Build wrong thing, waste time, no accountability
```

---

### Pitfall: "No one updates GitLab issues"

**Solution**: Make it part of Definition of Done

- Issue not updated = work not done
- Team Lead reminds on Wednesday
- Takes 5 minutes, prevents hours of status meetings

**Enforcement** (gentle):
- "Hey team, Friday is issue update day. I need this to report progress to the Project Manager, which keeps the customer happy and prevents micromanagement. Thanks for taking 5 minutes to help us all look good."

---

### Pitfall: "Too many meetings"

**Solution**: Default to async

**Question to ask before scheduling meeting**:
- "Can this be a document instead?"
- "Can this be async discussion in GitLab?"
- "Does this require real-time back-and-forth?"

**Keep meetings for**:
- Complex technical design (whiteboarding)
- Urgent blockers affecting multiple people
- Conflict resolution
- Customer demos

**Replace meetings with**:
- Spec documents
- GitLab issue discussions
- Recorded video demos
- Wiki pages

---

### Pitfall: "People work in silos, no collaboration"

**Solution**: Built-in collaboration points

- Code review (every MR reviewed by peer)
- Spec review (all specs reviewed by team)
- Shared GitLab visibility (everyone sees everyone's work)
- Weekly summary (team sees collective progress)
- Kudos in reports (recognize collaboration)

**Encourage**:
- Pair programming on hard problems
- Knowledge sharing sessions (brown bag lunches)
- Documentation that teaches (specs, ADRs)

---

### Pitfall: "Blame culture when things go wrong"

**Solution**: Blameless post-mortems

**When issue occurs**:
1. Fix the immediate problem
2. Document what happened (facts, no blame)
3. Identify **systemic** causes (not individuals)
4. Improve **process** to prevent recurrence
5. Share learnings with team

**Example**:
```
❌ Blame Culture:
"Developer X deployed broken code and took down production.
 They should have tested better."

✅ Blameless Culture:
"Production outage occurred due to missing validation in auth
 service. Root cause: E2E tests didn't cover this scenario.
 Fix: Add E2E test case. Prevention: Expand E2E test coverage
 checklist in Definition of Done. No individual at fault -
 this is a process gap we'll close together."
```

---

## KEY METRICS TO TRACK

### Quality Metrics (Good)
- Test coverage %
- Bugs found in staging vs. production
- Spec deviations (documented)
- Code review feedback cycles

### Velocity Metrics (Good)
- Issues completed per week
- Story points completed per sprint
- Time from start to PR (cycle time)

### Health Metrics (Good)
- Issue update frequency (shows engagement)
- Time to unblock (shows responsiveness)
- Spec clarifications requested (shows thoroughness)
- Knowledge sharing activities

### Metrics to AVOID
- Lines of code (incentivizes bloat)
- Hours worked (incentivizes presenteeism, not results)
- Individual rankings (creates competition, not collaboration)
- Overtime frequency (indicates poor planning or burnout)

---

## DECISION-MAKING FLOWCHART

```
Question arises
     ↓
Is it answered in the spec?
     ↓ YES                    ↓ NO
Follow spec           Is it a small
                      implementation detail?
                           ↓ YES              ↓ NO
                      Developer decides    Create GitLab
                      (document in code)   issue, discuss
                                                ↓
                                          Consensus reached?
                                           ↓ YES        ↓ NO
                                      Document      Team Lead
                                      & proceed    facilitates
                                                       ↓
                                                  Decision made
                                                       ↓
                                                Update spec +
                                                document decision
```

---

## ESCALATION FLOWCHART

```
Issue/Question arises
     ↓
Can I resolve this myself in < 2 hours?
     ↓ YES                    ↓ NO
Try to resolve         Is it answered in
     ↓                 documentation/specs?
Resolved?                  ↓ YES         ↓ NO
     ↓ YES             Follow docs    Ask peer/expert
     ↓ NO                                  ↓
     ↓                              Resolved in < 1 day?
     ↓                                ↓ YES      ↓ NO
     ↓                              Document    Tag Team Lead
     └────────────────────────────────┘              ↓
                                              Team Lead facilitates
                                                      ↓
                                              Resolved in 2 days?
                                               ↓ YES        ↓ NO
                                            Document    Escalate to
                                                       Project Manager
                                                            ↓
                                                    May involve customer
                                                    or senior leadership
```

---

## QUICK LINKS

- [Full Workflow Documentation](./WORKFLOW.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Getting Started Guide](./GETTING-STARTED.md)
- [Project Roadmap](./ROADMAP.md)
- [Specifications Directory](./specs/)

---

## REMEMBER

**For Contributors**:
- Specs are your friend (read them first!)
- Ask questions early
- Update issues weekly
- You're a professional, act like one

**For Team Lead**:
- You're a facilitator, not a manager
- Trust expertise
- Remove blockers
- Celebrate wins

**For Project Manager**:
- Translate technical to business
- Protect team from thrash
- Set realistic expectations
- Customer success = team success

---

**When in doubt**: Create a GitLab issue and ask. Better to ask than assume.

**Questions about this workflow?** Create issue with label `workflow-question`

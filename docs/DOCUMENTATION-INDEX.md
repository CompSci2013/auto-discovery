# Documentation Index
## Auto Discovery Project - All Documentation

**Purpose**: Central hub for finding any project documentation.

---

## GETTING STARTED

**New to the project?** Start here:

1. **[README.md](./README.md)** - Project overview, tech stack, architecture
2. **[GETTING-STARTED.md](./GETTING-STARTED.md)** - Developer onboarding (30-minute setup)
3. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Coding standards, commit conventions, quality guidelines

**Estimated time**: 1-2 hours to read and understand the basics

---

## PROJECT MANAGEMENT

### For All Team Members

- **[WORKFLOW.md](./WORKFLOW.md)** - Complete workflow and team organization guide
- **[ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md)** - Navigating legacy issues, phase alignment, preventing yak-shaving
  - Guiding principles
  - Roles & responsibilities
  - Specification-driven workflow
  - Work organization
  - Weekly reporting cycle
  - Communication patterns
  - Quality gates
  - Templates (weekly summary, GitLab issues, ADRs, spec deviations)

- **[WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md)** - Quick answers for common scenarios
  - "I'm starting a new task"
  - "The spec is ambiguous"
  - "I'm blocked"
  - "Code review - how detailed?"
  - Decision-making flowcharts
  - Escalation flowcharts

- **[ROADMAP.md](./ROADMAP.md)** - Development plan, phases, timeline
  - What's being built
  - In what order
  - Current status
  - Dependencies

### For Specific Roles

**Individual Contributors**:
- Start with: [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), Section "FOR INDIVIDUAL CONTRIBUTORS"
- Coding standards: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Task tracking: GitLab issues (see templates in WORKFLOW.md)

**Team Lead**:
- Start with: [WORKFLOW.md](./WORKFLOW.md), Section "Roles & Responsibilities → Team Lead"
- Quick reference: [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), Section "FOR TEAM LEAD"
- Weekly summary template: [WORKFLOW.md](./WORKFLOW.md#weekly-summary-to-project-manager)

**Project Manager**:
- Start with: [WORKFLOW.md](./WORKFLOW.md), Section "Roles & Responsibilities → Project Manager"
- Quick reference: [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), Section "FOR PROJECT MANAGER"
- Roadmap: [ROADMAP.md](./ROADMAP.md)

---

## TECHNICAL SPECIFICATIONS

All specifications are in the [`specs/`](./specs/) directory.

### Core Specifications (Read First)

1. **[specs/README.md](./specs/README.md)** - Specification index and conventions
2. **[specs/01-architectural-analysis.md](./specs/01-architectural-analysis.md)** - System architecture, technology decisions
3. **[specs/02-api-contracts-data-models.md](./specs/02-api-contracts-data-models.md)** - API endpoints, request/response formats
4. **[specs/04-state-management-specification.md](./specs/04-state-management-specification.md)** - URL-first state management pattern

### Feature Specifications (Read as Needed)

- **[specs/03-discover-feature-specification.md](./specs/03-discover-feature-specification.md)** - Main discovery page
- **[specs/05-data-visualization-components.md](./specs/05-data-visualization-components.md)** - Tables, charts, visualizations
- **[specs/06-filter-picker-components.md](./specs/06-filter-picker-components.md)** - Filter UI, picker components
- **[specs/07-popout-window-system.md](./specs/07-popout-window-system.md)** - Multi-window support

### Quality & Testing Specifications

- **[specs/08-non-functional-requirements.md](./specs/08-non-functional-requirements.md)** - Performance, security, accessibility
- **[specs/09-testing-strategy.md](./specs/09-testing-strategy.md)** - Testing approach, coverage targets

### Authentication & Security

- **[specs/auth/authentication-service.md](./specs/auth/authentication-service.md)** - Authentication and authorization system
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Domain-based authorization
  - Complete with novice-friendly security explanations

---

## DEVELOPMENT ENVIRONMENT

### Container-Based Development (Recommended)

- **[docs/DEVELOPMENT-ENVIRONMENT.md](docs/DEVELOPMENT-ENVIRONMENT.md)** - Containerized development workflow
  - How to build dev container
  - How to run commands inside container
  - How to debug
  - Container vs. traditional development

### Traditional Development (Optional)

See [GETTING-STARTED.md](./GETTING-STARTED.md), Section "STEP 3: ENVIRONMENT SETUP"

---

## DEPLOYMENT

### Kubernetes Deployment

All Kubernetes manifests are in the [`k8s/`](../k8s/) directory:

**Core Infrastructure**:
- **[k8s/namespace.yaml](../k8s/namespace.yaml)** - Namespace definition
- **[k8s/ingress.yaml](../k8s/ingress.yaml)** - Ingress routing (Traefik)

**Backend Microservices**:

*Specs API Service*:
- **[k8s/specs-deployment.yaml](../k8s/specs-deployment.yaml)** - Specs API deployment (2 replicas, port 3000)
- **[k8s/specs-service.yaml](../k8s/specs-service.yaml)** - Specs API ClusterIP service

*VINs API Service*:
- **[k8s/vins-deployment.yaml](../k8s/vins-deployment.yaml)** - VINs API deployment (2 replicas, port 3001)
- **[k8s/vins-service.yaml](../k8s/vins-service.yaml)** - VINs API ClusterIP service

*Auth Service*:
- **[k8s/auth-deployment.yaml](../k8s/auth-deployment.yaml)** - Auth service deployment (2 replicas, port 3002)
- **[k8s/auth-service.yaml](../k8s/auth-service.yaml)** - Auth service ClusterIP service

**Frontend** (not yet implemented):
- **[k8s/frontend-deployment.yaml](../k8s/frontend-deployment.yaml)** - Frontend deployment (planned)
- **[k8s/frontend-service.yaml](../k8s/frontend-service.yaml)** - Frontend service (planned)

### Deployment Guide (To Be Created)

Planned: `docs/DEPLOYMENT-GUIDE.md`
- Building container images
- Pushing to registry
- Deploying to Kubernetes
- Environment variables
- Secrets management
- Health checks

---

## CLAUDE CODE INTEGRATION

### For AI-Assisted Development

- **[CLAUDE.md](./CLAUDE.md)** - Guidance for Claude Code assistant
  - Project overview
  - Common commands (container-based)
  - Coding standards
  - Architecture patterns
  - Specification references

**Purpose**: Ensures AI assistance aligns with project standards and spec-driven approach.

---

## ARCHITECTURE DECISION RECORDS (ADRs)

### What are ADRs?

Architecture Decision Records document significant technical decisions and their rationale.

### Location

Planned: `docs/adr/` directory

### Template

See [WORKFLOW.md](./WORKFLOW.md#architecture-decision-record-adr-template)

### Examples (To Be Created)

- ADR-001: Why BehaviorSubject + Services instead of NgRx
- ADR-002: Why Plotly.js instead of Chart.js
- ADR-003: Why httpOnly cookies instead of localStorage for tokens

---

## AUTOMATION & TOOLS

### GitLab Issue Triage Automation

**Location**: [`scripts/`](./scripts/) directory

**Purpose**: Automated weekly issue triage implementing workflows from [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md).

**What It Does**:
- Identifies stale issues (90+ days no activity)
- Posts 14-day warning comments
- Closes issues after warning period
- Checks for missing phase labels
- Validates acceptance criteria presence
- Generates weekly triage reports

**Quick Start**:
```bash
cd scripts
cp config.yml.example config.yml
# Edit config.yml with your GitLab credentials
./run-triage.sh              # Dry run (preview)
./run-triage.sh --live       # Actual run
```

**Documentation**: See [scripts/README.md](./scripts/README.md) for:
- Setup instructions
- GitLab token creation
- Scheduled automation (cron, CI/CD)
- Customization options
- Troubleshooting

**Workflow Integration**:
- **Monday 9:00 AM**: Bot runs weekly triage
- **Monday 10:00 AM**: Team members declare weekly work
- **Monday 10:30 AM**: Team Lead reviews triage report

**Implements**:
- [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md) → "The 90-Day Rule"
- [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md) → "Issue Quality Standards"
- [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md) → "Phase Alignment Process"

---

## REFERENCES BY TASK TYPE

### "I need to implement a new feature"

1. Read relevant spec in [`specs/`](./specs/)
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for coding standards
3. Create GitLab issue using template from [WORKFLOW.md](./WORKFLOW.md#gitlab-issue-template)
4. Follow [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), "I'm starting a new task"

### "I need to review code"

1. Review [CONTRIBUTING.md](./CONTRIBUTING.md), Section "CODE REVIEW"
2. Review [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), "Code review - how detailed should I be?"
3. Check that implementation matches spec

### "I need to write tests"

1. Read [specs/09-testing-strategy.md](./specs/09-testing-strategy.md)
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md), Section "Testing"
3. Check coverage targets (75%+ overall)

### "I need to deploy"

1. Read relevant K8s manifests in [`k8s/`](./k8s/)
2. Review deployment guide (when created)
3. Verify environment variables

### "I'm blocked / need help"

1. Check [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), "I'm blocked"
2. Follow escalation flowchart
3. Create GitLab issue if needed

### "The spec is unclear"

1. Follow [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), "The spec is ambiguous"
2. Use spec deviation template from [WORKFLOW.md](./WORKFLOW.md#spec-deviation-documentation-template)
3. Document decision

### "I need to report weekly progress"

**Individual Contributor**:
- Update GitLab issues (5-10 minutes)
- See [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), "Friday 2:00 PM - time to update issues"

**Team Lead**:
- Compile summary using template from [WORKFLOW.md](./WORKFLOW.md#weekly-summary-to-project-manager)
- Time required: 60 minutes (2:00-3:00 PM Friday, strict deadline)

**Project Manager**:
- Translate team summary to customer language
- See [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md), "I need to communicate progress to customer"

### "I'm not sure if this issue is relevant to current phase"

1. Check [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md), "Phase Alignment Process"
2. Look for `phase-current` label on issue
3. Verify issue is in Phase Goals document (docs/PHASE-GOALS-*.md)
4. If unclear, use decision tree in ISSUE-MANAGEMENT.md
5. Ask Team Lead if still uncertain

### "I'm working on a legacy issue with no clear acceptance criteria"

1. STOP - Do NOT continue work
2. Follow [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md), "Issue Quality Standards"
3. Comment on issue requesting acceptance criteria
4. Tag Team Lead
5. Work on different issue while waiting for clarification

### "I'm new to the team and overwhelmed by GitLab"

1. Read [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md), "Onboarding New Team Members"
2. IGNORE 95% of GitLab (legacy issues)
3. Filter issues: `label:phase-current label:onboarding-friendly`
4. Start with docs in order (README → GETTING-STARTED → WORKFLOW)
5. Ask mentor or Team Lead for first issue assignment

### "I think someone is yak-shaving (including me)"

1. Read [ISSUE-MANAGEMENT.md](./ISSUE-MANAGEMENT.md), "Preventing Yak-Shaving"
2. Check: Is this work in the issue's acceptance criteria?
3. If NO → Create separate issue for improvement, return to original acceptance criteria
4. If working > 50% of estimate with < 25% progress → Alert Team Lead
5. Use "Is This in the Spec?" test before any work

### "I want to automate weekly issue triage" (Team Lead)

1. Read [scripts/README.md](./scripts/README.md) for complete setup guide
2. Install dependencies: `pip install -r scripts/requirements.txt`
3. Create GitLab access token (Settings → Access Tokens)
4. Configure: `cp scripts/config.yml.example scripts/config.yml`
5. Test with dry run: `cd scripts && ./run-triage.sh`
6. Schedule weekly: See [scripts/README.md](./scripts/README.md#automated-scheduling)

**Benefits**:
- Automatically identifies stale issues (90+ days)
- Validates issue quality (acceptance criteria, phase labels)
- Generates weekly triage reports
- Saves 1-2 hours per week

---

## DOCUMENT STATUS

### Complete ✅
- README.md
- GETTING-STARTED.md
- CONTRIBUTING.md
- WORKFLOW.md
- WORKFLOW-QUICK-REFERENCE.md
- ISSUE-MANAGEMENT.md
- ROADMAP.md
- CLAUDE.md
- All specifications in `specs/`
- Kubernetes manifests in `k8s/`
- Automation scripts in `scripts/`
  - gitlab_triage.py (weekly issue triage)
  - run-triage.sh (convenience wrapper)
  - scripts/README.md (automation docs)

### Planned 📋
- docs/DEPLOYMENT-GUIDE.md
- docs/DEVELOPMENT-ENVIRONMENT.md (mentioned but may not exist yet)
- docs/adr/ (Architecture Decision Records)

### To Be Created As Needed 🔮
- User documentation (end-user guides)
- API documentation (if exposing public APIs)
- Runbooks (operational procedures)
- Incident response procedures

---

## CONTRIBUTING TO DOCUMENTATION

### How to Update Documentation

1. Identify which document needs updating
2. Create feature branch: `docs/description`
3. Update document (Markdown format)
4. Create merge request
5. Tag relevant people for review

### Documentation Standards

- **Markdown**: GitHub-flavored Markdown
- **Tone**: Professional but approachable
- **Audience**: Assume novice-to-intermediate knowledge
- **Examples**: Include code examples where helpful
- **Links**: Use relative links to other project docs

### When to Create New Documentation

**Create new doc when**:
- Topic is substantial (> 500 words)
- Topic is reference material (will be consulted repeatedly)
- Topic needs to be versioned separately

**Update existing doc when**:
- Clarifying existing content
- Adding small sections
- Fixing errors

### When to Create an ADR

**Create ADR when**:
- Making significant technical decision
- Decision affects multiple components
- Future team members will ask "why did we do this?"
- There were multiple viable alternatives

**Example ADR-worthy decisions**:
- Choosing state management approach
- Selecting UI library
- Authentication mechanism
- Database/storage choice
- API design patterns

---

## SEARCH TIPS

### Finding Information

**By Topic**:
- Authentication: `specs/auth/authentication-service.md`
- State Management: `specs/04-state-management-specification.md`
- API Contracts: `specs/02-api-contracts-data-models.md`
- Testing: `specs/09-testing-strategy.md` + `CONTRIBUTING.md`
- Deployment: `k8s/` directory
- Workflow: `WORKFLOW.md` + `WORKFLOW-QUICK-REFERENCE.md`

**By Role**:
- New Developer: Start with `GETTING-STARTED.md`
- Individual Contributor: `CONTRIBUTING.md` + `WORKFLOW-QUICK-REFERENCE.md`
- Team Lead: `WORKFLOW.md` (full version)
- Project Manager: `WORKFLOW.md` (PM sections) + `ROADMAP.md`

**By Activity**:
- Starting new task: `WORKFLOW-QUICK-REFERENCE.md`
- Code review: `CONTRIBUTING.md` + `WORKFLOW-QUICK-REFERENCE.md`
- Writing spec: `specs/README.md` + existing specs as examples
- Debugging issue: Relevant spec + `CLAUDE.md` (for AI help)

### Using grep to Find Content

```bash
# Find all mentions of "authentication"
grep -r "authentication" specs/

# Find all TODO items
grep -r "TODO" .

# Find all GitLab issue references
grep -r "#[0-9]" .

# Find all spec deviations
grep -r "SPEC DEVIATION" .
```

---

## FEEDBACK & IMPROVEMENTS

### How to Provide Feedback

**Documentation unclear?**
1. Create GitLab issue with label `documentation`
2. Describe what's unclear
3. Suggest improvement (optional)

**Documentation missing?**
1. Create GitLab issue with label `documentation`
2. Describe what's needed
3. Reference where it would fit in this index

**Documentation outdated?**
1. Create merge request with fix
2. Reference issue if substantial change

---

## CONTACT

- **Questions about Workflow**: Create issue with label `workflow-question`
- **Questions about Specs**: Create issue with label `spec-question` and tag relevant domain expert
- **Questions about Code**: Create issue with label `help-wanted`
- **General Questions**: Ask in team chat or create issue with label `question`

---

## VERSION HISTORY

- **v1.0** (2025-11-15): Initial documentation index created
  - Established workflow documentation (WORKFLOW.md, WORKFLOW-QUICK-REFERENCE.md)
  - Organized existing specs and guides
  - Created central navigation hub

---

**Remember**: Documentation is a living artifact. Keep it updated as the project evolves.

**Questions about this index?** Create issue with label `documentation-index`

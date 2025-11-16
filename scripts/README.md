# GitLab Automation Scripts

Automation scripts implementing workflows from [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md).

## Overview

### `gitlab_triage.py`

**Purpose**: Automated weekly issue triage implementing the 90-Day Rule and issue quality checks.

**What It Does**:
- 🔍 Finds stale issues (90+ days no activity)
- ⚠️ Posts 14-day warning comments
- 🚫 Closes issues after warning period
- 🏷️ Identifies issues missing phase labels
- ✅ Checks for missing acceptance criteria
- 📊 Generates weekly triage reports

**Workflow**: Follows [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md) → "The 90-Day Rule"

---

## Setup

### 1. Install Dependencies

```bash
# Install required Python packages
pip install python-gitlab pyyaml
```

### 2. Create Configuration File

```bash
# Copy example config
cp config.yml.example config.yml

# Edit with your values
nano config.yml
```

**Required Configuration**:

```yaml
gitlab_url: "https://gitlab.example.com"      # Your GitLab instance
private_token: "your-token-here"               # Personal access token
project_id: 123                                # Your project ID
```

### 3. Create GitLab Access Token

1. Go to GitLab: **Settings** → **Access Tokens**
2. Click **Add new token**
3. Name: `Triage Bot`
4. Scopes:
   - ✅ `api` (full API access)
   - ✅ `read_api` (read access)
   - ✅ `write_repository` (to modify issues)
5. Click **Create personal access token**
6. Copy token to `config.yml`

**Security Note**: Keep `config.yml` private. Never commit to Git.

### 4. Find Your Project ID

**Option 1**: GitLab UI
1. Go to your project
2. **Settings** → **General**
3. Project ID shown at top

**Option 2**: GitLab CLI
```bash
glab repo view
```

---

## Usage

### Dry Run (Preview Mode)

**Always test first with dry run** - shows what would happen without making changes:

```bash
python gitlab_triage.py --config config.yml --dry-run
```

Example output:
```
================================================================================
GITLAB ISSUE TRIAGE - Weekly Run
Project: Auto Discovery
Dry Run: True
================================================================================

--- Processing Stale Issues (90-Day Rule) ---
  Issue #42: Posting stale warning (127 days inactive)
  Issue #68: Closing after 14-day warning period

--- Checking for Missing Phase Labels ---
  Issue #91: Missing phase label - Update documentation

--- Checking for Missing Acceptance Criteria ---
  Issue #103: Missing acceptance criteria - Implement search feature

================================================================================
WEEKLY TRIAGE REPORT
================================================================================
Stale Warnings Posted:           1
Stale Issues Closed:             1
Issues Missing Phase Labels:     1
Issues Missing Criteria:         1
Issues Needing Team Lead:        0
================================================================================
```

### Actual Run

**After verifying dry run**, run for real:

```bash
python gitlab_triage.py --config config.yml
```

---

## Automated Scheduling

### Option 1: Cron (Linux/Mac)

Run every **Monday at 9:00 AM**:

```bash
# Edit crontab
crontab -e

# Add this line (update path to your scripts directory)
0 9 * * 1 cd /home/odin/projects/auto-discovery/scripts && python3 gitlab_triage.py --config config.yml
```

**Cron Schedule Syntax**:
```
┌───── minute (0-59)
│ ┌───── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6, Sunday=0)
│ │ │ │ │
0 9 * * 1  (Every Monday at 9 AM)
```

### Option 2: GitLab CI/CD

Create `.gitlab-ci.yml` in project root:

```yaml
# Weekly triage job
triage:
  image: python:3.9

  before_script:
    - pip install python-gitlab pyyaml

  script:
    - cd scripts
    - python gitlab_triage.py --config config.yml

  # Run every Monday at 9 AM
  only:
    - schedules

  rules:
    - if: '$CI_PIPELINE_SOURCE == "schedule"'
```

Then in GitLab:
1. **CI/CD** → **Schedules** → **New schedule**
2. Description: `Weekly Triage`
3. Interval: `Custom` → `0 9 * * 1` (Mondays 9 AM)
4. Target branch: `main`
5. Save

### Option 3: GitHub Actions

If using GitHub, create `.github/workflows/triage.yml`:

```yaml
name: Weekly GitLab Triage

on:
  schedule:
    # Every Monday at 9 AM UTC
    - cron: '0 9 * * 1'

  # Allow manual triggering
  workflow_dispatch:

jobs:
  triage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: pip install python-gitlab pyyaml

      - name: Run triage
        env:
          GITLAB_TOKEN: ${{ secrets.GITLAB_TOKEN }}
        run: |
          cd scripts
          python gitlab_triage.py --config config.yml
```

Store GitLab token in **Settings** → **Secrets and variables** → **Actions** → **New repository secret** (name: `GITLAB_TOKEN`)

---

## What the Bot Does

### 1. Stale Issue Management (90-Day Rule)

**From [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md#the-90-day-rule)**

**For issues with 90+ days no activity**:
1. ✅ **Skips** if labeled `phase-current` (actively being worked)
2. ⚠️ **Posts warning** if first time detected
3. 🚫 **Closes** if warning posted 14+ days ago

**Example Warning Comment**:
```markdown
🤖 Automated Triage Notice

This issue has had no activity for 90+ days and is not labeled `phase-current`.

Action Required: If this issue is still relevant, please:
1. Add a comment explaining why it should remain open
2. Update the issue with current context
3. Add appropriate phase label

If no response within 14 days, this issue will be automatically closed.
```

**Labels Added**:
- `stale-warning` - Issue has 14-day warning
- `bot-triage` - Modified by bot

### 2. Missing Phase Labels

**From [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md#phase-alignment-process)**

**Finds issues missing phase labels**:
- `phase-current`
- `phase-next`
- `phase-future`

**Action**: Adds `phase-unclear` label for Team Lead review

### 3. Missing Acceptance Criteria

**From [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md#issue-quality-standards)**

**Checks `phase-current` issues** for acceptance criteria keywords:
- "acceptance criteria"
- "definition of done"
- "success criteria"
- "done when"

**If missing**, posts comment:
```markdown
⚠️ Issue Quality Check

This issue is missing acceptance criteria, which is required before work can begin.

Per ISSUE-MANAGEMENT.md, every issue must have:
1. Clear title
2. Context
3. Acceptance criteria ← MISSING
4. Specification reference
5. Phase alignment
6. Estimate
7. Dependencies

Action Required: Please add acceptance criteria.
```

**Labels Added**:
- `needs-acceptance-criteria`
- `bot-triage`

### 4. Weekly Triage Report

**Creates GitLab issue** summarizing weekly triage:

```markdown
## Weekly Triage Report - 2025-11-15

Summary:
- Stale Warnings Posted: 3
- Stale Issues Closed: 2
- Issues Missing Phase Labels: 5
- Issues Missing Acceptance Criteria: 1
- Issues Needing Team Lead Decision: 4

Actions Required:
- 5 issues missing phase labels (labeled `phase-unclear`)
- 1 issue in current phase missing acceptance criteria
- 4 issues labeled `phase-unclear` need Team Lead decision

Next Steps:
1. Team Lead: Review issues labeled `phase-unclear`
2. Team Lead: Review issues with `needs-acceptance-criteria`
3. All: Check if any closed issues should be reopened
```

**Labels**: `triage-report`, `team-lead`, `bot-triage`

---

## Customization

### Adjust Timing Thresholds

Edit `config.yml`:

```yaml
# Change to 60 days before warning
stale_days: 60

# Change to 7 days warning period
warning_days: 7
```

### Add Custom Checks

Extend `GitLabTriageBot` class in `gitlab_triage.py`:

```python
def check_custom_workflow(self):
    """Add your custom triage logic."""
    issues = self.project.issues.list(state='opened')

    for issue in issues:
        # Your custom logic here
        pass
```

Call in `run_weekly_triage()`:

```python
def run_weekly_triage(self):
    self.process_stale_issues()
    self.check_missing_labels()
    self.check_missing_acceptance_criteria()
    self.identify_unclear_issues()
    self.check_custom_workflow()  # Add here
    self.generate_report()
```

---

## Troubleshooting

### Error: "401 Unauthorized"

**Cause**: Invalid or expired GitLab token

**Solution**:
1. Generate new token in GitLab
2. Ensure scopes: `api`, `read_api`, `write_repository`
3. Update `config.yml`

### Error: "404 Project Not Found"

**Cause**: Incorrect `project_id` in config

**Solution**:
1. Verify project ID: **Settings** → **General**
2. Update `config.yml`

### Bot Not Detecting Stale Issues

**Cause**: All issues labeled `phase-current`

**Explanation**: Bot skips issues actively being worked on

**Solution**: Review if all issues should truly be `phase-current`

### Bot Closed Issue That Should Stay Open

**Solution**:
1. Reopen the issue
2. Add appropriate `phase-*` label
3. Add comment explaining why still relevant
4. Bot will skip on next run

---

## Safety Features

### Dry Run Mode

**Always available** - preview changes without modifying GitLab:

```bash
python gitlab_triage.py --config config.yml --dry-run
```

### Only Closes Non-Critical Issues

Bot **never closes**:
- Issues labeled `phase-current`
- Issues updated within 90 days
- Issues without 14-day warning first

### Easy to Reopen

**All closure comments** include instructions:

> This does NOT mean the issue is invalid. If this issue is still relevant:
> 1. Reopen the issue
> 2. Add current context
> 3. Add appropriate phase label

### Detailed Logging

**All actions logged** with timestamps and issue numbers:

```
2025-11-15 09:00:12 - INFO - Issue #42: Posting stale warning (127 days inactive)
2025-11-15 09:00:15 - INFO - Issue #68: Closing after 14-day warning period
```

---

## Integration with ISSUE-MANAGEMENT.md

This bot implements these sections from [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md):

| Section | Implementation |
|---------|----------------|
| Issue Quality Standards | Checks for acceptance criteria |
| Phase Alignment Process | Identifies missing phase labels |
| The 90-Day Rule | Stale issue detection and closure |
| Weekly Issue Hygiene | Automated Monday triage workflow |

**Workflow Alignment**:
- **Monday 9:00 AM**: Bot runs weekly triage
- **Monday 10:00 AM**: Team members declare weekly work (see WORKFLOW.md)
- **Monday 10:30 AM**: Team Lead reviews triage report + weekly work declarations

---

## Future Enhancements

Potential additions (create issues if desired):

1. **Auto-estimate issues** based on similar closed issues
2. **Detect duplicate issues** using title/description similarity
3. **Auto-assign based on expertise** (configurable mapping)
4. **Integration with WORKFLOW.md** weekly reporting
5. **Slack/Discord notifications** for triage reports
6. **Metrics dashboard** (burndown, velocity, age distribution)

---

## Questions?

- **Workflow questions**: See [WORKFLOW-QUICK-REFERENCE.md](../WORKFLOW-QUICK-REFERENCE.md)
- **Issue management**: See [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md)
- **Bot issues**: Create issue with label `automation`

---

**Last Updated**: 2025-11-15
**Implements**: [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md) workflows

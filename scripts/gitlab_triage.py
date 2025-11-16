#!/usr/bin/env python3
"""
GitLab Issue Triage Automation

Implements automated workflows from ISSUE-MANAGEMENT.md:
1. Identify stale issues (90+ days no activity)
2. Post 14-day warning comments
3. Close issues after warning period
4. Generate weekly triage reports
5. Check for unlabeled issues
6. Identify issues needing Team Lead decision

Usage:
    python gitlab_triage.py --config config.yml [--dry-run]

Requirements:
    pip install python-gitlab pyyaml
"""

import argparse
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import yaml

try:
    import gitlab
except ImportError:
    print("ERROR: python-gitlab not installed. Run: pip install python-gitlab pyyaml")
    exit(1)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GitLabTriageBot:
    """Automates GitLab issue triage based on ISSUE-MANAGEMENT.md workflows."""

    # Templates from ISSUE-MANAGEMENT.md
    STALE_WARNING_TEMPLATE = """**🤖 Automated Triage Notice**

This issue has had no activity for **90+ days** and is not labeled `phase-current`.

**Action Required**: If this issue is still relevant, please:
1. Add a comment explaining why it should remain open
2. Update the issue with current context
3. Add appropriate phase label (`phase-current`, `phase-next`, or `phase-future`)

**If no response within 14 days**, this issue will be automatically closed per the [90-Day Rule](../ISSUE-MANAGEMENT.md#the-90-day-rule).

---
*This is an automated message. Questions? See [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md)*
"""

    CLOSURE_TEMPLATE = """**🤖 Automated Closure**

This issue has been automatically closed due to:
- No activity for **90+ days**
- No response to 14-day warning posted on {warning_date}
- Not labeled as `phase-current`

**This does NOT mean the issue is invalid.** If this issue is still relevant:
1. Reopen the issue
2. Add current context
3. Add appropriate phase label
4. Tag @team-lead for review

Per the [90-Day Rule](../ISSUE-MANAGEMENT.md#the-90-day-rule).

---
*This is an automated message. Questions? See [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md)*
"""

    MISSING_CRITERIA_TEMPLATE = """**⚠️ Issue Quality Check**

This issue is missing **acceptance criteria**, which is required before work can begin.

Per [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md#issue-quality-standards), every issue must have:
1. Clear title
2. Context (why this matters)
3. **Acceptance criteria** (how we know it's done) ← **MISSING**
4. Specification reference
5. Phase alignment
6. Estimate
7. Dependencies

**Action Required**: Please add acceptance criteria or this issue may be closed as incomplete.

---
*This is an automated message. Questions? See [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md)*
"""

    def __init__(self, config_path: str, dry_run: bool = False):
        """Initialize the triage bot with configuration."""
        self.dry_run = dry_run
        self.config = self._load_config(config_path)
        self.gl = gitlab.Gitlab(
            self.config['gitlab_url'],
            private_token=self.config['private_token']
        )
        self.project = self.gl.projects.get(self.config['project_id'])

        # Statistics for reporting
        self.stats = {
            'stale_warned': 0,
            'stale_closed': 0,
            'missing_labels': 0,
            'missing_criteria': 0,
            'needs_team_lead': 0
        }

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file."""
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)

            # Validate required fields
            required = ['gitlab_url', 'private_token', 'project_id']
            missing = [field for field in required if field not in config]
            if missing:
                raise ValueError(f"Missing required config fields: {missing}")

            # Set defaults
            config.setdefault('stale_days', 90)
            config.setdefault('warning_days', 14)
            config.setdefault('phase_labels', ['phase-current', 'phase-next', 'phase-future'])
            config.setdefault('bot_label', 'bot-triage')
            config.setdefault('warning_label', 'stale-warning')

            return config
        except FileNotFoundError:
            logger.error(f"Config file not found: {config_path}")
            exit(1)
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            exit(1)

    def run_weekly_triage(self):
        """Run all weekly triage workflows."""
        logger.info("=" * 80)
        logger.info("GITLAB ISSUE TRIAGE - Weekly Run")
        logger.info(f"Project: {self.project.name}")
        logger.info(f"Dry Run: {self.dry_run}")
        logger.info("=" * 80)

        # Run triage workflows
        self.process_stale_issues()
        self.check_missing_labels()
        self.check_missing_acceptance_criteria()
        self.identify_unclear_issues()

        # Generate report
        self.generate_report()

    def process_stale_issues(self):
        """Process stale issues (90+ days no activity)."""
        logger.info("\n--- Processing Stale Issues (90-Day Rule) ---")

        stale_cutoff = datetime.now() - timedelta(days=self.config['stale_days'])
        warning_cutoff = datetime.now() - timedelta(days=self.config['warning_days'])

        # Find all open issues
        issues = self.project.issues.list(
            state='opened',
            per_page=100,
            get_all=True
        )

        for issue in issues:
            # Skip issues labeled as phase-current (actively being worked)
            if 'phase-current' in issue.labels:
                continue

            updated_at = datetime.fromisoformat(issue.updated_at.replace('Z', '+00:00'))
            days_since_update = (datetime.now(updated_at.tzinfo) - updated_at).days

            # Check if issue has stale warning label
            has_warning = self.config['warning_label'] in issue.labels

            if days_since_update >= self.config['stale_days']:
                if has_warning:
                    # Check if 14 days have passed since warning
                    warning_date = self._get_warning_date(issue)
                    if warning_date and (datetime.now(warning_date.tzinfo) - warning_date).days >= self.config['warning_days']:
                        self._close_stale_issue(issue, warning_date)
                else:
                    # Post warning
                    self._post_stale_warning(issue, days_since_update)

    def _post_stale_warning(self, issue, days_inactive: int):
        """Post 14-day warning on stale issue."""
        logger.info(f"  Issue #{issue.iid}: Posting stale warning ({days_inactive} days inactive)")

        if not self.dry_run:
            # Post comment
            issue.notes.create({'body': self.STALE_WARNING_TEMPLATE})

            # Add labels
            labels = issue.labels + [self.config['warning_label'], self.config['bot_label']]
            issue.labels = labels
            issue.save()

        self.stats['stale_warned'] += 1

    def _close_stale_issue(self, issue, warning_date: datetime):
        """Close issue after 14-day warning period."""
        logger.info(f"  Issue #{issue.iid}: Closing after 14-day warning period")

        if not self.dry_run:
            # Post closure comment
            closure_comment = self.CLOSURE_TEMPLATE.format(
                warning_date=warning_date.strftime('%Y-%m-%d')
            )
            issue.notes.create({'body': closure_comment})

            # Close issue
            issue.state_event = 'close'
            issue.save()

        self.stats['stale_closed'] += 1

    def _get_warning_date(self, issue) -> Optional[datetime]:
        """Get the date when stale warning was posted."""
        notes = issue.notes.list(per_page=100, get_all=True)
        for note in notes:
            if '🤖 Automated Triage Notice' in note.body:
                return datetime.fromisoformat(note.created_at.replace('Z', '+00:00'))
        return None

    def check_missing_labels(self):
        """Check for issues missing phase labels."""
        logger.info("\n--- Checking for Missing Phase Labels ---")

        issues = self.project.issues.list(
            state='opened',
            per_page=100,
            get_all=True
        )

        phase_labels = self.config['phase_labels']

        for issue in issues:
            # Check if issue has any phase label
            has_phase_label = any(label in issue.labels for label in phase_labels)

            if not has_phase_label:
                logger.warning(f"  Issue #{issue.iid}: Missing phase label - {issue.title}")
                self.stats['missing_labels'] += 1

                # Could auto-label as 'phase-unclear' here
                if not self.dry_run and 'phase-unclear' not in issue.labels:
                    issue.labels = issue.labels + ['phase-unclear', self.config['bot_label']]
                    issue.save()

    def check_missing_acceptance_criteria(self):
        """Check for issues missing acceptance criteria."""
        logger.info("\n--- Checking for Missing Acceptance Criteria ---")

        issues = self.project.issues.list(
            state='opened',
            labels=['phase-current'],  # Only check current phase issues
            per_page=100,
            get_all=True
        )

        # Keywords that suggest acceptance criteria section exists
        criteria_keywords = [
            'acceptance criteria',
            'definition of done',
            'success criteria',
            'done when'
        ]

        for issue in issues:
            description = (issue.description or '').lower()

            has_criteria = any(keyword in description for keyword in criteria_keywords)

            if not has_criteria:
                logger.warning(f"  Issue #{issue.iid}: Missing acceptance criteria - {issue.title}")
                self.stats['missing_criteria'] += 1

                # Post warning comment if not already posted
                if not self.dry_run and not self._has_criteria_warning(issue):
                    issue.notes.create({'body': self.MISSING_CRITERIA_TEMPLATE})

                    # Add label
                    if 'needs-acceptance-criteria' not in issue.labels:
                        issue.labels = issue.labels + ['needs-acceptance-criteria', self.config['bot_label']]
                        issue.save()

    def _has_criteria_warning(self, issue) -> bool:
        """Check if criteria warning was already posted."""
        notes = issue.notes.list(per_page=20)
        for note in notes:
            if '⚠️ Issue Quality Check' in note.body:
                return True
        return False

    def identify_unclear_issues(self):
        """Identify issues that need Team Lead decision."""
        logger.info("\n--- Identifying Issues Needing Team Lead Review ---")

        # Issues labeled as phase-unclear need Team Lead decision
        issues = self.project.issues.list(
            state='opened',
            labels=['phase-unclear'],
            per_page=100,
            get_all=True
        )

        for issue in issues:
            logger.warning(f"  Issue #{issue.iid}: Needs Team Lead decision - {issue.title}")
            self.stats['needs_team_lead'] += 1

    def generate_report(self):
        """Generate weekly triage report."""
        logger.info("\n" + "=" * 80)
        logger.info("WEEKLY TRIAGE REPORT")
        logger.info("=" * 80)
        logger.info(f"Stale Warnings Posted:           {self.stats['stale_warned']}")
        logger.info(f"Stale Issues Closed:             {self.stats['stale_closed']}")
        logger.info(f"Issues Missing Phase Labels:     {self.stats['missing_labels']}")
        logger.info(f"Issues Missing Criteria:         {self.stats['missing_criteria']}")
        logger.info(f"Issues Needing Team Lead:        {self.stats['needs_team_lead']}")
        logger.info("=" * 80)

        # Create GitLab issue with report if not dry run
        if not self.dry_run and any(self.stats.values()):
            self._create_report_issue()

    def _create_report_issue(self):
        """Create a GitLab issue with the weekly triage report."""
        today = datetime.now().strftime('%Y-%m-%d')

        report_body = f"""## Weekly Triage Report - {today}

**Automated triage completed per [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md)**

### Summary

| Category | Count |
|----------|-------|
| Stale Warnings Posted | {self.stats['stale_warned']} |
| Stale Issues Closed | {self.stats['stale_closed']} |
| Issues Missing Phase Labels | {self.stats['missing_labels']} |
| Issues Missing Acceptance Criteria | {self.stats['missing_criteria']} |
| Issues Needing Team Lead Decision | {self.stats['needs_team_lead']} |

### Actions Required

"""

        if self.stats['missing_labels'] > 0:
            report_body += f"- **{self.stats['missing_labels']} issues** missing phase labels (labeled `phase-unclear`)\n"

        if self.stats['missing_criteria'] > 0:
            report_body += f"- **{self.stats['missing_criteria']} issues** in current phase missing acceptance criteria\n"

        if self.stats['needs_team_lead'] > 0:
            report_body += f"- **{self.stats['needs_team_lead']} issues** labeled `phase-unclear` need Team Lead decision\n"

        report_body += """
### Next Steps

1. **Team Lead**: Review issues labeled `phase-unclear` and assign proper phase labels
2. **Team Lead**: Review issues with `needs-acceptance-criteria` and add criteria or request from spec owner
3. **All**: Check if any closed issues should be reopened

---
*This is an automated report. See [ISSUE-MANAGEMENT.md](../ISSUE-MANAGEMENT.md) for workflow details.*
"""

        issue = self.project.issues.create({
            'title': f'Weekly Triage Report - {today}',
            'description': report_body,
            'labels': ['triage-report', 'team-lead', self.config['bot_label']]
        })

        logger.info(f"\nCreated triage report: Issue #{issue.iid}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='GitLab Issue Triage Automation',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Dry run (no changes)
  python gitlab_triage.py --config config.yml --dry-run

  # Actual run
  python gitlab_triage.py --config config.yml

  # Weekly cron job (Mondays 9 AM)
  0 9 * * 1 cd /path/to/scripts && python gitlab_triage.py --config config.yml
        """
    )

    parser.add_argument(
        '--config',
        required=True,
        help='Path to config.yml file'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Run without making any changes (preview mode)'
    )

    args = parser.parse_args()

    # Run triage
    bot = GitLabTriageBot(args.config, dry_run=args.dry_run)
    bot.run_weekly_triage()


if __name__ == '__main__':
    main()

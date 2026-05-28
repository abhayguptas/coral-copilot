# Example Voice Prompts

Once you have installed the relevant skills from the Marketplace, click the Voice Orb on the Dashboard and try these powerful, cross-SaaS prompts.

## 1. The "Morning Standup" Update
**Required Skills:** `github`, `linear`, `slack`
> "Good morning Coral. What PRs did I merge yesterday, and what are my highest priority open Linear tickets today?"
*The Agent will JOIN your GitHub commit history with your assigned Linear issues and give you a clean summary.*

## 2. The Root Cause Investigation
**Required Skills:** `github`, `sentry`, `pagerduty`
> "Why did my phone just go off? Show me the active PagerDuty incident, the related Sentry errors, and tell me who made the last commit to that module."
*The Agent will instantly query the live PagerDuty alert, fetch the Sentry traceback, and JOIN it against `github.commits` to find the culprit.*

## 3. The Code Review Nudge
**Required Skills:** `github`, `slack`
> "Who is assigned to review my open PRs, and when were they last active in Slack?"
*The Agent pulls your open PRs, extracts the requested reviewers, and JOINs them against `slack.users` to see if they are currently online.*

## 4. The Cloud Cost Auditor
**Required Skills:** `datadog`, `github`
> "Which GitHub team owns the service that had the highest latency spike in Datadog over the last 24 hours?"
*The Agent queries `datadog.metrics`, finds the highest spike, and maps the service tag back to a `github.teams` owner.*

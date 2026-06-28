# Documentation Organization

## Last Updated

**Date**: June 28, 2026
**Changes**: Synced documentation map with current repository state, added `AGENTS.md`, and updated file counts.

## Current Documentation Structure

```
apply-job/
├── README.md                         # Project overview and quick start
├── AGENTS.md                         # Agent-focused project instructions
├── files.md                          # Current repository file inventory
│
└── docs/                             # Technical documentation
    ├── README.md                     # Documentation index
    ├── ARCHITECTURE.md               # Technical architecture
    ├── SETUP.md                      # Installation and setup guide
    ├── QUICK_START.md                # Quick setup guide
    ├── DEPLOYMENT.md                 # Deployment guide (Vercel/Railway/Render)
    ├── ENV_VARIABLES.md              # Environment variable reference
    ├── PROJECT_CONTEXT.md            # Complete project context
    ├── AUTH_FINAL_COMPLETE.md        # Authentication system documentation
    ├── AUTH_IMPLEMENTATION_STATUS.md # Authentication implementation status
    ├── AUTH_PHASE2_COMPLETE.md       # Authentication phase 2 notes
    └── DOCUMENTATION-ORGANIZATION.md # This file
```

## Markdown Files Analysis

- Root markdown files: **3** (`README.md`, `AGENTS.md`, `files.md`)
- docs markdown files: **10**
- tests markdown files: **0**
- Total markdown files: **13**

## Navigation Guide

1. Start with `README.md` for product overview and setup commands.
2. Read `AGENTS.md` for agent-specific conventions, commands, and critical gotchas.
3. Use `docs/README.md` for the full documentation index.
4. Use `files.md` to quickly inspect the current repository structure.
5. Use `docs/PROJECT_CONTEXT.md` for complete implementation and architecture context.

## Documentation Access

```bash
# Root docs
cat README.md
cat AGENTS.md
cat files.md

# Technical docs index and main guides
cat docs/README.md
cat docs/SETUP.md
cat docs/ARCHITECTURE.md
cat docs/DEPLOYMENT.md
```

## Standards

### Where To Place Documentation

- Root (`/`): High-level project docs and repository-wide inventories.
- `docs/`: Product, architecture, auth, setup, deployment, and operational guides.
- `tests/`: Keep automated test files only unless test documentation is intentionally added.

### Best Practices

1. Update docs in the same PR/commit as code changes.
2. Avoid references to files that do not exist.
3. Keep `files.md` current after structural changes.
4. Prefer linking to existing guides instead of duplicating content.
5. Keep `AGENTS.md` current when build steps, commands, or architecture conventions change.

## Verification

- Documentation links in this file reference existing files only.
- Repository markdown counts reflect the current state.
- Stale references to removed test docs and troubleshooting docs were removed.

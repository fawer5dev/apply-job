# Documentation Organization

## Last Updated

**Date**: June 18, 2026  
**Changes**: Synced documentation map with current repository state, removed stale references, and added file inventory docs.

## Current Documentation Structure

```
apply-job/
├── README.md                         # Project overview and quick start
├── PROJECT_CONTEXT.md                # Complete development context
├── files.md                          # Current repository file inventory
│
└── docs/                             # Technical documentation
    ├── README.md                     # Documentation index
    ├── ARCHITECTURE.md               # Technical architecture
    ├── SETUP.md                      # Installation and setup guide
    ├── QUICK_START.md                # 5-minute setup guide
    ├── DEPLOYMENT.md                 # Deployment guide (Vercel/Railway/Render)
    ├── ENV_VARIABLES.md              # Environment variable reference
    ├── AUTH_FINAL_COMPLETE.md        # Authentication system documentation
    ├── AUTH_IMPLEMENTATION_STATUS.md # Authentication implementation status
    ├── AUTH_PHASE2_COMPLETE.md       # Authentication phase 2 notes
    └── DOCUMENTATION-ORGANIZATION.md # This file
```

## Markdown Files Analysis

- Root markdown files: **3** (`README.md`, `PROJECT_CONTEXT.md`, `files.md`)
- docs markdown files: **9**
- tests markdown files: **0**
- Total markdown files: **12**

## Navigation Guide

1. Start with `README.md` for product overview and setup commands.
2. Use `docs/README.md` for the full documentation index.
3. Use `files.md` to quickly inspect the current repository structure.
4. Use `PROJECT_CONTEXT.md` for complete implementation and architecture context.

## Documentation Access

```bash
# Root docs
cat README.md
cat PROJECT_CONTEXT.md
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

## Verification

- Documentation links in this file reference existing files only.
- Repository markdown counts reflect the current state.
- Stale references to removed test docs and troubleshooting docs were removed.

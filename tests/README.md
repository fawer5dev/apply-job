# Tests Directory

This directory contains all test-related files for the Apply-Job project.

## Directory Structure

```
tests/
├── unit/              # Unit tests for individual functions and components
├── integration/       # Integration tests for API routes and workflows
├── e2e/              # End-to-end tests for full user flows
├── scripts/          # Test utility scripts and helpers
├── docs/             # Test documentation and results
└── fixtures/         # Test data, mocks, and fixtures
```

## Test Types

### Unit Tests (`tests/unit/`)

- Test individual components, functions, and modules in isolation
- Fast execution, no external dependencies
- File naming: `*.test.ts` or `*.test.tsx`
- Example: `button.test.tsx`, `utils.test.ts`

### Integration Tests (`tests/integration/`)

- Test multiple components or modules working together
- May involve API calls, database interactions
- File naming: `test-*.ts` for existing scripts, `*.test.ts` for new Jest tests
- Current scripts:
  - `test-complete-cv-flow.ts` - Tests complete CV upload and processing
  - `test-complete-flow.ts` - Tests end-to-end application flow
  - `test-cv-upload.ts` - Tests CV upload functionality
  - `test-new-application.ts` - Tests new job application creation
  - `test-pdf-extract.ts` - Tests PDF text extraction

### E2E Tests (`tests/e2e/`)

- Test complete user workflows from start to finish
- Simulate real user interactions
- File naming: `*.test.ts` or `*.e2e.ts`

### Scripts (`tests/scripts/`)

- Utility scripts for testing and development
- Manual test helpers
- Current scripts:
  - `test-google-api.ts` - Tests Google Generative AI integration
  - `test-upload-manual.sh` - Manual file upload testing script
  - `test_load.py` - Load testing script

### Fixtures (`tests/fixtures/`)

- Sample data files for testing
- Mock responses and test data
- Example CVs, job descriptions, etc.

## Running Tests

### Jest Tests (Unit/Integration)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Integration Test Scripts

```bash
# Run all integration tests
npm run test:integration

# Run specific integration tests
npm run test:integration:new-app    # New application flow
npm run test:integration:cv         # CV upload
npm run test:integration:pdf        # PDF extraction
npm run test:integration:flow       # Complete flow
```

## Writing New Tests

### Guidelines

1. **Place tests in the correct directory**
   - Unit tests → `tests/unit/`
   - Integration tests → `tests/integration/`
   - E2E tests → `tests/e2e/`

2. **Follow naming conventions**
   - Jest tests: `[feature].test.ts` or `[component].test.tsx`
   - Integration scripts: `test-[feature].ts`

3. **Use descriptive test names**

   ```typescript
   describe('Button component', () => {
     it('should render with correct text', () => {
       // test implementation
     });
   });
   ```

4. **Keep tests isolated and independent**
   - Each test should be able to run independently
   - Clean up after tests (close connections, clear mocks)

5. **Use fixtures for test data**
   - Store sample files in `tests/fixtures/`
   - Create reusable mock data

### Example Unit Test

```typescript
// tests/unit/utils/format.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });
});
```

### Example Integration Test

```typescript
// tests/integration/api/applications.test.ts
import { prisma } from '@/lib/prisma';

describe('Applications API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new application', async () => {
    // test implementation
  });
});
```

## Test Documentation

All test results and documentation are stored in `tests/docs/`:

- `MANUAL-TESTING-GUIDE.md` - Manual testing procedures
- `TEST_REPORT.md` - Overall test reports
- `TEST-RESULTS.md` - Historical test results
- `TEST-NEW-APPLICATION-RESULTS.md` - New application feature tests
- `PDF-DOWNLOAD-TEST-RESULTS.md` - PDF download feature tests

## Best Practices

1. **Write tests as you code** - Don't leave testing for later
2. **Aim for high coverage** - Target 80%+ code coverage for critical paths
3. **Test edge cases** - Don't just test the happy path
4. **Keep tests simple** - Tests should be easy to understand and maintain
5. **Use meaningful assertions** - Make test failures informative
6. **Mock external dependencies** - Keep tests fast and reliable
7. **Document complex tests** - Add comments explaining non-obvious test logic

## Continuous Integration

Tests should be run:

- Before committing changes
- In CI/CD pipeline before deployment
- After any dependency updates

## Troubleshooting

If tests fail:

1. Check the error message and stack trace
2. Verify environment variables are set correctly
3. Ensure database is running (for integration tests)
4. Check that all dependencies are installed
5. Review recent code changes

For more help, see `docs/TROUBLESHOOTING.md` in the project root.

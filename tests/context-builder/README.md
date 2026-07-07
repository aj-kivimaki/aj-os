# Context Builder — Tests

This folder is the home for Context Builder tests.

It is intentionally empty of test code at this stage. Task **CB-001** only
establishes the module boundary; its validation is limited to confirming that
the module builds and can be imported.

No test runner is configured in the repository yet. The testing framework is a
Milestone M1 deliverable and will be introduced by a later foundation task,
after which test files will live here.

> Note: `tsconfig.json` sets `rootDir: ./src`, so test source files must be
> placed under a location covered by the test tooling's own configuration (not
> the default `tsc` build), to keep `npm run build` green.

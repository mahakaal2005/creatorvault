# Java Runtime Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost browser app that can compile and debug single-file Java code step by step.

**Architecture:** Use a dependency-free Node.js local server for the first version so the app can run in this workspace without npm. The server stores sessions, detects Java metadata, compiles with `javac`, launches/controls `jdb` when a JDK is installed, and serves a vanilla HTML/CSS/JS browser UI.

**Tech Stack:** Node.js built-in `http`, `child_process`, `fs`, `path`, and `node:test`; frontend HTML/CSS/JS; local JDK tools `javac`, `java`, and `jdb`.

---

## File Structure

- `package.json`: script shortcuts using built-in Node only.
- `server.js`: local HTTP API and static file server.
- `src/javaSourceAnalyzer.js`: package/class detection and source path mapping.
- `src/sessionStore.js`: in-memory session state and workspace paths.
- `src/toolLocator.js`: detects required JDK tools.
- `src/compiler.js`: writes source files and invokes `javac`.
- `src/jdbDebugger.js`: starts and controls `jdb`, parses current line, locals, and output.
- `public/index.html`: browser app shell.
- `public/styles.css`: responsive debugger UI.
- `public/app.js`: browser state management, API calls, rendering, and controls.
- `test/javaSourceAnalyzer.test.js`: source analyzer tests.
- `test/sessionStore.test.js`: session store tests.
- `test/toolLocator.test.js`: tool detection tests.

## Tasks

### Task 1: Source Analysis

- [ ] Write tests for package detection, class detection, and source path mapping in `test/javaSourceAnalyzer.test.js`.
- [ ] Run `node --test test/javaSourceAnalyzer.test.js` and confirm the tests fail because the module does not exist.
- [ ] Create `src/javaSourceAnalyzer.js` with `analyzeJavaSource(source)`.
- [ ] Run `node --test test/javaSourceAnalyzer.test.js` and confirm the tests pass.

### Task 2: Session State

- [ ] Write tests for creating, updating, and reading sessions in `test/sessionStore.test.js`.
- [ ] Run `node --test test/sessionStore.test.js` and confirm the tests fail because the module does not exist.
- [ ] Create `src/sessionStore.js` with `createSession`, `getSession`, `updateSession`, and `deleteSession`.
- [ ] Run `node --test test/sessionStore.test.js` and confirm the tests pass.

### Task 3: Tool Detection

- [ ] Write tests for finding configured JDK tools and reporting missing tools in `test/toolLocator.test.js`.
- [ ] Run `node --test test/toolLocator.test.js` and confirm the tests fail because the module does not exist.
- [ ] Create `src/toolLocator.js` with `resolveJdkTools(env)` and `findOnPath(command, envPath)`.
- [ ] Run `node --test test/toolLocator.test.js` and confirm the tests pass.

### Task 4: Compiler API

- [ ] Add `src/compiler.js` with `prepareWorkspace` and `compileSession`.
- [ ] Wire compile results into structured JSON containing `ok`, `diagnostics`, `sourceFile`, and `className`.
- [ ] Add a lightweight `/api/sessions` and `/api/sessions/:id/compile` API in `server.js`.
- [ ] Manually test compile failure reporting when JDK tools are missing.

### Task 5: Debugger Adapter

- [ ] Add `src/jdbDebugger.js` with commands for `start`, `step`, `next`, `stepUp`, `cont`, `stop`, and `locals`.
- [ ] Parse `jdb` output into snapshots with `status`, `line`, `stdout`, `stderr`, `stack`, and `variables`.
- [ ] Wire debugger APIs in `server.js`: `/run`, `/command`, `/snapshot`, and `/stop`.
- [ ] Ensure missing `jdb` returns a clear setup error instead of crashing.

### Task 6: Browser UI

- [ ] Create `public/index.html` with editor, stdin, toolbar, flow panel, variables panel, matrix panel, stack panel, and console panel.
- [ ] Create `public/styles.css` for a dense debugger layout that works on desktop and mobile.
- [ ] Create `public/app.js` for session creation, run/step commands, rendering snapshots, and showing setup/compile/runtime errors.
- [ ] Serve the UI from `server.js`.

### Task 7: Verification

- [ ] Run all Node tests with `node --test`.
- [ ] Start the server with `node server.js`.
- [ ] Open `http://localhost:5173`.
- [ ] Confirm the UI loads.
- [ ] If a JDK is installed, paste the knapsack Java sample, provide stdin, compile, run, and step through it.
- [ ] If a JDK is not installed, confirm the UI shows the missing JDK setup message.


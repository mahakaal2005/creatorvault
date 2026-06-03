# Java Runtime Visualizer Design

## Product Summary

Build a localhost browser app that lets a user paste a single Java file, provide standard input, run the program under the real JVM debugger, and control execution step by step. The first version targets DSA and competitive-programming style Java programs, including optional package declarations, any class name, `main(String[] args)`, helper methods in the same file, `Scanner` input, arrays, 2D arrays, loops, conditionals, recursion, and console output.

## Goals

- Let users understand Java execution visually without leaving the browser.
- Execute real Java code instead of simulating Java syntax.
- Provide debugger-style controls: run, pause, step over, step into, step out, continue, restart, stop, and breakpoints.
- Show current line, call stack, local variables, arrays, 2D arrays, console input, and console output.
- Make DSA code easier to understand by rendering arrays and matrices as visual tables when possible.

## Non-Goals for V1

- Full Maven or Gradle project support.
- Multiple Java files.
- GUI Java programs.
- Multi-thread visualization.
- External dependency management.
- Perfect algorithm recognition for every data structure.

## Target User

Students, DSA learners, and competitive programmers who write single-file Java solutions and want to see how values change during execution.

## User Experience

The app opens directly as a tool.

- Top toolbar: debug controls and run status.
- Left panel: Java code editor with breakpoint gutter and current line highlight.
- Center panel: runtime flow view showing the active execution path, branches, loops, and method transitions.
- Right panel: variables, arrays, 2D array tables, object summaries, and call stack.
- Bottom panel: standard input and console output.

For a knapsack dynamic-programming program, the app should show `n`, `W`, `values[]`, `weights[]`, loop counters `i` and `w`, the current condition result, the `dp[][]` table, the active `dp[i][w]` cell, and the final printed answer.

## V1 Functional Requirements

1. The user can paste Java code into an editor.
2. The user can provide stdin text before running.
3. The backend detects package name and public class name.
4. The backend writes the file into a temporary source workspace matching the package path.
5. The backend compiles the file with local `javac`.
6. Compile errors are returned to the browser with line information when available.
7. The backend starts the compiled program under JDWP/JDI debugger control.
8. The browser can issue run, step over, step into, step out, continue, pause, restart, stop, and breakpoint commands.
9. After each pause, the backend sends a normalized runtime snapshot to the browser.
10. Runtime snapshots include current source file, current line, stack frames, local variables, visible arrays, 2D arrays, console output, and process status.
11. Runtime errors and exceptions are shown without crashing the app.
12. The UI remains useful for generic Java code even when no specialized algorithm view is detected.

## Architecture

Use a hybrid architecture: parse enough static code metadata for editor and flow-display support, but rely on the real JVM debugger for execution state.

```text
Browser UI
  |
  | HTTP: create session, compile, start
  | WebSocket: debugger commands and runtime snapshots
  v
Local Backend
  |
  | writes source file, compiles with javac
  v
Debugger Engine
  |
  | launches JVM with JDWP and controls it with JDI
  v
Running Java Program
  |
  | debugger events, stdout, stderr
  v
Runtime State Builder
  |
  | normalized JSON snapshots
  v
Browser Visualizer
```

## Suggested Tech Stack

- Frontend: React, Vite, TypeScript.
- Code editor: Monaco Editor.
- Flow view: React Flow.
- Backend: Java 21 with Spring Boot.
- Debugger: Java Debug Interface.
- Realtime updates: WebSocket.
- Build orchestration: local Java process and local npm frontend tooling.

## Backend Components

- `SourceSessionService`: creates temporary workspaces, stores source code, package metadata, stdin, and session lifecycle state.
- `JavaSourceAnalyzer`: extracts package and public class name from source text.
- `CompileService`: invokes `javac`, captures diagnostics, and returns structured compile results.
- `DebuggerSession`: owns the launched debuggee JVM, JDI virtual machine connection, stdout/stderr readers, breakpoint state, and lifecycle.
- `DebuggerController`: exposes run and control commands over HTTP/WebSocket.
- `RuntimeSnapshotMapper`: converts JDI stack frames, local variables, arrays, and object values into frontend-friendly JSON.

## Frontend Components

- `AppShell`: page layout and session orchestration.
- `CodeWorkspace`: Monaco editor, current-line highlight, and breakpoint gutter.
- `DebugToolbar`: run, step, continue, pause, restart, stop controls.
- `RuntimeFlow`: visual execution path, branch nodes, loops, and method transitions.
- `VariablesPanel`: local variables, primitive values, strings, arrays, and objects.
- `MatrixViewer`: 2D array table with changed cell and current index highlights.
- `CallStackPanel`: active stack frames and method names.
- `ConsolePanel`: stdin editor and stdout/stderr output.

## Runtime Snapshot Contract

Each snapshot sent to the browser should include:

```json
{
  "sessionId": "session-123",
  "status": "PAUSED",
  "sourceFile": "q13069/CTJ13069.java",
  "line": 22,
  "event": "STEP",
  "stdout": "partial output",
  "stderr": "",
  "stack": [
    {
      "frameId": 0,
      "className": "q13069.CTJ13069",
      "methodName": "main",
      "line": 22
    }
  ],
  "variables": [
    { "name": "n", "type": "int", "value": 4 },
    { "name": "values", "type": "int[]", "value": [1, 2, 3, 4] },
    { "name": "dp", "type": "int[][]", "value": [[0, 0], [0, 1]] }
  ],
  "highlights": {
    "matrix": {
      "name": "dp",
      "row": 1,
      "column": 2
    }
  }
}
```

## Error Handling

- Missing JDK: show a setup message explaining that local `javac` and `java` are required.
- Compile errors: show diagnostics beside the editor and do not start a debug session.
- Runtime exceptions: pause on exception and show exception type, message, line, variables, and stack.
- Infinite loops: allow pause and stop controls.
- Unsupported values: show summarized object identity and fields when safe; fall back to string summaries for complex objects.

## Testing Strategy

- Unit tests for source analysis: package detection, class detection, filename mapping.
- Unit tests for compile result parsing and error reporting.
- Integration tests for compiling and stepping through sample Java programs.
- Snapshot mapper tests for primitives, strings, arrays, 2D arrays, recursion, and exceptions.
- Frontend component tests for rendering snapshots, arrays, call stack, and console state.
- Manual browser verification with a knapsack sample program.

## V1 Acceptance Criteria

- A user can open the localhost app and paste the provided knapsack Java program.
- The app detects `package q13069` and class `CTJ13069`.
- The user can enter stdin and run the program.
- The app compiles and starts a real debug session.
- Step controls move through the actual executing Java lines.
- The current line is highlighted.
- Variables update after each step.
- `int[]` arrays render as arrays.
- `int[][] dp` renders as a table.
- Console output displays the final answer.
- Runtime and compile errors are displayed clearly.


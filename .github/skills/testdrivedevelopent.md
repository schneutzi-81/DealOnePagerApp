---
name: tdd
description: Test-driven development workflow — Red, Green, Refactor. Use this skill whenever the user asks for new code, a bug fix, or a refactor, even if they do not say the word "test". Trigger on phrases like "implement X", "add a function that…", "fix this bug", "refactor this", "write me a class for…", or "build a small CLI / endpoint / parser". Drives implementation by writing the failing test first, then the minimal code to pass, then a clean-up pass — and applies across Python (pytest), JS/TS (jest, vitest), .NET (xUnit, NUnit), and Java (JUnit 5).
---

# Test-Driven Development

Drive all implementation through tests. New features, bug fixes, and refactors all go through the same loop. The goal is not "having tests" — it is letting tests shape the design.

## Core principle

Never write production code without a failing test first. If you did not watch the test fail, you do not know whether it tests the right thing — a test that passes on the first run might be testing nothing at all.

## The loop: Red → Green → Refactor

### 🔴 Red — write a failing test

Write the smallest possible test for the next behavior. Run it and confirm it fails for the right reason (missing function, wrong return value — not a syntax error or import error). A test that has never been observed failing is not a TDD test.

### 🟢 Green — make it pass minimally

Write only the code needed to turn the failing test green. Resist the urge to add the next feature, handle the next edge case, or refactor on the way. Hardcoding a return value is acceptable here — the next failing test will force generalization. Run the full suite; everything must be green before moving on.

### 🔵 Refactor — clean up with the safety net

Improve names, remove duplication, extract helpers, apply patterns. Behavior must not change — the suite stays green throughout. Commit after the refactor so the history shows working state at each step.

## Rules

- One failing test at a time. Never stack multiple reds — you will lose track of which change fixed what.
- Test behavior through public interfaces, not implementation details. Tests coupled to internals break on every refactor and discourage cleanup.
- Tests must be deterministic. No real clocks, real network, real filesystem, or unseeded randomness — inject or mock them.
- Each test should have one reason to fail. If a test breaks, the name alone should tell you what regressed.
- Test names describe behavior, not mechanics. `should_reject_negative_amounts` beats `test_validate_2`.

## Good vs. bad tests

✅ Good — names the behavior, asserts one thing, fails for one reason:

```python
def test_add_returns_sum_of_two_positive_numbers():
    assert add(2, 3) == 5
```

❌ Bad — no assertion, name says nothing, a passing run proves nothing:

```python
def test_add():
    result = add(2, 3)
    # no assertion
```

❌ Also bad — couples to internals; renaming `_buffer` breaks the test even though behavior is unchanged:

```python
def test_writer_uses_internal_buffer():
    w = Writer()
    w.write("hi")
    assert w._buffer == ["hi"]
```

## When you are tempted to skip the loop

These are the moments TDD discipline matters most, because skipping feels reasonable:

- "It's just a one-liner." One-liners are where off-by-one errors live. Write the test.
- "I'll add tests after." You won't, and even if you do, they will be shaped to pass rather than to challenge.
- "I already know it works." Then the test takes thirty seconds and confirms it. If it doesn't work, you just saved an hour.
- "The bug is obvious." Reproduce it in a test first. The test becomes the regression guard.

## Checklist before declaring a feature done

- Test written before the implementation
- Test was observed failing (red) for the right reason
- Minimal implementation made it pass (green)
- Code refactored without breaking the suite
- Full suite green, not just the new test
- Test names read as behavior statements

## Tooling

| Stack | Test runner |
|---|---|
| Python | `pytest` |
| JS / TS | `jest` or `vitest` |
| .NET | `xUnit` or `NUnit` |
| Java | `JUnit 5` |

Run the full suite on every push in CI (GitHub Actions, Azure Pipelines, etc.). A green local run with a red CI run almost always means an environment dependency leaked into a test — fix the test, not the CI.

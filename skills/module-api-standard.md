# Module API Standard v1.0

## Problem

Modules become inconsistent and hard to use when:
- Functions return different types (sometimes objects, sometimes primitives, sometimes nothing)
- Too many functions (10+) making the API overwhelming
- No clear entry point

## Solution

Standardize all modules with consistent API pattern.

## API Pattern

```javascript
window.Snake[ModuleName] = {
  createModule({ storage }) {
    // Private functions
    
    // Public API - exactly these 5 types
    return {
      getData()      { /* returns { success, data, error } */ },
      getSummary()   { /* returns { success, summary, error } */ },
      execute()       { /* returns { success, result, error } */ },
      markDone()      { /* returns { success, result, error } */ },
      validate()      { /* returns { valid, errors } */ }
    };
  }
};
```

## Rules

| Rule | Limit |
|------|-------|
| Public functions | ≤ 5 |
| Return type | Always `{ success, data/error }` |
| Entry point | `getData()` required |
| Validation | `validate()` required |

## Return Type Enforcement

```javascript
// Good
function getData() {
  try {
    const data = computeData();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Bad
function getData() {
  return computeData(); // inconsistent - might throw or return anything
}
```

## Module Creation Checklist

- [ ] ≤ 5 public functions
- [ ] All functions return `{ success, ... }` pattern
- [ ] Has `getData()` as main entry
- [ ] Has `validate()` for sanity check
- [ ] Functions are related (same domain)
- [ ] Not too large (split if > 200 lines)

## When to Split Modules

| Sign | Action |
|------|--------|
| > 5 public functions | Split into 2 modules |
| Unrelated function groups | Split by domain |
| > 300 lines | Split into smaller modules |

## Anti-Patterns to Avoid

```javascript
// BAD: Inconsistent return types
function getDays() { return days; }
function getTier() { return { tier }; }

// BAD: Too many functions
return {
  getData, getSummary, getDetail, getList, getStats,
  add, remove, update, delete, create,
  validate, check, verify, confirm,
  execute, run, start, stop, pause, resume
  // 15 functions = too many
};

// GOOD: Consistent, limited
return {
  getData,      // main entry
  getSummary,   // quick overview
  execute,      // do action
  markDone,     // mark as complete
  validate      // sanity check
};
```

## Benefits

1. **Predictable** - Users know what to expect
2. **Debuggable** - Always know success/failure
3. **Composable** - Functions work together
4. **Testable** - Consistent interface

## Game-Specific Patterns

### UI Clutter Prevention

**Problem**: Toolbar buttons accumulate, making UI拥挤

**Solution**: Compact toolbar with dropdown menu
```html
<!-- Before: 6 buttons -->
<button>新手引导</button>
<button>技能树</button>
<button>关卡进度</button>
<button>快速开始</button>
<button>回流中心</button>
<button>回流任务</button>

<!-- After: 4 + dropdown -->
<button>新手</button>
<button>🎯</button>
<button>🏆</button>
<button>⚡</button>
<div style="position:relative;">
  <button id="moreMenuBtn">⋯</button>
  <div id="moreMenuDropdown" style="display:none; position:absolute; right:0;">
    <button>回流中心</button>
    <button>回流任务</button>
  </div>
</div>
```

### Task Reset Mechanism

**Problem**: Tasks complete but never reset, user has no continued goal

**Solution**: Add `resetMissions()` with expiration logic
```javascript
function resetMissions() {
  const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  missions.forEach(m => {
    const p = progress[m.id];
    if (p && p.claimedAt && (Date.now() - p.claimedAt) > EXPIRY_MS) {
      delete progress[m.id]; // Reset expired
    }
  });
  saveMissionProgress(progress);
}
```

**Trigger**: Call reset on panel open
```javascript
showMissionsBtn.addEventListener('click', () => {
  missionsModule.resetMissions(); // Reset first
  const { data } = missionsModule.getData();
  renderMissions(data);
});
```

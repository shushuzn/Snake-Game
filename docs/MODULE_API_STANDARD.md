# 模块 API 规范 v1.0

## 原则

每个模块应该有清晰、一致的 API。

## 标准 API 模式

```javascript
window.Snake[ModuleName] = {
  createModule({ storage }) {
    // 私有函数
    
    // 公开 API（统一返回类型）
    return {
      // 1. 获取主数据
      getData()           // 返回 { success, data, error }
      
      // 2. 获取摘要
      getSummary()        // 返回 { success, summary, error }
      
      // 3. 获取详情
      getDetail(id)       // 返回 { success, detail, error }
      
      // 4. 执行操作
      execute(action, params) // 返回 { success, result, error }
      
      // 5. 验证
      validate()          // 返回 { valid, errors }
    };
  }
};
```

## 返回类型规范

| 函数类型 | 返回格式 |
|----------|----------|
| 查询类 | `{ success: true, data: {...} }` |
| 操作类 | `{ success: true, result: {...} }` |
| 错误时 | `{ success: false, error: 'message' }` |

## 函数数量限制

- **最少**: 2 个函数
- **最多**: 5 个公开函数
- **建议**: 3 个

## 示例

```javascript
// Good: 统一返回类型
function getRewardPreview() {
  try {
    return { success: true, data: preview };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Bad: 返回类型不一致
function getReturnDays() {
  return days; // 直接返回数字
}
```

## 检查清单

- [ ] 所有公开函数返回统一格式
- [ ] 公开函数不超过 5 个
- [ ] 有 getData() 作为主入口
- [ ] 有 validate() 验证输入

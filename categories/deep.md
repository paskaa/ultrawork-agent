# Deep - 深度执行类别

## 类别描述

深度自主调研与执行。涉及复杂功能开发、系统重构、模块实现等需要深入思考和全面实现的任务。

## 关键词

| 关键词 | 匹配权重 |
|--------|----------|
| 重构 | 高 |
| 架构 | 高 |
| 实现 | 高 |
| 开发 | 高 |
| 复杂 | 高 |
| 功能 | 高 |
| 模块 | 高 |
| 系统 | 高 |
| 集成 | 高 |
| 完善 | 中 |
| 优化 | 中 |
| 扩展 | 中 |
| 迁移 | 中 |
| 改造 | 中 |

## 模型选择

| 优先级 | 模型 | 原因 |
|--------|------|------|
| 首选 | kimi-k2.5 | 擅长长文本理解、复杂推理 |
| 备选 | glm-5 | 快速、编码能力强 |

## 典型任务

### 高匹配度
- "实现药品库存管理系统"
- "重构用户认证模块"
- "开发医保对接功能"
- "实现报表导出功能"

### 中等匹配度
- "优化查询性能"
- "扩展支付功能"
- "完善权限系统"

### 低匹配度
- "添加日志记录"
- "修改配置"

## 执行策略

### 分配 Agent
- **Hephaestus**: 主要执行者（深度自主执行）
- **Explorer**: 代码探索、模式发现
- **Prometheus**: 复杂任务的前期规划（可选）

### 并行策略
```
深度任务
├── Explorer: 探索现有代码、依赖关系
├── Hephaestus: 后端实现
└── Hephaestus: 前端实现（如需要）
```

### Ralph Loop 触发
- 任务复杂度高
- 涉及多个模块
- 需要验证完整性

## 执行流程

```
1. 探索阶段
   - 分析现有代码结构
   - 识别依赖关系
   - 理解业务逻辑

2. 规划阶段
   - 确定技术方案
   - 分解子任务
   - 规划实现顺序

3. 实现阶段
   - 逐个完成子任务
   - 保持代码质量
   - 遵循项目规范

4. 验证阶段
   - 功能测试
   - 代码审查
   - 文档更新
```

## OpenHIS 项目规范

### 后端结构
```
openhis-server-new/
├── openhis-application/
│   └── src/main/java/com/openhis/web/
│       └── [module]/
│           ├── controller/
│           ├── dto/
│           └── appservice/
├── openhis-domain/
│   └── src/main/java/com/openhis/[package]/
│       ├── domain/
│       ├── mapper/
│       └── service/
```

### 分层规范
- **Controller**: 接口层，处理请求响应
- **AppService**: 应用服务层，编排业务
- **Service**: 领域服务，核心业务
- **Mapper**: 数据访问层

### 代码规范
```java
// Controller
@RestController
@RequestMapping("/module")
public class XxxController extends BaseController {

    @RequiresPermissions("module:action")
    @Log(title = "模块", businessType = BusinessType.LIST)
    @GetMapping("/list")
    public TableDataInfo list(XxxQuery query) {
        startPage();
        return getDataTable(service.list(query));
    }
}

// Entity
@Data
@TableName("table_name")
public class XxxEntity extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    // ... fields
}

// Service
@Service
public class XxxServiceImpl implements XxxService {
    // 软删除: wrapper.eq("valid_flag", 1)
}
```

## 输出模板

```markdown
## 深度执行报告

**任务**: [描述]
**类别**: deep
**模型**: [使用的模型]
**复杂度**: [高/中/低]

### 实现概览

[总体说明]

### 变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| path/to/file | 新增/修改 | 说明 |

### 数据库变更

```sql
-- 新增表/字段
```

### API 变更

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/xxx | GET | 说明 |

### 功能验证

1. [验证步骤1]
2. [验证步骤2]

### 注意事项

- [ ] 数据库迁移
- [ ] 权限配置
- [ ] 前端适配
```
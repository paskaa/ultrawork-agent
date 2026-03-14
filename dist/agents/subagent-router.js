/**
 * Subagent Type Router - OpenCode 内置类型路由器
 * 将 OpenCode 内置 subagent 类型映射到 UltraWork 三国军团武将
 */
import * as fs from 'fs';
import * as path from 'path';
// 内置类型到武将的默认映射
const DEFAULT_SUBAGENT_MAPPINGS = {
    explore: {
        agent: 'simayi',
        category: 'explore',
        description: '代码探索、信息收集 → 司马懿 (仲达)',
        supportAgents: ['simashi', 'simazhao']
    },
    'code-reviewer': {
        agent: 'guanyu',
        category: 'review',
        description: '代码审查、质量把关 → 关羽 (云长)',
        supportAgents: ['guanping', 'zhoucang']
    },
    'tdd-guide': {
        agent: 'xushu',
        category: 'test',
        description: '测试驱动开发 → 徐庶 (元直)',
        supportAgents: ['panglin', 'yanyan']
    },
    'security-reviewer': {
        agent: 'yujin',
        category: 'security',
        description: '安全审计、漏洞扫描 → 于禁 (文则)',
        supportAgents: ['maojie', 'dongzhao']
    },
    'refactor-cleaner': {
        agent: 'simayi',
        category: 'explore',
        description: '死代码清理、重构 → 司马懿 (仲达)',
        supportAgents: ['simashi', 'simazhao']
    },
    'python-reviewer': {
        agent: 'chendao',
        category: 'deep',
        description: 'Python代码审查 → 陈到 (叔至)',
        supportAgents: []
    },
    'go-reviewer': {
        agent: 'chendao',
        category: 'deep',
        description: 'Go代码审查 → 陈到 (叔至)',
        supportAgents: []
    },
    'go-build-resolver': {
        agent: 'chendao',
        category: 'quick',
        description: 'Go构建错误修复 → 陈到 (叔至)',
        supportAgents: []
    },
    'e2e-runner': {
        agent: 'liuye',
        category: 'monitor',
        description: 'E2E测试、Playwright → 刘晔 (子扬)',
        supportAgents: []
    },
    'doc-updater': {
        agent: 'simazhao',
        category: 'writing',
        description: '文档更新、codemap → 司马昭 (子上)',
        supportAgents: []
    },
    'database-reviewer': {
        agent: 'zhangliao',
        category: 'database',
        description: 'PostgreSQL审查 → 张辽 (文远)',
        supportAgents: ['yuejin', 'lidian']
    },
    'build-error-resolver': {
        agent: 'zhangfei',
        category: 'quick',
        description: '构建错误修复 → 张飞 (翼德)',
        supportAgents: ['leixu', 'wulan']
    },
    'loop-operator': {
        agent: 'zhugeliang',
        category: 'ultrabrain',
        description: 'Agent循环操作 → 诸葛亮 (孔明)',
        supportAgents: []
    },
    'harness-optimizer': {
        agent: 'zhouyu',
        category: 'ultrabrain',
        description: 'Harness优化 → 周瑜 (公瑾)',
        supportAgents: ['lusu', 'huanggai']
    },
    planner: {
        agent: 'zhouyu',
        category: 'ultrabrain',
        description: '任务规划 → 周瑜 (公瑾)',
        supportAgents: ['lusu', 'huanggai']
    },
    architect: {
        agent: 'zhouyu',
        category: 'ultrabrain',
        description: '架构设计 → 周瑜 (公瑾)',
        supportAgents: ['lusu', 'huanggai']
    }
};
let customMappings = null;
/**
 * 加载自定义映射配置
 */
function loadCustomMappings(configPath) {
    if (customMappings)
        return customMappings;
    try {
        const mappingPath = configPath
            ? path.join(configPath, 'subagent-mapping.json')
            : path.join(process.cwd(), 'config', 'subagent-mapping.json');
        if (fs.existsSync(mappingPath)) {
            const content = fs.readFileSync(mappingPath, 'utf-8');
            const config = JSON.parse(content);
            customMappings = config.mappings || {};
            console.log(`[SubagentRouter] 已加载自定义映射: ${Object.keys(customMappings).length} 个类型`);
            return customMappings;
        }
    }
    catch (error) {
        console.log('[SubagentRouter] 未找到自定义映射配置，使用默认映射');
    }
    customMappings = {};
    return customMappings;
}
/**
 * 获取完整的映射配置（默认 + 自定义）
 */
export function getSubagentMappings(configPath) {
    const custom = loadCustomMappings(configPath);
    return { ...DEFAULT_SUBAGENT_MAPPINGS, ...custom };
}
/**
 * 检查是否为 OpenCode 内置类型
 */
export function isBuiltInSubagentType(type) {
    if (!type)
        return false;
    const normalizedType = type.toLowerCase();
    return Object.keys(DEFAULT_SUBAGENT_MAPPINGS).some(key => key.toLowerCase() === normalizedType);
}
/**
 * 根据 subagent_type 路由到武将
 * @param {string} subagentType - OpenCode 内置类型
 * @param {object} config - UltraWork 配置
 * @param {string} configPath - 配置文件路径
 * @returns {object|null} - 路由结果
 */
export function routeBySubagentType(subagentType, config, configPath) {
    if (!subagentType)
        return null;
    const mappings = getSubagentMappings(configPath);
    const normalizedType = subagentType.toLowerCase();
    // 查找匹配的映射
    const mapping = Object.entries(mappings).find(([key]) => key.toLowerCase() === normalizedType)?.[1];
    if (!mapping)
        return null;
    // 获取 agent 配置
    const agents = config?.agents || {};
    const agentConfig = agents[mapping.agent];
    const categories = config?.categories || {};
    const categoryConfig = categories[mapping.category];
    return {
        agent: mapping.agent,
        category: mapping.category,
        description: mapping.description,
        primaryAgent: mapping.agent,
        supportAgents: mapping.supportAgents || [],
        model: categoryConfig?.model || agentConfig?.model,
        fallbackModels: categoryConfig?.fallback_models || agentConfig?.fallback_models || [],
        isBuiltInType: true,
        subagentType: subagentType
    };
}
/**
 * 获取所有支持的 OpenCode 内置类型
 */
export function getSupportedSubagentTypes(configPath) {
    const mappings = getSubagentMappings(configPath);
    return Object.keys(mappings);
}
/**
 * 获取类型到武将的反向查找表
 */
export function getReverseLookup(configPath) {
    const mappings = getSubagentMappings(configPath);
    const reverse = {};
    Object.entries(mappings).forEach(([type, mapping]) => {
        if (!reverse[mapping.agent]) {
            reverse[mapping.agent] = [];
        }
        reverse[mapping.agent].push(type);
    });
    return reverse;
}
/**
 * 打印路由映射表（用于调试）
 */
export function printRoutingTable(configPath) {
    const mappings = getSubagentMappings(configPath);
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║     OpenCode 内置类型 → UltraWork 武将 映射表            ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    Object.entries(mappings).forEach(([type, mapping]) => {
        const supportStr = mapping.supportAgents?.length > 0
            ? ` + ${mapping.supportAgents.join(', ')}`
            : '';
        console.log(`║ ${type.padEnd(20)} → ${mapping.agent.padEnd(12)}${supportStr}`);
    });
    console.log('╚══════════════════════════════════════════════════════════╝\n');
}
export default {
    routeBySubagentType,
    isBuiltInSubagentType,
    getSubagentMappings,
    getSupportedSubagentTypes,
    getReverseLookup,
    printRoutingTable
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViYWdlbnQtcm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FnZW50cy9zdWJhZ2VudC1yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFFN0IsZUFBZTtBQUNmLE1BQU0seUJBQXlCLEdBQUc7SUFDaEMsT0FBTyxFQUFFO1FBQ1AsS0FBSyxFQUFFLFFBQVE7UUFDZixRQUFRLEVBQUUsU0FBUztRQUNuQixXQUFXLEVBQUUsc0JBQXNCO1FBQ25DLGFBQWEsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7S0FDdkM7SUFDRCxlQUFlLEVBQUU7UUFDZixLQUFLLEVBQUUsUUFBUTtRQUNmLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxxQkFBcUI7UUFDbEMsYUFBYSxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztLQUN4QztJQUNELFdBQVcsRUFBRTtRQUNYLEtBQUssRUFBRSxPQUFPO1FBQ2QsUUFBUSxFQUFFLE1BQU07UUFDaEIsV0FBVyxFQUFFLGtCQUFrQjtRQUMvQixhQUFhLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO0tBQ3JDO0lBQ0QsbUJBQW1CLEVBQUU7UUFDbkIsS0FBSyxFQUFFLE9BQU87UUFDZCxRQUFRLEVBQUUsVUFBVTtRQUNwQixXQUFXLEVBQUUscUJBQXFCO1FBQ2xDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUM7S0FDdEM7SUFDRCxrQkFBa0IsRUFBRTtRQUNsQixLQUFLLEVBQUUsUUFBUTtRQUNmLFFBQVEsRUFBRSxTQUFTO1FBQ25CLFdBQVcsRUFBRSxxQkFBcUI7UUFDbEMsYUFBYSxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztLQUN2QztJQUNELGlCQUFpQixFQUFFO1FBQ2pC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UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO0FBQ2hGLENBQUM7QUFFRCxlQUFlO0lBQ2IsbUJBQW1CO0lBQ25CLHFCQUFxQjtJQUNyQixtQkFBbUI7SUFDbkIseUJBQXlCO0lBQ3pCLGdCQUFnQjtJQUNoQixpQkFBaUI7Q0FDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU3ViYWdlbnQgVHlwZSBSb3V0ZXIgLSBPcGVuQ29kZSDlhoXnva7nsbvlnovot6/nlLHlmahcbiAqIOWwhiBPcGVuQ29kZSDlhoXnva4gc3ViYWdlbnQg57G75Z6L5pig5bCE5YiwIFVsdHJhV29yayDkuInlm73lhpvlm6LmrablsIZcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyDlhoXnva7nsbvlnovliLDmrablsIbnmoTpu5jorqTmmKDlsIRcbmNvbnN0IERFRkFVTFRfU1VCQUdFTlRfTUFQUElOR1MgPSB7XG4gIGV4cGxvcmU6IHtcbiAgICBhZ2VudDogJ3NpbWF5aScsXG4gICAgY2F0ZWdvcnk6ICdleHBsb3JlJyxcbiAgICBkZXNjcmlwdGlvbjogJ+S7o+eggeaOoue0ouOAgeS/oeaBr+aUtumbhiDihpIg5Y+46ams5oe/ICjku7Lovr4pJyxcbiAgICBzdXBwb3J0QWdlbnRzOiBbJ3NpbWFzaGknLCAnc2ltYXpoYW8nXVxuICB9LFxuICAnY29kZS1yZXZpZXdlcic6IHtcbiAgICBhZ2VudDogJ2d1YW55dScsXG4gICAgY2F0ZWdvcnk6ICdyZXZpZXcnLFxuICAgIGRlc2NyaXB0aW9uOiAn5Luj56CB5a6h5p+l44CB6LSo6YeP5oqK5YWzIOKGkiDlhbPnvr0gKOS6kemVvyknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFsnZ3VhbnBpbmcnLCAnemhvdWNhbmcnXVxuICB9LFxuICAndGRkLWd1aWRlJzoge1xuICAgIGFnZW50OiAneHVzaHUnLFxuICAgIGNhdGVnb3J5OiAndGVzdCcsXG4gICAgZGVzY3JpcHRpb246ICfmtYvor5XpqbHliqjlvIDlj5Eg4oaSIOW+kOW6tiAo5YWD55u0KScsXG4gICAgc3VwcG9ydEFnZW50czogWydwYW5nbGluJywgJ3lhbnlhbiddXG4gIH0sXG4gICdzZWN1cml0eS1yZXZpZXdlcic6IHtcbiAgICBhZ2VudDogJ3l1amluJyxcbiAgICBjYXRlZ29yeTogJ3NlY3VyaXR5JyxcbiAgICBkZXNjcmlwdGlvbjogJ+WuieWFqOWuoeiuoeOAgea8j+a0nuaJq+aPjyDihpIg5LqO56aBICjmlofliJkpJyxcbiAgICBzdXBwb3J0QWdlbnRzOiBbJ21hb2ppZScsICdkb25nemhhbyddXG4gIH0sXG4gICdyZWZhY3Rvci1jbGVhbmVyJzoge1xuICAgIGFnZW50OiAnc2ltYXlpJyxcbiAgICBjYXRlZ29yeTogJ2V4cGxvcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAn5q275Luj56CB5riF55CG44CB6YeN5p6EIOKGkiDlj7jpqazmh78gKOS7sui+viknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFsnc2ltYXNoaScsICdzaW1hemhhbyddXG4gIH0sXG4gICdweXRob24tcmV2aWV3ZXInOiB7XG4gICAgYWdlbnQ6ICdjaGVuZGFvJyxcbiAgICBjYXRlZ29yeTogJ2RlZXAnLFxuICAgIGRlc2NyaXB0aW9uOiAnUHl0aG9u5Luj56CB5a6h5p+lIOKGkiDpmYjliLAgKOWPlOiHsyknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtdXG4gIH0sXG4gICdnby1yZXZpZXdlcic6IHtcbiAgICBhZ2VudDogJ2NoZW5kYW8nLFxuICAgIGNhdGVnb3J5OiAnZGVlcCcsXG4gICAgZGVzY3JpcHRpb246ICdHb+S7o+eggeWuoeafpSDihpIg6ZmI5YiwICjlj5Toh7MpJyxcbiAgICBzdXBwb3J0QWdlbnRzOiBbXVxuICB9LFxuICAnZ28tYnVpbGQtcmVzb2x2ZXInOiB7XG4gICAgYWdlbnQ6ICdjaGVuZGFvJyxcbiAgICBjYXRlZ29yeTogJ3F1aWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dv5p6E5bu66ZSZ6K+v5L+u5aSNIOKGkiDpmYjliLAgKOWPlOiHsyknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtdXG4gIH0sXG4gICdlMmUtcnVubmVyJzoge1xuICAgIGFnZW50OiAnbGl1eWUnLFxuICAgIGNhdGVnb3J5OiAnbW9uaXRvcicsXG4gICAgZGVzY3JpcHRpb246ICdFMkXmtYvor5XjgIFQbGF5d3JpZ2h0IOKGkiDliJjmmZQgKOWtkOaJrCknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtdXG4gIH0sXG4gICdkb2MtdXBkYXRlcic6IHtcbiAgICBhZ2VudDogJ3NpbWF6aGFvJyxcbiAgICBjYXRlZ29yeTogJ3dyaXRpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAn5paH5qGj5pu05paw44CBY29kZW1hcCDihpIg5Y+46ams5pitICjlrZDkuIopJyxcbiAgICBzdXBwb3J0QWdlbnRzOiBbXVxuICB9LFxuICAnZGF0YWJhc2UtcmV2aWV3ZXInOiB7XG4gICAgYWdlbnQ6ICd6aGFuZ2xpYW8nLFxuICAgIGNhdGVnb3J5OiAnZGF0YWJhc2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnUG9zdGdyZVNRTOWuoeafpSDihpIg5byg6L69ICjmlofov5wpJyxcbiAgICBzdXBwb3J0QWdlbnRzOiBbJ3l1ZWppbicsICdsaWRpYW4nXVxuICB9LFxuICAnYnVpbGQtZXJyb3ItcmVzb2x2ZXInOiB7XG4gICAgYWdlbnQ6ICd6aGFuZ2ZlaScsXG4gICAgY2F0ZWdvcnk6ICdxdWljaycsXG4gICAgZGVzY3JpcHRpb246ICfmnoTlu7rplJnor6/kv67lpI0g4oaSIOW8oOmjniAo57+85b63KScsXG4gICAgc3VwcG9ydEFnZW50czogWydsZWl4dScsICd3dWxhbiddXG4gIH0sXG4gICdsb29wLW9wZXJhdG9yJzoge1xuICAgIGFnZW50OiAnemh1Z2VsaWFuZycsXG4gICAgY2F0ZWdvcnk6ICd1bHRyYWJyYWluJyxcbiAgICBkZXNjcmlwdGlvbjogJ0FnZW505b6q546v5pON5L2cIOKGkiDor7jokZvkuq4gKOWtlOaYjiknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtdXG4gIH0sXG4gICdoYXJuZXNzLW9wdGltaXplcic6IHtcbiAgICBhZ2VudDogJ3pob3V5dScsXG4gICAgY2F0ZWdvcnk6ICd1bHRyYWJyYWluJyxcbiAgICBkZXNjcmlwdGlvbjogJ0hhcm5lc3PkvJjljJYg4oaSIOWRqOeRnCAo5YWs55G+KScsXG4gICAgc3VwcG9ydEFnZW50czogWydsdXN1JywgJ2h1YW5nZ2FpJ11cbiAgfSxcbiAgcGxhbm5lcjoge1xuICAgIGFnZW50OiAnemhvdXl1JyxcbiAgICBjYXRlZ29yeTogJ3VsdHJhYnJhaW4nLFxuICAgIGRlc2NyaXB0aW9uOiAn5Lu75Yqh6KeE5YiSIOKGkiDlkajnkZwgKOWFrOeRviknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFsnbHVzdScsICdodWFuZ2dhaSddXG4gIH0sXG4gIGFyY2hpdGVjdDoge1xuICAgIGFnZW50OiAnemhvdXl1JyxcbiAgICBjYXRlZ29yeTogJ3VsdHJhYnJhaW4nLFxuICAgIGRlc2NyaXB0aW9uOiAn5p625p6E6K6+6K6hIOKGkiDlkajnkZwgKOWFrOeRviknLFxuICAgIHN1cHBvcnRBZ2VudHM6IFsnbHVzdScsICdodWFuZ2dhaSddXG4gIH1cbn07XG5cbmxldCBjdXN0b21NYXBwaW5ncyA9IG51bGw7XG5cbi8qKlxuICog5Yqg6L296Ieq5a6a5LmJ5pig5bCE6YWN572uXG4gKi9cbmZ1bmN0aW9uIGxvYWRDdXN0b21NYXBwaW5ncyhjb25maWdQYXRoKSB7XG4gIGlmIChjdXN0b21NYXBwaW5ncykgcmV0dXJuIGN1c3RvbU1hcHBpbmdzO1xuICBcbiAgdHJ5IHtcbiAgICBjb25zdCBtYXBwaW5nUGF0aCA9IGNvbmZpZ1BhdGggXG4gICAgICA/IHBhdGguam9pbihjb25maWdQYXRoLCAnc3ViYWdlbnQtbWFwcGluZy5qc29uJylcbiAgICAgIDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjb25maWcnLCAnc3ViYWdlbnQtbWFwcGluZy5qc29uJyk7XG4gICAgXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMobWFwcGluZ1BhdGgpKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKG1hcHBpbmdQYXRoLCAndXRmLTgnKTtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICBjdXN0b21NYXBwaW5ncyA9IGNvbmZpZy5tYXBwaW5ncyB8fCB7fTtcbiAgICAgIGNvbnNvbGUubG9nKGBbU3ViYWdlbnRSb3V0ZXJdIOW3suWKoOi9veiHquWumuS5ieaYoOWwhDogJHtPYmplY3Qua2V5cyhjdXN0b21NYXBwaW5ncykubGVuZ3RofSDkuKrnsbvlnotgKTtcbiAgICAgIHJldHVybiBjdXN0b21NYXBwaW5ncztcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coJ1tTdWJhZ2VudFJvdXRlcl0g5pyq5om+5Yiw6Ieq5a6a5LmJ5pig5bCE6YWN572u77yM5L2/55So6buY6K6k5pig5bCEJyk7XG4gIH1cbiAgXG4gIGN1c3RvbU1hcHBpbmdzID0ge307XG4gIHJldHVybiBjdXN0b21NYXBwaW5ncztcbn1cblxuLyoqXG4gKiDojrflj5blrozmlbTnmoTmmKDlsITphY3nva7vvIjpu5jorqQgKyDoh6rlrprkuYnvvIlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN1YmFnZW50TWFwcGluZ3MoY29uZmlnUGF0aCkge1xuICBjb25zdCBjdXN0b20gPSBsb2FkQ3VzdG9tTWFwcGluZ3MoY29uZmlnUGF0aCk7XG4gIHJldHVybiB7IC4uLkRFRkFVTFRfU1VCQUdFTlRfTUFQUElOR1MsIC4uLmN1c3RvbSB9O1xufVxuXG4vKipcbiAqIOajgOafpeaYr+WQpuS4uiBPcGVuQ29kZSDlhoXnva7nsbvlnotcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnVpbHRJblN1YmFnZW50VHlwZSh0eXBlKSB7XG4gIGlmICghdHlwZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBub3JtYWxpemVkVHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKERFRkFVTFRfU1VCQUdFTlRfTUFQUElOR1MpLnNvbWUoXG4gICAga2V5ID0+IGtleS50b0xvd2VyQ2FzZSgpID09PSBub3JtYWxpemVkVHlwZVxuICApO1xufVxuXG4vKipcbiAqIOagueaNriBzdWJhZ2VudF90eXBlIOi3r+eUseWIsOatpuWwhlxuICogQHBhcmFtIHtzdHJpbmd9IHN1YmFnZW50VHlwZSAtIE9wZW5Db2RlIOWGhee9ruexu+Wei1xuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIFVsdHJhV29yayDphY3nva5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWdQYXRoIC0g6YWN572u5paH5Lu26Lev5b6EXG4gKiBAcmV0dXJucyB7b2JqZWN0fG51bGx9IC0g6Lev55Sx57uT5p6cXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3V0ZUJ5U3ViYWdlbnRUeXBlKHN1YmFnZW50VHlwZSwgY29uZmlnLCBjb25maWdQYXRoKSB7XG4gIGlmICghc3ViYWdlbnRUeXBlKSByZXR1cm4gbnVsbDtcbiAgXG4gIGNvbnN0IG1hcHBpbmdzID0gZ2V0U3ViYWdlbnRNYXBwaW5ncyhjb25maWdQYXRoKTtcbiAgY29uc3Qgbm9ybWFsaXplZFR5cGUgPSBzdWJhZ2VudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgXG4gIC8vIOafpeaJvuWMuemFjeeahOaYoOWwhFxuICBjb25zdCBtYXBwaW5nID0gT2JqZWN0LmVudHJpZXMobWFwcGluZ3MpLmZpbmQoXG4gICAgKFtrZXldKSA9PiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gbm9ybWFsaXplZFR5cGVcbiAgKT8uWzFdO1xuICBcbiAgaWYgKCFtYXBwaW5nKSByZXR1cm4gbnVsbDtcbiAgXG4gIC8vIOiOt+WPliBhZ2VudCDphY3nva5cbiAgY29uc3QgYWdlbnRzID0gY29uZmlnPy5hZ2VudHMgfHwge307XG4gIGNvbnN0IGFnZW50Q29uZmlnID0gYWdlbnRzW21hcHBpbmcuYWdlbnRdO1xuICBjb25zdCBjYXRlZ29yaWVzID0gY29uZmlnPy5jYXRlZ29yaWVzIHx8IHt9O1xuICBjb25zdCBjYXRlZ29yeUNvbmZpZyA9IGNhdGVnb3JpZXNbbWFwcGluZy5jYXRlZ29yeV07XG4gIFxuICByZXR1cm4ge1xuICAgIGFnZW50OiBtYXBwaW5nLmFnZW50LFxuICAgIGNhdGVnb3J5OiBtYXBwaW5nLmNhdGVnb3J5LFxuICAgIGRlc2NyaXB0aW9uOiBtYXBwaW5nLmRlc2NyaXB0aW9uLFxuICAgIHByaW1hcnlBZ2VudDogbWFwcGluZy5hZ2VudCxcbiAgICBzdXBwb3J0QWdlbnRzOiBtYXBwaW5nLnN1cHBvcnRBZ2VudHMgfHwgW10sXG4gICAgbW9kZWw6IGNhdGVnb3J5Q29uZmlnPy5tb2RlbCB8fCBhZ2VudENvbmZpZz8ubW9kZWwsXG4gICAgZmFsbGJhY2tNb2RlbHM6IGNhdGVnb3J5Q29uZmlnPy5mYWxsYmFja19tb2RlbHMgfHwgYWdlbnRDb25maWc/LmZhbGxiYWNrX21vZGVscyB8fCBbXSxcbiAgICBpc0J1aWx0SW5UeXBlOiB0cnVlLFxuICAgIHN1YmFnZW50VHlwZTogc3ViYWdlbnRUeXBlXG4gIH07XG59XG5cbi8qKlxuICog6I635Y+W5omA5pyJ5pSv5oyB55qEIE9wZW5Db2RlIOWGhee9ruexu+Wei1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3VwcG9ydGVkU3ViYWdlbnRUeXBlcyhjb25maWdQYXRoKSB7XG4gIGNvbnN0IG1hcHBpbmdzID0gZ2V0U3ViYWdlbnRNYXBwaW5ncyhjb25maWdQYXRoKTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG1hcHBpbmdzKTtcbn1cblxuLyoqXG4gKiDojrflj5bnsbvlnovliLDmrablsIbnmoTlj43lkJHmn6Xmib7ooahcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJldmVyc2VMb29rdXAoY29uZmlnUGF0aCkge1xuICBjb25zdCBtYXBwaW5ncyA9IGdldFN1YmFnZW50TWFwcGluZ3MoY29uZmlnUGF0aCk7XG4gIGNvbnN0IHJldmVyc2UgPSB7fTtcbiAgXG4gIE9iamVjdC5lbnRyaWVzKG1hcHBpbmdzKS5mb3JFYWNoKChbdHlwZSwgbWFwcGluZ10pID0+IHtcbiAgICBpZiAoIXJldmVyc2VbbWFwcGluZy5hZ2VudF0pIHtcbiAgICAgIHJldmVyc2VbbWFwcGluZy5hZ2VudF0gPSBbXTtcbiAgICB9XG4gICAgcmV2ZXJzZVttYXBwaW5nLmFnZW50XS5wdXNoKHR5cGUpO1xuICB9KTtcbiAgXG4gIHJldHVybiByZXZlcnNlO1xufVxuXG4vKipcbiAqIOaJk+WNsOi3r+eUseaYoOWwhOihqO+8iOeUqOS6juiwg+ivle+8iVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRSb3V0aW5nVGFibGUoY29uZmlnUGF0aCkge1xuICBjb25zdCBtYXBwaW5ncyA9IGdldFN1YmFnZW50TWFwcGluZ3MoY29uZmlnUGF0aCk7XG4gIFxuICBjb25zb2xlLmxvZygnXFxu4pWU4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWXJyk7XG4gIGNvbnNvbGUubG9nKCfilZEgICAgIE9wZW5Db2RlIOWGhee9ruexu+WeiyDihpIgVWx0cmFXb3JrIOatpuWwhiDmmKDlsITooaggICAgICAgICAgICDilZEnKTtcbiAgY29uc29sZS5sb2coJ+KVoOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVoycpO1xuICBcbiAgT2JqZWN0LmVudHJpZXMobWFwcGluZ3MpLmZvckVhY2goKFt0eXBlLCBtYXBwaW5nXSkgPT4ge1xuICAgIGNvbnN0IHN1cHBvcnRTdHIgPSBtYXBwaW5nLnN1cHBvcnRBZ2VudHM/Lmxlbmd0aCA+IDAgXG4gICAgICA/IGAgKyAke21hcHBpbmcuc3VwcG9ydEFnZW50cy5qb2luKCcsICcpfWBcbiAgICAgIDogJyc7XG4gICAgY29uc29sZS5sb2coYOKVkSAke3R5cGUucGFkRW5kKDIwKX0g4oaSICR7bWFwcGluZy5hZ2VudC5wYWRFbmQoMTIpfSR7c3VwcG9ydFN0cn1gKTtcbiAgfSk7XG4gIFxuICBjb25zb2xlLmxvZygn4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWdXFxuJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcm91dGVCeVN1YmFnZW50VHlwZSxcbiAgaXNCdWlsdEluU3ViYWdlbnRUeXBlLFxuICBnZXRTdWJhZ2VudE1hcHBpbmdzLFxuICBnZXRTdXBwb3J0ZWRTdWJhZ2VudFR5cGVzLFxuICBnZXRSZXZlcnNlTG9va3VwLFxuICBwcmludFJvdXRpbmdUYWJsZVxufTtcbiJdfQ==
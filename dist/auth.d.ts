/**
 * OpenCode Server Basic Auth 注入模块
 * 参考 oh-my-openagent 实现
 */
/**
 * 构建 HTTP Basic Auth Header
 */
export declare function getServerBasicAuthHeader(): string | undefined;
/**
 * 注入服务器认证到 OpenCode Client
 * 必须在 plugin 初始化时调用
 */
export declare function injectServerAuthIntoClient(client: unknown): boolean;

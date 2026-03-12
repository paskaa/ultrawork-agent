/**
 * OpenCode Server Basic Auth 注入模块
 * 参考 oh-my-openagent 实现
 */

/**
 * 构建 HTTP Basic Auth Header
 */
export function getServerBasicAuthHeader(): string | undefined {
  const password = process.env.OPENCODE_SERVER_PASSWORD
  if (!password) {
    return undefined
  }

  const username = process.env.OPENCODE_SERVER_USERNAME ?? "opencode"
  const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64")

  return `Basic ${token}`
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function getInternalClient(client: unknown): UnknownRecord | null {
  if (!isRecord(client)) {
    return null
  }

  const internal = client["_client"]
  return isRecord(internal) ? internal : null
}

function tryInjectViaSetConfigHeaders(internal: UnknownRecord, auth: string): boolean {
  const setConfig = internal["setConfig"]
  if (typeof setConfig !== "function") {
    return false
  }

  try {
    setConfig({
      headers: {
        Authorization: auth,
      },
    })
    return true
  } catch {
    return false
  }
}

function tryInjectViaInterceptors(internal: UnknownRecord, auth: string): boolean {
  const interceptors = internal["interceptors"]
  if (!isRecord(interceptors)) {
    return false
  }

  const requestInterceptors = interceptors["request"]
  if (!isRecord(requestInterceptors)) {
    return false
  }

  const use = requestInterceptors["use"]
  if (typeof use !== "function") {
    return false
  }

  try {
    use((request: unknown) => {
      if (request instanceof Request) {
        const headers = new Headers(request.headers)
        headers.set("Authorization", auth)
        return new Request(request, { headers })
      }
      return request
    })
    return true
  } catch {
    return false
  }
}

function wrapFetch(baseFetch: typeof fetch, auth: string): typeof fetch {
  return async (input, init): Promise<Response> => {
    const request = new Request(input, init)
    const headers = new Headers(request.headers)
    headers.set("Authorization", auth)
    return baseFetch(new Request(request, { headers }))
  }
}

function tryInjectViaFetchWrapper(internal: UnknownRecord, auth: string): boolean {
  const fetch = internal["fetch"]
  if (typeof fetch !== "function") {
    return false
  }

  try {
    internal["fetch"] = wrapFetch(fetch as typeof globalThis.fetch, auth)
    return true
  } catch {
    return false
  }
}

function tryInjectViaTopLevelFetch(client: unknown, auth: string): boolean {
  if (!isRecord(client)) {
    return false
  }

  const fetch = client["fetch"]
  if (typeof fetch !== "function") {
    return false
  }

  try {
    client["fetch"] = wrapFetch(fetch as typeof globalThis.fetch, auth)
    return true
  } catch {
    return false
  }
}

/**
 * 注入服务器认证到 OpenCode Client
 * 必须在 plugin 初始化时调用
 */
export function injectServerAuthIntoClient(client: unknown): boolean {
  const auth = getServerBasicAuthHeader()
  if (!auth) {
    console.log("[UltraWork-SanGuo] No OPENCODE_SERVER_PASSWORD set, skipping auth injection")
    console.log("[UltraWork-SanGuo] Available env vars:", Object.keys(process.env).filter(k => k.includes("OPENCODE")))
    return false
  }

  console.log("[UltraWork-SanGuo] Injecting Basic Auth into client...")
  console.log("[UltraWork-SanGuo] Client keys:", Object.keys(client || {}))

  try {
    const internal = getInternalClient(client)
    console.log("[UltraWork-SanGuo] Internal client keys:", internal ? Object.keys(internal) : "null")
    
    if (internal) {
      const injectedHeaders = tryInjectViaSetConfigHeaders(internal, auth)
      console.log("[UltraWork-SanGuo] Injected via setConfig:", injectedHeaders)
      
      const injectedInterceptors = tryInjectViaInterceptors(internal, auth)
      console.log("[UltraWork-SanGuo] Injected via interceptors:", injectedInterceptors)
      
      const injectedFetch = tryInjectViaFetchWrapper(internal, auth)
      console.log("[UltraWork-SanGuo] Injected via fetch wrapper:", injectedFetch)

      const injected = injectedHeaders || injectedInterceptors || injectedFetch

      if (injected) {
        console.log("[UltraWork-SanGuo] Auth injected successfully via internal client")
        return true
      }
    }

    const injected = tryInjectViaTopLevelFetch(client, auth)
    console.log("[UltraWork-SanGuo] Injected via top-level fetch:", injected)
    
    if (injected) {
      console.log("[UltraWork-SanGuo] Auth injected successfully via top-level fetch")
      return true
    }

    console.log("[UltraWork-SanGuo] Failed to inject auth: no compatible injection method found")
    return false
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`[UltraWork-SanGuo] Failed to inject auth: ${message}`)
    return false
  }
}

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    choices: {
        message: Message;
    }[];
}

const CONNECTION_TIMEOUT_MS = 10000;

const normalizeBaseUrl = (url: string): string => {
    const u = url.trim();
    return u.endsWith('/') ? u.slice(0, -1) : u;
};

const buildV1Path = (base: string, path: string): string => {
    const b = normalizeBaseUrl(base);
    return b.endsWith('/v1') ? `${b}/${path}` : `${b}/v1/${path}`;
};

/** Jan 403 "Invalid host header" önlemek için: sunucu sadece localhost Host kabul ediyor */
const getLocalhostHostHeader = (baseUrl: string): string => {
    try {
        const withoutProtocol = baseUrl.replace(/^https?:\/\//, '').trim();
        const hostAndPort = withoutProtocol.split('/')[0];
        const port = hostAndPort.includes(':') ? hostAndPort.split(':')[1] : '1337';
        return `127.0.0.1:${port}`;
    } catch {
        return '127.0.0.1:1337';
    }
};

const isLocalhost = (url: string): boolean => {
    try {
        const host = url.replace(/^https?:\/\//, '').split('/')[0].split(':')[0].toLowerCase();
        return host === '127.0.0.1' || host === 'localhost' || host === '::1';
    } catch {
        return false;
    }
};

export const testConnection = async (baseUrl: string, apiKey?: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = baseUrl?.trim() ?? '';
    if (!trimmed) {
        return { success: false, message: 'Base URL is required' };
    }
    if (isLocalhost(trimmed)) {
        return {
            success: false,
            message: "127.0.0.1 / localhost bu cihazı (telefonu) işaret eder. Jan PC'de çalışıyor. Base URL'de PC IP + /v1 kullanın (örn. http://192.168.1.56:1337/v1)",
        };
    }
    const url = buildV1Path(trimmed, 'models');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Host': getLocalhostHostHeader(trimmed),
        };
        if (apiKey?.trim()) {
            headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return { success: true, message: `Connected! Found ${data.data?.length || 0} models.` };
        } else {
            const errorText = await response.text();
            let msg = `Error ${response.status}: ${errorText || 'Server returned an error'}`;
            if (response.status === 403 && /invalid host/i.test(errorText)) {
                msg = '403 Invalid host: Uygulama Host başlığını 127.0.0.1 olarak gönderiyor; hâlâ bu hatayı alıyorsanız Jan sürümünüzü güncelleyin veya ağ erişimine izin verin.';
            }
            return { success: false, message: msg };
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, message: 'Connection timed out. Check Base URL and Wi-Fi.' };
        }
        if (error.message?.includes('Network request failed')) {
            return { success: false, message: 'Jan server not reachable. Check Wi-Fi and Base URL (e.g. http://192.168.1.x:1337).' };
        }
        return { success: false, message: `Connection failed: ${error.message}` };
    }
};

export const sendChatRequest = async (
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: Message[],
    temperature: number,
    maxTokens: number
): Promise<string> => {
    const url = buildV1Path(baseUrl, 'chat/completions');

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Host': getLocalhostHostHeader(baseUrl),
        };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const body = {
            model,
            tool_choice: 'none',
            temperature,
            max_tokens: maxTokens,
            messages: [
                { role: 'system', content: 'Reply in plain text only. Always respond in the same language as the user (e.g. if the user writes in Turkish, reply in Turkish). Do not call tools or functions.' },
                ...messages,
            ],
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data: ChatResponse = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (content !== undefined && content !== null) {
                return content;
            }
            return JSON.stringify(data, null, 2);
        } else {
            const errorText = await response.text();
            let friendlyMessage = `Error ${response.status}: ${errorText}`;

            if (response.status === 400 && errorText.includes('context')) {
                friendlyMessage = 'Context limit reached. Shorten your message or clear chat history.';
            } else if (response.status === 404) {
                friendlyMessage = 'Endpoint not found or invalid model. Check your settings.';
            } else if (response.status === 403 && errorText.includes('invalid host')) {
                friendlyMessage = '403 Invalid host: Jan sadece localhost kabul ediyor olabilir. Ayarlardan Test Connection tekrar deneyin.';
            }

            throw new Error(friendlyMessage);
        }
    } catch (error: any) {
        if (error.message?.includes('Network request failed')) {
            throw new Error('Jan server not reachable. Check Wi-Fi and Base URL.');
        }
        throw error;
    }
};

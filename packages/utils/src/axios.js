import axios from "axios"
import { customRef } from 'vue'
import { message } from 'ant-design-vue'

// 服务配置
const API_CONFIG = {
    TIMEOUT: 60000,
    BASE_URL: import.meta.env.VITE_APP_BASE_URL,
    CONTENT_TYPE: "application/json",
    ERROR_MESSAGE: "请求失败，请稍后重试",
    TOKEN_KEY_PATTERNS: ["/service/baseInit"],
};

// 错误码
const messages = {
    400: "请求参数错误",
    401: "身份验证失败",
    403: "无权访问该资源",
    404: "请求资源不存在",
    405: "请求方法不被允许",
    408: "请求超时",
    500: "服务器内部错误",
    502: "网关错误",
    503: "服务不可用",
    504: "网关超时",
};

// 全局状态管理器 - 处理Loading状态
export const useLoading = customRef((track, trigger) => {
    let loadingCount = 0;
    return {
        get() {
            track()
            return loadingCount > 0;
        },
        set(value) {
            if (value) {
                loadingCount = loadingCount + 1;
            } else {
                loadingCount = loadingCount - 1;
            }
            loadingCount = Math.max(0, loadingCount);
            trigger();
        }
    }
});

// Token管理服务
class TokenService {
    static getToken() {
        // 只负责获取，不做副作用
        return sessionStorage.getItem("newToken") || import.meta.env.VITE_TEST_TOKEN || '';
    }

    static setToken(token) {
        sessionStorage.setItem("newToken", token);
    }
}

// 创建Axios实例工厂
const createAxiosInstance = (config = {}) => {
    const instance = axios.create({
        timeout: config.timeout || API_CONFIG.TIMEOUT,
        baseURL: config.baseURL || API_CONFIG.BASE_URL,
        headers: {
            "Content-Type": config.contentType || API_CONFIG.CONTENT_TYPE,
        },
    });

    // 请求拦截器
    instance.interceptors.request.use(
        (config) => {
            const { showLoading = true } = config;

            // 显示Loading
            if (showLoading) {
                useLoading.value = true;
            }

            // 统一添加认证Token
            config.headers.Authorization = TokenService.getToken();

            return config;
        },
        (error) => {
            useLoading.value = false;
            return Promise.reject(error);
        }
    );

    // 响应拦截器
    instance.interceptors.response.use(
        (response) => {
            useLoading.value = false;
            return response;
        },
        (error) => {
            useLoading.value = false;
            return Promise.reject(error);
        }
    );

    return instance;
};

// 主API实例
const mainApi = createAxiosInstance();

/**
 * 核心请求方法
 * @param {*} method 请求方式 get，post，put等
 * @param {*} url 接口地址
 * @param {*} options 请求配置
 * @returns
 */
const request = async (method, url, options) => {
    // 分离自定义参数和 axios 参数
    const {
        data = {}, // body
        params = {}, // params
        headers = {},
        silent = true, // 静默模式，控制message提示， true 不提示，  false提示
        showLoading = true, // 显示loading
        showError = true, // 显示错误信息
        responseType = "json",
        ...axiosOptions // 其余传递给 axios 的参数
    } = options;
    const _options = {
        method,
        url,
        data,
        params,
        headers,
        responseType,
        showLoading,
        // silent/showError 不传递给 axios
        ...axiosOptions
    }
    try {
        const response = await mainApi(_options);
        // 处理成功响应
        return handleSuccessResponse(response, { silent });
    } catch (error) {
        // 处理错误响应
        return handleErrorResponse(error, { showError, silent });
    }
};

// 成功响应处理
const handleSuccessResponse = (response, options) => {
    const { status, data } = response;
    if (status === 200) {
        // 静默模式不显示成功消息
        if (!options.silent && data?.msg) {
            message.success(data.msg);
        }
    }
    return data;
};

// 错误响应处理
const handleErrorResponse = (error, options) => {
    const { showError = true, silent = false } = options;

    let errorMessage = API_CONFIG.ERROR_MESSAGE;
    let status = null;

    // 提取错误信息
    if (error.response) {
        status = error.response.status;
        if (error.response.data?.msg) {
            errorMessage = error.response.data.msg;
        } else {
            errorMessage = messages[status] || API_CONFIG.ERROR_MESSAGE;
        }
    } else if (error.request) {
        errorMessage = "网络连接失败，请检查网络设置";
    } else {
        errorMessage = error.message || "请求处理发生错误";
    }

    // 记录完整错误信息
    console.error(`请求失败: ${errorMessage}`, {
        url: error.config?.url,
        status,
        error,
    });

    // 显示错误提示
    if (showError && !silent) {
        message.error(errorMessage);
    }

    const customError = new Error(errorMessage);
    customError.status = status;
    customError.originalError = error;

    return Promise.reject(customError);
};

// 公开的API方法
/**
 * GET 请求
 */
export const get = (url, params = {}, options = {}) =>
    request("get", url, { ...options, params });

/**
 * POST 请求
 */
export const post = (url, data = {}, options = {}) =>
    request("post", url, { ...options, data });

/**
 * PUT 请求
 */
export const put = (url, data = {}, options = {}) =>
    request("put", url, { ...options, data });

/**
 * DELETE 请求
 */
export const del = (url, params = {}, options = {}) =>
    request("delete", url, { ...options, params });

/**
 * PATCH 请求
 */
export const patch = (url, data = {}, options = {}) =>
    request("patch", url, { ...options, data });

/**
 * 高级文件下载功能
 * @param {object} options
 * @returns
 */
export const downloadFile = async (options = {}) => {
    const {
        url,
        fileName = "导出文件",
        ext = "xlsx",
        params = {},
        data = {},
        method = "post",
        responseType = "blob",
        mime = "application/vnd.ms-excel",
    } = options;

    try {
        const response = await request(method, url, {
            ...options,
            data,
            params,
            responseType,
        });

        // 响应类型验证
        // axios 返回 { data: Blob, ... }
        const blobData = response instanceof Blob ? response : response?.data;
        if (!(blobData instanceof Blob)) {
            throw new Error("下载响应不是有效的Blob数据");
        }

        // 处理文件名
        const finalFilename = `${fileName}.${ext}`;

        // 创建下载链接
        const blob = new Blob([blobData], { type: mime });
        downloadBlob(blob, finalFilename);

    } catch (error) {
        console.error("文件下载失败:", error);
        message.error("文件下载失败，请稍后重试");
        throw error;
    }
};

// 辅助函数：执行下载
const downloadBlob = (blob, filename) => {
    // IE 兼容处理
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();

        // 清理资源
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }
};

// 导出主实例
export const api = mainApi;

// 导出服务控制器
export const apiService = {
    setBaseUrl: (newUrl) => {
        mainApi.defaults.baseURL = newUrl;
    },

    setToken: (token) => {
        TokenService.setToken(token);
        // 只需设置 Token，拦截器会自动带上
    },

    reset: () => {
        useLoading.value = false;
    },

    getLoadingStatus: () => Boolean(useLoading.value),
};

export async function textpost(url, data) {
    useLoading.value = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🧪 模拟 POST 请求:', url, data)
        resolve({ code: 200, message: 'ok', data: { success: true } })
        useLoading.value = false;
      }, 1000)
    })
  }

// 导出默认实例
export default {
    textpost,
    get,
    post,
    put,
    delete: del,
    patch,
    downloadFile,
    api,
    ...apiService,
};



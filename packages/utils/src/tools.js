/**
 * @description 设置sessionStorage
 * @param {存储的keyName} name
 * @param {存储的value} value
 */
export const setStore = (name, value) => {
    if (!name) return;
    if (typeof value !== 'string') {
        value = JSON.stringify(value)
    }
    window.sessionStorage.setItem(name, value)
}

/**
* @description 读取localstorage
* @param {存储的keyName} name
*/
export const getStore = (name) => {
    if (!name) return;
    return window.sessionStorage.getItem(name)
}
import { createVNode, render } from 'vue'
import { Spin } from 'ant-design-vue'

export const vLoading = {
    mounted(el, binding) {
        // 创建虚拟 DOM
        const spinner = createVNode(Spin, {
            spinning: true,
            tip: '加载中...',
        })

        // 创建容器并渲染
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100%'
        container.style.height = '100%'
        container.style.display = 'flex'
        container.style.justifyContent = 'center'
        container.style.alignItems = 'center'
        container.style.background = 'rgba(255,255,255,0.6)'
        container.style.zIndex = '99'

        render(spinner, container)

        // 挂载
        el._spinnerContainer = container
        el.style.position = 'relative'

        if (binding.value) {
            el.appendChild(container)
        }
    },
    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            if (binding.value) {
                !el.contains(el._spinnerContainer) && el.appendChild(el._spinnerContainer)
            } else {
                el._spinnerContainer && el.removeChild(el._spinnerContainer)
            }
        }
    },
    unmounted(el) {
        if (el._spinnerContainer) {
            el.removeChild(el._spinnerContainer)
            el._spinnerContainer = null
        }
    }
}

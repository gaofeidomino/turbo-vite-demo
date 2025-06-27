import Antd from 'ant-design-vue'
import * as Icons from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'
import './index.css'

import WeCard from './components/WeCard.vue';

export default {
    install(app) {
        app.use(Antd);

        app.component('WeCard', WeCard);

        // 注册图标组件
        Object.entries(Icons).forEach(([key, component]) => {
            app.component(key, component)
        })
    }
}

export { WeCard }
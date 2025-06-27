<script setup>
import { ref } from 'vue'
import { textpost } from '@gf/utils'

defineProps({
    msg: String,
})

const count = ref(0)

async function handleTestPost() {
    await textpost('/api/test', { name: 'gf', age: 23 })
    await textpost('/api/test', { name: 'gf', age: 23 })
    await textpost('/api/test', { name: 'gf', age: 23 })
    await textpost('/api/test', { name: 'gf', age: 23 })
    await textpost('/api/test', { name: 'gf', age: 23 })
}
</script>

<template>
    <div>
        <h1>{{ msg }}</h1>
        <ASpace>
            <AButton @click="count++" type="primary">count is {{ count }}</AButton>
            <AButton @click="handleTestPost" type="primary">模拟请求</AButton>
        </ASpace>
        <div class="flex justify-center gap-6 mt-[32px]">
            <a href="">
                <img src="/vite.svg" class="h-[120px] p-[20px] will-change-[filter] hover:drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
            </a>
            <a href="">
                <img src="../assets/vue.svg" class="h-[120px] p-[20px] will-change-[filter]  hover:drop-shadow-[0_0_2em_#42b883aa]" alt="Vue logo" />
            </a>
        </div>

        <!-- @gf/ui 公用组件 -->
        <WeCard class="mx-auto my-8"></WeCard>

        <!-- antd ui 库组件 -->
        <AAvatarGroup>
            <AAvatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1" />
            <a href="https://www.antdv.com">
                <AAvatar style="background-color: #f56a00">K</AAvatar>
            </a>
            <ATooltip title="Ant User" placement="top">
                <AAvatar style="background-color: #87d068">
                    <template #icon>
                        <UserOutlined />
                    </template>
                </AAvatar>
            </ATooltip>
            <AAvatar style="background-color: #1890ff">
                <template #icon>
                    <AntDesignOutlined />
                </template>
            </AAvatar>
        </AAvatarGroup>
    </div>
</template>

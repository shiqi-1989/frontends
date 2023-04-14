import {createApp, nextTick, reactive} from 'vue'
import Loading from '../components/Loadding2.vue'

const msg = reactive({
    show: false,
    text: '拼命加载中...'
})

const $load = createApp(Loading, {msg}).mount(document.createElement('div'))
// console.log($loading);
const myLoading = {
    show(text) { // 控制显示loading的方法
        msg.show = true
        if (text) {
            msg.text = text
        }
        document.body.appendChild($load.$el);
        //     const el = document.getElementsByClassName("el-main")
        //     console.log(`${el[0]}`)
        //     el[0].appendChild($load.$el);
    },

    hide() { // 控制loading隐藏的方法
        msg.show = false
    }
}
export {myLoading}
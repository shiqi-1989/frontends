import {createApp} from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from "./router";
import store from "./store";
import 'element-plus/dist/index.css'
import '../style/index.less'
import {HTMLFormat, JsonFormat, methodColor, selections} from './util/utils'
// 注册图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const app = createApp(App)
app.use(router)
app.use(store)
app.use(ElementPlus, {locale: zhCn});
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.config.globalProperties.$methodColor = methodColor
app.config.globalProperties.$selections = selections
app.config.globalProperties.$HTMLFormat = HTMLFormat
app.config.globalProperties.$jsonFormat = JsonFormat

app.mount('#app')

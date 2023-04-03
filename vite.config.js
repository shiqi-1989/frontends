import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'
// https://vitejs.dev/config/
import os from 'os'

/**
 * 获取当前机器的ip地址
 */
function getIpAddress() {
    let ifaces = os.networkInterfaces()
    for (let dev in ifaces) {
        let iface = ifaces[dev]
        for (let i = 0; i < iface.length; i++) {
            let {family, address, internal} = iface[i]
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                // console.log(address)
                return address
            }
        }
    }
}

export default defineConfig({
    server: {
        // open: true, //自动打开
        base: "./", //生产环境路径
        // hmr: {
        //     clientPort: 80,
        // },
        // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
        proxy: {
            // 正则表达式写法
            '^/interface': {
                target: `http://${getIpAddress()}:8888/interface`, // 后端服务实际地址
                changeOrigin: true, //开启代理
                rewrite: (path) => path.replace(/^\/interface/, '')
            }
        }
    },
    plugins: [vue(),
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: '__tla',
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: i => `__tla_${i}`
        })
    ],


// sourcemap: true, //打包后定位报错
})
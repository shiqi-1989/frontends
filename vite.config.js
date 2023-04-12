import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'
// https://vitejs.dev/config/
import os from 'os'

/**
 * 获取当前机器的ip地址
 */
function getIPAddress() {
    const ifaces = os.networkInterfaces();
    let ipAddress = '';
    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                ipAddress = `${ifname}:${alias} ${iface.address}`;
            } else {
                // this interface has only one ipv4 adress
                ipAddress = iface.address;
            }
            ++alias;
        });
    });
    console.log(ipAddress);
    return ipAddress;
}

export default defineConfig({
    server: {
        base: "./", //生产环境路径
        // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
        proxy: {
            // 正则表达式写法
            '^/interface': {
                target: `http://${getIPAddress()}:8888/interface`, // 后端服务实际地址
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
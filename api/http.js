import axios from "axios";
import {Base64} from "js-base64";
import {ElLoading, ElMessage} from "element-plus";
import router from "../src/router";
import pageLoading from '../src/assets/css/pageLoading.css'
import {myLoading} from "../src/util/loadding.js"

let loading

const showLoading = () => {
    loading = ElLoading.service({
        lock: true,
        text: '客官别急！。。。',
        background: 'rgba(0, 0, 0, 0.7)',
        fullscreen: true,
        spinner: 'pageLoading',
    })
}
const hideLoading = () => {
    loading.close()
    /*setTimeout(() => {
        loading.close()
    }, 500);*/
}
/**
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
const toLogin = () => {
    router.replace({
        path: '/login', query: {
            redirect: router.currentRoute.value.fullPath
        }
    }).then();
}
/**
 * 请求失败后的错误统一处理
 * @param {$ObjMap} response 请求失败的状态码
 */
const errorHandle = (response) => {
    console.log(response)
    // 状态码判断
    switch (response.status) {
            // 0: 网络出错误
        case 0:
            ElMessage.error("Network Error");
            break;
        case 400:
            ElMessage.error(response.data?.msg);
            break;
        case 401:
            // 401: 未登录状态，token过期，token异常 跳转登陆页
            ElMessage.error(response.data?.msg);
            toLogin();
            break;
        case 403:
            // 403 服务器认可token 但是token没有足够权限执行该操作
            ElMessage.error(response.data?.msg);
            break;
        case 404:
            // 404请求不存在
            ElMessage.error('请求的资源不存在');
            break;
        default:
            // if (response.data !== "") {
            //     ElMessage.error(response.data.msg)
            //     break
            // }
            ElMessage.error(`${response.statusText} with status code ${response.status}`);
            break;
    }
}

//创建通用axios配置

let instance = axios.create({
    baseURL: "/interface",
    timeout: 30 * 1000,  // 超时时间设置10秒
    responseType: "json",
    withCredentials: false,
})


// token加密
function baseFun()  {
    const token = localStorage.getItem('token')
    const base64 = Base64.encode(token + ':')
    return "Basic " + base64
}

//http 请求拦截器 ： 在axios 请求发出之前给每一个接口携带token 去后端校验身份
instance.interceptors.request.use(function (config) {
    // showLoading();
    myLoading.show("客官: 静心、静心 ...");
    config.headers = {
        'Content-Type': 'application/json', // 配置请求头
    }
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));// 本地缓存取出token
    if (userInfo) {
        // config.headers.Authorization = baseFun();//token base64加密
        config.headers.Authorization = "Bearer " + userInfo.token;//headers添加token
    }
    return config
}, function (error) {
    // hideLoading()
    return Promise.reject(error)
})

//http 响应拦截器
instance.interceptors.response.use(function (res) {
    // hideLoading();
    myLoading.hide();

    return Promise.resolve(res)
}, error => {
    // hideLoading();
    myLoading.hide();

    const {response} = error
    errorHandle(response)
    return Promise.reject(error)// 返回接口错误信息
})

export default instance
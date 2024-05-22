<template>
    <video v-if="background_plate.suffix === 'mp4'" autoplay loop muted playsinline
           preload webkit-playsinline>
        <source :src="background_plate.file" type="video/mp4">
    </video>
    <div v-else id="background"
         :style="{ backgroundImage: `url(${background_plate.file})` }">
    </div>
    <!--    <svg xmlns="http://www.w3.org/2000/svg" style="position: fixed;width: 100%;height: 100%;">-->
    <!--        <g transform="-->
    <!--          rotate(30 960 540)-->
    <!--          translate(-724.7177209663946 -407.6537180435969)-->
    <!--          scale(1.7549142926733277)-->
    <!--        ">-->
    <!--            <rect width="100%" height="100%" fill="rgb(255, 143, 143)"></rect>-->
    <!--            <g transform="translate(0, 0)">-->
    <!--                <path fill="rgb(59, 82, 223)" fill-opacity="1"-->
    <!--                      d="M0,4.082L45.714,39.572C91.429,75.061,182.857,146.041,274.286,198.495C365.714,250.95,457.143,284.879,548.571,291.674C640,298.468,731.429,278.128,822.857,272.554C914.286,266.981,1005.714,276.174,1097.143,255.71C1188.571,235.246,1280,185.125,1371.429,137.943C1462.857,90.762,1554.286,46.519,1645.714,28.908C1737.143,11.297,1828.571,20.317,1874.286,24.827L1920,29.338L1920,1080L1874.286,1080C1828.571,1080,1737.143,1080,1645.714,1080C1554.286,1080,1462.857,1080,1371.429,1080C1280,1080,1188.571,1080,1097.143,1080C1005.714,1080,914.286,1080,822.857,1080C731.429,1080,640,1080,548.571,1080C457.143,1080,365.714,1080,274.286,1080C182.857,1080,91.429,1080,45.714,1080L0,1080Z"></path>-->
    <!--            </g>-->
    <!--            <g transform="translate(0, 360)">-->
    <!--                <path fill="rgb(89, 179, 195)" fill-opacity="1"-->
    <!--                      d="M0,203.278L45.714,204.689C91.429,206.101,182.857,208.924,274.286,221.879C365.714,234.835,457.143,257.921,548.571,232.468C640,207.015,731.429,133.022,822.857,122.205C914.286,111.388,1005.714,163.747,1097.143,193.316C1188.571,222.885,1280,229.664,1371.429,244.808C1462.857,259.952,1554.286,283.461,1645.714,263.272C1737.143,243.083,1828.571,179.197,1874.286,147.253L1920,115.31L1920,720L1874.286,720C1828.571,720,1737.143,720,1645.714,720C1554.286,720,1462.857,720,1371.429,720C1280,720,1188.571,720,1097.143,720C1005.714,720,914.286,720,822.857,720C731.429,720,640,720,548.571,720C457.143,720,365.714,720,274.286,720C182.857,720,91.429,720,45.714,720L0,720Z"></path>-->
    <!--            </g>-->
    <!--            <g transform="translate(0, 720)">-->
    <!--                <path fill="rgb(140, 28, 176)" fill-opacity="1"-->
    <!--                      d="M0,55.755L45.714,51.33C91.429,46.905,182.857,38.056,274.286,60.504C365.714,82.952,457.143,136.698,548.571,145.717C640,154.736,731.429,119.029,822.857,115.504C914.286,111.979,1005.714,140.636,1097.143,147.307C1188.571,153.978,1280,138.663,1371.429,118.106C1462.857,97.548,1554.286,71.748,1645.714,99.318C1737.143,126.888,1828.571,207.828,1874.286,248.298L1920,288.768L1920,360L1874.286,360C1828.571,360,1737.143,360,1645.714,360C1554.286,360,1462.857,360,1371.429,360C1280,360,1188.571,360,1097.143,360C1005.714,360,914.286,360,822.857,360C731.429,360,640,360,548.571,360C457.143,360,365.714,360,274.286,360C182.857,360,91.429,360,45.714,360L0,360Z"></path>-->
    <!--            </g>-->
    <!--        </g>-->
    <!--    </svg>-->
    <div class="login-content">
        <div class="login-title">接口管理平台</div>
        <div class="login-user">
            <div class="text-background">
                <h2 class="text" v-if="reg==='注册'">Login</h2>
                <h2 class="text" v-else>Register</h2>
            </div>

            <el-form
                    ref="ruleFormRef"
                    :model="user"
                    :rules="rules"
                    class="input-css"
            >
                <el-form-item label="" prop="mobile">
                    <el-input v-model="user.mobile" clearable maxlength="11"
                              @input="value => user.mobile = value.replace(/\D/g,'')"
                              placeholder="请输入手机号" spellcheck="false"
                              type="tel">
                        <template #prefix>
                            <el-icon :size="size" class="el-input__icon">
                                <!--                                <PhoneFilled/>-->
                                <Phone/>
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" prop="password">
                    <el-input v-model="user.password" placeholder="请输入密码" show-password
                              type="password">
                        <template #prefix>
                            <el-icon :size="size" class="el-input__icon">
                                <Lock/>
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item v-if="reg==='登录'" prop="username">
                    <el-input v-model="user.username" clearable placeholder="请输入用户名" spellcheck="false">
                        <template #prefix>
                            <el-icon :size="size" class="el-input__icon">
                                <!--                                <Avatar/>-->
                                <User/>
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item v-if="reg==='登录'" prop="gender">
                    <el-select v-model="user.gender" placeholder="请选择您的性别">
                        <el-option
                                v-for="item in gender_options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                        >
                        </el-option>
                        <template #prefix>
                            <el-icon :size="size" class="el-input__icon">
                                <Guide/>
                            </el-icon>
                        </template>
                    </el-select>
                </el-form-item>
                <!--登录按钮-->
                <el-form-item>
                    <button v-if="reg==='注册'"
                            @click.prevent="submitForm(ruleFormRef, 1)">登&nbsp;&nbsp;录
                    </button>
                    <button v-else @click.prevent="submitForm(ruleFormRef, 2)">注&nbsp;&nbsp;册
                    </button>
                </el-form-item>
                <el-form-item>
                    <p class="login_miss miss-l" @click="reg = reg==='登录'? '注册':'登录'">{{ reg }}</p>
                    <p class="login_miss miss-r">忘记密码</p>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script setup>
import {computed, reactive, ref} from 'vue'
import {useRouter} from "vue-router";
import FormInstance, {ElMessage} from "element-plus";
import apis from '../../../api/api'

const ruleFormRef = ref(FormInstance)
const router = useRouter()
let reg = ref("注册")
const user = reactive({
    mobile: "",
    username: "",
    password: "",
    gender: ""
})
const gender_options = [{
    value: 'Male',
    label: '男',
},
    {
        value: 'Female',
        label: '女',
    }]
// 获取 login文件夹内的静态背景文件
const bc_url = import.meta.globEager('/public/login/**/*');

// 计算属性 每次打开页面显示不同的背景
const background_plate = computed(() => {
    // 随机一个整数  如：Math.random()*4是随机0到4的整数
    let num = Math.round(Math.random() * (Object.keys(bc_url).length - 1));
    // 把随机的图片重新放到backgroundImage
    let _file = Object.keys(bc_url)[num];
    const suffix = _file.split('.')[1];
    return {
        suffix: suffix,
        file: bc_url[_file].default,
    }
})
const rules = reactive({
    mobile: [
        {required: true, message: "手机号不能为空", trigger: 'blur'},
        {pattern: /^1(3|4|5|7|8)\d{9}$/, message: "账号必须11有效手机号", trigger: "blur"}
    ],
    username: [{required: true, message: "用户名不能为空", trigger: 'blur'},],
    password: [{required: true, message: "密码不能为空", trigger: 'blur'},],
    gender: [{required: true, message: "请选择您的性别", trigger: 'blur'},],
})
const size = ref(18)
//清除所有
// localStorage.clear()
//清除指定
// localStorage.removeItem('token');
// 登录
const redirect = () => {
    let redirect = router.currentRoute.value.query.redirect
    if (redirect) {
        return redirect
    } else {
        137166100
        return redirect = '/'
    }
}
const login = () => {
    // await new proxy["$request"](proxy["$urls"].m().login, obj).post()
    const obj = {
        mobile: user.mobile,
        password: user.password,
    }
    apis.login(obj)
            .then(({data}) => {
                if (data.code === 200) {
                    localStorage.setItem("userInfo", JSON.stringify(data.data))
                    router.push(`${redirect()}`)
                } else {
                    ElMessage.error(data.detail)
                }
            })
}
//注册
const register = async () => {
    apis.register(user)
            .then(({data}) => {
                if (data.code === 200) {
                    console.log(data.data)
                    localStorage.setItem("userInfo", JSON.stringify(data.data))
                    router.push({
                        path: redirect()
                    })
                } else {
                    ElMessage.error(data.detail)
                }
            })
}
const submitForm = (formEl, e) => {
    localStorage.clear();
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
            if (e === 1) {
                login()
            } else {
                register()
            }
        } else {
            console.log(user)
            console.log('error submit!')
            return false
        }
    })
}
</script>
<style lang="less" scoped>
//.el-input {
//    height: 48px;
//}

:deep(.el-input) {
    height: 48px;

}

.el-select {
    width: 100%;

    :deep(.el-input__icon) {
        margin-left: 0;
    }
}

button {
    width: 100%;
    height: 48px;
    line-height: 46px;
    font-weight: bold;
    font-size: 20px;
}
</style>
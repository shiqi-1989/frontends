<template>
    <video v-if="background_plate.suffix === 'mp4'" autoplay loop muted playsinline
           preload webkit-playsinline>
        <source :src="background_plate.file" type="video/mp4">
    </video>
    <div v-else id="background"
         :style="{ backgroundImage: `url(${background_plate.file})` }">
    </div>
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
// const bc_url = reactive([
//     "人和鱼.mp4",
//     "窗和鱼.mp4",
//     "鲸鱼.jpeg",
//     "漫画.jpeg",
//     "沙漠.jpeg",
//     "时钟.jpeg",
//     "太空.jpeg",
// ])
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
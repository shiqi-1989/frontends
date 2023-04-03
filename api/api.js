import instance from "./http";

// 放置所所有的请求接口地址
// const baseUrl = `http://${sessionStorage.getItem('host')}:8888/interface`
const apis = {
    // 登录
    login(params) {
        return instance.post(`/login`, params)
    },
    // 注册
    register(params) {
        return instance.post(`/register`, params)
    },
    // 项目模块api
    // 项目列表
    projectList(params) {
        return instance.get(`/project`, {
            params: params
        })
    },
    // 项目详情
    projectDetail(id) {
        return instance.get(`/project/${id}`)
    },
    // 添加项目
    addProject(params) {
        return instance.post(`/project`, params)
    },
    // 编辑项目
    editProject(id, params) {
        return instance.patch(`/project/${id}`, params)
    },
    // 删除项目
    delProject(id) {
        if (typeof id === 'object') {
            return instance.delete(`/project/batch_delete?ids=${id}`)
        }
        return instance.delete(`/project/${id}`)
    },
    // 接口列表
    apiList(params) {
        return instance.get(`/api`, {
            params: params
        })
    },
    // 临时接口列表
    tempApiList(params) {
        return instance.get(`/api/get_temp_api`, {
            params: params
        })
    },
    // 接口详情
    apiDetail(id) {
        return instance.get(`/api/${id}`)
    },
    // 添加接口
    addApi(params) {
        return instance.post(`/api`, params)
    },
    // 复制接口
    copyApi(params) {
        return instance.post(`/api/api_copy`, params)
    },
    // 编辑接口
    editApi(id, params) {
        return instance.patch(`/api/${id}`, params)
    },
    // 删除接口
    delApi(id) {
        if (typeof id === 'object') {
            return instance.delete(`/api/batch_delete?ids=${id}`)
        }
        return instance.delete(`/api/${id}`)
    },
    // 批量运行api 异步
    apisSend(params) {
        return instance.post(`/api/apis_send`, params)
    },
    // 单接口调试
    apiSend(params) {
        return instance.post(`/api/api_send`, params)
    },
    // 获取 报告
    getReport(id) {
        return instance.get(`/reportDetail/${id}`)
    },
    // 配置列表
    configList(params) {
        return instance.get(`/config`, {
            params: params
        })
    },
    // 公共配置 调试页面用
    pubConfig(params) {
        return instance.get(`/config/public_config`, {params: params})
    },
    // 配置详情
    configDetail(id) {
        return instance.get(`/config/${id}`)
    },
    // 添加配置
    addConfig(params) {
        return instance.post(`/config`, params)
    },
    // 编辑配置
    editConfig(id, params) {
        return instance.patch(`/config/${id}`, params)
    },
    // 删除配置
    delConfig(id) {
        if (typeof id === 'object') {
            return instance.delete(`/config/batch_delete?ids=${id}`)
        }
        return instance.delete(`/config/${id}`)
    },
    // case列表
    caseList(params) {
        return instance.get(`/case`, {
            params: params
        })
    },
    // 添加case
    addCase(params) {
        return instance.post(`/case`, params)
    },
    // 删除case
    delCase(id) {
        if (typeof id === 'object') {
            return instance.delete(`/case/batch_delete?ids=${id}`)
        }
        return instance.delete(`/case/${id}`)
    },
    // 编辑case
    editCase(id, params) {
        return instance.patch(`/case/${id}`, params)
    },
    // case详情
    caseDetail(id) {
        return instance.get(`/case/${id}`)
    },
    // step列表
    stepList(id) {
        return instance.get(`/case/steps?id=${id}`)
    },
    // 批量运行case
    runCase(params) {
        return instance.post(`/case/run_case`, params)
    },
    // report列表
    reportList(params) {
        return instance.get(`/report`, {
            params: params
        })
    },
    // 删除case
    delReport(id) {
        if (typeof id === 'object') {
            return instance.delete(`/report/batch_delete?ids=${id}`)
        }
        return instance.delete(`/report/${id}`)
    },
    // Crontab列表  定时任务列表
    crontabList(params) {
        return instance.get(`/crontab`, {
            params: params
        })
    },
    // 添加定时任务
    addCrontab(params) {
        return instance.post(`/crontab`, params)
    },
    // 编辑定时任务
    editCrontab(id, params) {
        return instance.patch(`/crontab/${id}`, params)
    },
    // 删除定时任务
    delCrontab(id) {
        if (typeof id === 'object') {
            return instance.delete(`/crontab/batch_delete?ids=${id}`)
        }
        return instance.delete(`/crontab/${id}`)
    },
    // 暂停/继续定时任务
    switchCrontab(params) {
        return instance.post(`/crontab/switch_job`, params)
    },
    // 上传文件
    uploadFile() {
        return `/upload_file`
    },
    // 删除文件
    delFile(id) {
        return instance.delete(`/upload_file/${id}`)
    },
    // 标签列表
    tagList(params) {
        return instance.get(`/tag`, {
            params: params
        })
    },
    // 添加tag
    addTag(params) {
        return instance.post(`/tag`, params)
    },
    // 删除case
    delTag(id) {
        return instance.delete(`/tag/${id}`)
    },
    // 编辑case
    editTag(id, params) {
        return instance.patch(`/tag/${id}`, params)
    },
    // 修改密码
    changePassword(params) {
        return instance.post(`/change_password/`, params)
    },
    // 获取安卓手机列表
    getAndroidDevices(params) {
        return instance.get(`/tag/getAndroidDevices`, {
            params: params
        })
    },
    // 获取xmind转csv web地址
    xmind2case(params) {
        return instance.get(`/xmind2case`, {
            params: params
        })
    },
    // 获取函数助手列表
    funcList(params) {
        return instance.get(`/functionAssistant/fun_list`, {
            params: params
        })
    },
    // 获取函数详情页
    funcInfo(params) {
        return instance.get(`/functionAssistant/fun_info`, {
            params: params
        })
    },
    // 获取函数助手结果
    funcResult(params) {
        return instance.post(`/functionAssistant/fun_result`, params)
    },
}

export default apis
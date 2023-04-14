import {createRouter, createWebHistory} from "vue-router"

const routes = [
    {   //登录界面路由
        path: '/login',
        name: 'login',
        component: () => import(/*webpackChunkName:'Login'*/ '../page/login/login.vue'),
        meta: {
            requireAuth: true
        }
    },
    {// 主页
        path: '/',
        name: 'Home',
        component: () => import(/*webpackChunkName:'Home'*/ '../page/index/Home.vue'),
        meta: {
            requireAuth: true,
            title: '首页'
        },
        redirect: '/navigation',
        // 二级路由
        children: [
            {// debug
                path: '/debug',
                name: 'debug',
                component: () => import(/*webpackChunkName:'Debug'*/ '../page/debug/Debug.vue'),
                meta: {
                    requireAuth: true,
                    title: 'debug'
                }
            },
            {// 定时任务列表
                path: '/crontab',
                name: 'crontab',
                component: () => import(/*webpackChunkName:'UserInfo'*/ '../page/crontab/CrontabList.vue'),
                meta: {requireAuth: true, title: '定时任务'}
            },
            {// 用户列表
                path: '/userInfo',
                name: 'userInfo',
                component: () => import(/*webpackChunkName:'UserInfo'*/ '../page/user_page/user.vue'),
                meta: {requireAuth: true, title: '用户信息'}
            },
            {// 主界面
                path: '/navigation',
                name: 'Navigation',
                component: () => import(/*webpackChunkName:'Navigation'*/ '../page/navigation/navigation.vue'),
                meta: {requireAuth: true, title: "快捷方式"}
            },
            {//工具栏
                path: '/tools',
                name: 'tools',
                component: () => import(/*webpackChunkName:'Tools'*/ '../page/tools/ToolsManagement.vue'),
                meta: {
                    requireAuth: true, title: '工具栏'
                },
                redirect: '/Xmind2case',
                children: [
                    {   //项目下cases
                        path: '/Xmind2case',
                        name: 'Xmind2case',
                        component: () => import(/*webpackChunkName:'project'*/ '../page/tools/Xmind2case.vue'),
                        meta: {requireAuth: true, title: 'xmind2case'}
                    },{   //项目下cases
                        path: '/ChatGPT',
                        name: 'ChatGPT',
                        component: () => import(/*webpackChunkName:'project'*/ '../page/tools/ChatGPT.vue'),
                        meta: {requireAuth: true, title: 'ChatGPT'}
                    },{   //项目下cases
                        path: '/Message',
                        name: 'Message',
                        component: () => import(/*webpackChunkName:'project'*/ '../page/tools/Message.vue'),
                        meta: {requireAuth: true, title: 'Message'}
                    },
                ]
            },
            // {//项目列表
            //     path: '/ProjectList',
            //     name: 'ProjectList',
            //     meta: {requireAuth: true, title: '项目列表'},
            //     component: () => import(/*webpackChunkName:'projectList'*/ '../page/project/ProjectList.vue'),
            // },
            // {
            //     path: '/ApiList',
            //     name: 'ApiList',
            //     meta: {requireAuth: true, title: '接口列表'},
            //     component: () => import(/*webpackChunkName:'apiList'*/ '../page/project/ApiList.vue'),
            // },
            // {
            //     path: '/CaseList',
            //     name: 'CaseList',
            //     meta: {requireAuth: true, title: '用例列表'},
            //     component: () => import(/*webpackChunkName:'caseList'*/ '../page/project/CaseList.vue'),
            // },
            // {// 项目管理
            //     path: '/ProjectList',
            //     name: '',
            //     component: () => import(/*webpackChunkName:'projectList'*/ '../page/project/ProjectNavigation.vue'),
            //     meta: {requireAuth: true, title: '项目列表'},
            //     children: [
            //         {   //项目下apis
            //             path: '/ProjectApis',
            //             name: 'ProjectApis',
            //             component: () => import(/*webpackChunkName:'project'*/ '../page/project/ProjectApis.vue'),
            //             meta: {requireAuth: true, title: '项目apis'}
            //         },
            //         {   //项目下cases
            //             path: '/ProjectCases',
            //             name: 'ProjectCases',
            //             component: () => import(/*webpackChunkName:'project'*/ '../page/project/ProjectCases.vue'),
            //             meta: {requireAuth: true, title: '项目cases'}
            //         },
            //
            //     ]
            // },
            {
                path: '/ProjectManagement',
                name: 'ProjectManagement',
                component: () => import(/*webpackChunkName:'Tools'*/ '../page/project/ProjectManagement.vue'),
                meta: {
                    requireAuth: true, title: '项目管理'
                },
                redirect: '/ProjectList',
                children: [
                    {//项目列表
                        path: '/ProjectList',
                        name: 'ProjectList',
                        meta: {requireAuth: true, title: '项目列表'},
                        component: () => import(/*webpackChunkName:'projectList'*/ '../page/project/ProjectList.vue'),
                    },
                    {
                        path: '/ApiList',
                        name: 'ApiList',
                        meta: {requireAuth: true, title: '接口列表'},
                        component: () => import(/*webpackChunkName:'apiList'*/ '../page/project/ApiList.vue'),
                    },
                    {
                        path: '/CaseList',
                        name: 'CaseList',
                        meta: {requireAuth: true, title: '用例列表'},
                        component: () => import(/*webpackChunkName:'caseList'*/ '../page/project/CaseList.vue'),
                    },
                    {// 项目管理
                        path: '/ProjectList',
                        name: '',
                        component: () => import(/*webpackChunkName:'projectList'*/ '../page/project/ProjectNavigation.vue'),
                        meta: {requireAuth: true, title: '项目列表'},
                        children: [
                            {   //项目下apis
                                path: '/ProjectApis',
                                name: 'ProjectApis',
                                component: () => import(/*webpackChunkName:'project'*/ '../page/project/ProjectApis.vue'),
                                meta: {requireAuth: true, title: '项目apis'}
                            },
                            {   //项目下cases
                                path: '/ProjectCases',
                                name: 'ProjectCases',
                                component: () => import(/*webpackChunkName:'project'*/ '../page/project/ProjectCases.vue'),
                                meta: {requireAuth: true, title: '项目cases'}
                            },

                        ]
                    },
                ]

            },


        ]
    },

]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    // history: createWebHashHistory(),
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (to.name !== 'login' && !userInfo) next({
        name: 'login',
        query: {
            redirect: to.fullPath
        }
    })
    else next()
})
export default router

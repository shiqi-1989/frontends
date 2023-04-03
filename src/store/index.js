import {createStore} from 'vuex'

export default createStore({
    state: {
        isCollapse: true,
    }, mutations: {
        collapseMenu(state) {
            state.isCollapse = !state.isCollapse
        },
    }, actions: {}, modules: {}
})

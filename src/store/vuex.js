let Vue

class Store {
  constructor(options) {
    // 保存选项
    this.$options = options
    // 保存mutations
    this._mutations = options.mutations
    // 保存actions
    this._actions = options.actions
    // 保存getters
    this._getters = options.getters
    
    // 定义computed选项
    const computed = {}
    // 给用户暴露getters
    this.getters = {}
    const store = this
    // this._getters => {doubleCounter(state) {}}
    Object.keys(this._getters).forEach(key => {
      // 获取用户定义的getter
      const fn = store._getters[key]
      // 转换为computed可以使用的无参数形式
      computed[key] = function() {
        return fn(store.state)
      }
      // 为getters定义只读属性
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key]
      })
    })
    // 响应式操作
    this._vm = new Vue({
      data: {
        // 加上$$，既要对state做响应式，还不做代理
        $$state: options.state,
      },
      computed
    })
    // 绑定commit和dispatch上下文为store实例
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  // type 调用的mutation的名字 payload 参数
  commit(type, payload) {
    const entry = this._mutations[type]
    if (!entry) {
      console.error('unknown mutation')
      return
    }
    entry(this.state, payload)
  }

  dispatch(type, payload) {
    const entry = this._actions[type]
    if (!entry) {
      console.error('unknown action')
      return
    }
    // 使用时如下： add({ commit, dispatch, state, rootState ...}) {}
    // 就是store实例，所以传this
    entry(this, payload)
  }

  get state() {
    console.log(this._vm)
    // _data和$data是一回事
    return this._vm._data.$$state
  }

  set state(v) {
    console.error('请使用replaceState重置状态')
  }
}

function install(_Vue) {
  Vue = _Vue
  // 挂载$store
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    },
  })
}
// 导出的对象才是Vuex
export default { Store, install }

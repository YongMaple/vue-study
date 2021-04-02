let Vue
class VueRouter {
  constructor(options) {
    // 保存一下，以便在router-view中拿，通过this.$router.$options拿
    // options就是 new VueRouter({routes: [...]}) 里面传过来的
    this.$options = options
    // 把current作为响应式数据
    // 将来发生变化，router-view的render函数能够再次执行
    const initial = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'current', initial)

    window.addEventListener('hashchange', () => {
      this.current = window.location.hash.slice(1)
    })
  }
}
// install.call(VueRouter, Vue) install调用时，如此传入_Vue
VueRouter.install = function(_Vue) {
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      // 这些代码延迟到了组件实例化的时候才执行，这时就可以获取到组件选项了
      // 这些代码会在所有组件中都执行，但是只有在根实例中才有router，所以只在根实例中才执行如下代码
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
    },
  })

  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      return h('a', { attrs: { href: `#${this.to}` } }, this.$slots.default)
    },
    // JSX
    // render() {
    //   return <a href={`#${this.to}`}>{this.$slots.default}</a>
    // },
  })

  Vue.component('router-view', {
    render(h) {
      // 获取当前路由对应的组件
      let component = null
      const route = this.$router.$options.routes.find(
        (route) => route.path === this.$router.current
      )
      if (route) {
        component = route.component
      }
      return h(component)
    },
  })
}

export default VueRouter

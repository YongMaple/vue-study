let Vue
class VueRouter {
  constructor(options) {
    // 保存一下，以便在router-view中拿，通过this.$router.$options拿
    // options就是 new VueRouter({routes: [...]}) 里面传过来的
    this.$options = options
    // 把current作为响应式数据
    // 将来发生变化，router-view的render函数能够再次执行
    // const initial = window.location.hash.slice(1) || '/'
    // Vue.util.defineReactive(this, 'current', initial)

    this.current = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'matched', [])
    // match方法可以递归遍历路由表，获取匹配关系的数组
    this.match()

    window.addEventListener('hashchange', () => {
      this.current = window.location.hash.slice(1)
      this.matched = []
      this.match()
    })
  }

  match(routes) {
    routes = routes || this.$options.routes

    // 递归遍历
    for (const route of routes) {
      if (route.path === '/' && this.current === '/') {
        this.matched.push(route)
        return
      }

      // /about/info
      if (route.path !== '/' && this.current.indexOf(route.path) !== -1) {
        this.matched.push(route)
        if (route.children) {
          this.match(route.children)
        }
        return
      }
    }
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
      // 标记当前router-view深度
      this.$vnode.data.routerView = true
      
      let depth = 0
      let parent = this.$parent
      while(parent) {
        const vnodeData = parent.$vnode && parent.$vnode.data
        if (vnodeData) {
          if (vnodeData.routerView) {
            // 说明当前parent是一个router-view
            depth++
          }
        }
        parent = parent.$parent
      }
      // 获取当前路由对应的组件
      let component = null
      // const route = this.$options.routes.find(
      //   (route) => route.path === this.$router.current
      // )

      const route = this.$router.matched[depth]

      if (route) {
        component = route.component
      }
      return h(component)
    },
  })
}

export default VueRouter

let Vue
class VueRouter {}
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
    }
  })
}

export default VueRouter
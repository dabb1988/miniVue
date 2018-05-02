// 模板引擎
// 双向绑定


// 创建一个mvvm框架类
class MVVM {
	// 构造器（创造实例的模板）
	constructor (options) {
		// 缓存重要属性 
		this.$vm = this
		this.$el = options.el
		this.$data = options.data
		// 判断视图
		if (this.$el) {
			// 创建模板编译器，来解析视图
			this.compiler  = new TemplateCompiler(this.$el, this.$vm)
		}
	}
}

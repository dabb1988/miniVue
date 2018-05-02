// 创建一个模板编译工具
// 作用：解析视图模板，把对应的数据，渲染到页面
class TemplateCompiler{
	// 1) 视图线索
	// 2) 全局vm对象
	constructor(el, vm){
		// 缓存重要属性
		this.el = this.isElementNode(el) ? el : document.querySelector(el)
		this.vm = vm
		// 判断是否存在
		if (this.el) {
			// 1、把模板内容放入内存
			var fragment = this.node2fragment(this.el)
			// 2、解析模板
			this.compile(fragment)
			// 3、把内存结果返回页面
			this.el.appendChild(fragment)
		}
	}
	//****************工具方法*******************
	isElementNode (node) {
		return node.nodeType === 1 // 1、 元素节点  2、属性节点 3、文本节点
	}
	
	isTextNode (node) {
		return node.nodeType === 3 // 1、 元素节点  2、属性节点 3、文本节点
	}
	
	toArray (fakeArr) {
		return [].slice.call(fakeArr)
	}
	
	isDirective (attrname) { // v-text
		return attrname.indexOf('v-') >= 0 // 判断属性名是否有v-开头
	}
	//****************核心方法*******************
	// 把模板放入内存，等待解析
	node2fragment (node) {
		// 1、创建内存片段
		var fragment = document.createDocumentFragment(), child
//		debugger;
		// 2、把模板内容丢到内存
		while(child = node.firstChild){
			fragment.appendChild(child)
		}
		// 3、返回
		return fragment
	}
	
	compile (parent) {
		// 1、获取子节点
		var childNodes = parent.childNodes,
				complier = this
		// 2、遍历每一个节点
		var arr = this.toArray(childNodes)
		
		arr.forEach((node) => {
			// 3、判断节点类型
			if (complier.isElementNode(node)) { // 1)属性节点 （解析指令）
				complier.compileElement(node)
			} else { // 2)文本节点 （解析）
				// 定义文本表达式验证规则
				var textReg = /\{\{(.+)\}\}/
				var expr = node.textContent
				// 按照规则验证内容
				if (textReg.test(expr)) {
					expr = RegExp.$1
					// 调用方法编译
					complier.complieText(node, expr)
				}
			}
			
			
		})
//		debugger;
		
		
		// 4、如果还有子节点，继续解析，递归
	}
	// 解析元素节点指令的
	compileElement (node) {
		// 1、获取当前节点元素的所有属性
		var arrs = node.attributes,
				complier = this
		// 2、遍历当前元素的所有属性
		this.toArray(arrs).forEach( attr => {
			// 3、判断属性是否是指令
			var attrName = attr.name
			if (complier.isDirective(attrName)) {
				// 4、收集
				// var type = attrName.split('-')[1] // v-text, v-model
				var type = attrName.substr(2)
				// 指令的值就是表达式
				var expr = attr.value
				// 5、 找帮手
				// Compilerutils.text(node, complier.vm, expr)
				Compilerutils[type](node, complier.vm, expr)
			}
			
		})
	}
	// 解析表达式
	complieText (node, expr) {
		Compilerutils.text(node, this.vm, expr)
	}
}

// 帮手
Compilerutils = {
	// 解析text指令
	text (node, vm, expr) {
		// 1、 找到更新规则对象的更新方法
		var updaterFn = this.updater['textUpdater']
		// 2、执行方法
		updaterFn && updaterFn(node, vm.$data[expr])
	},
	model (node, vm, expr) {
		// 1、 找到更新规则对象的更新方法
		var updaterFn = this.updater['modelUpdater']
		// 2、执行方法
		updaterFn && updaterFn(node, vm.$data[expr])
	},
	// 更新规则对象
	updater: {
		// 文本更新方法
		textUpdater (node, value) {
			node.textContent = value
		},
		modelUpdater(node, value) {
			node.value = value
		}
	}
}
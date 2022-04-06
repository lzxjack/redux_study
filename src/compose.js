// 将多个函数连接起来：上一个函数的返回值作为下一个参数的输入
// 最终得到最后的返回值
// 从右向左的顺序执行
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  // 利用reduce方法执行每个中间件函数，并将上一个函数的返回作为下一个函数的参数
  // a:上一次调用回调的返回值，b:当前处理的元素
  // 所以是从右向左的顺序执行
  // compose(f, g, h)
  // (...args) => f(g(h(...args)))
  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}

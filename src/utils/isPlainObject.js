/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */

// 判读是否是简单对象
// 简单对象：obj.__proto__ === Object.prototype
// new Object 和 字面量 创建出的对象，是简单对象
// 换句话说，判断的是，一个对象是否是 Object 的实例对象

export default function isPlainObject(obj) {
  // 因为typeof null显示为'object'，所以单独讨论
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  // 沿着__proto__向上遍历原型链
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  // 最后判断原始对象的__proto__是否等于原型链的最上端
  return Object.getPrototypeOf(obj) === proto;
}

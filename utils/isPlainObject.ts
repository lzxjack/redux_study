/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */

// 判读是否是简单对象
// 简单对象：obj.__proto__ === Object.prototype

// new Object 和 字面量 创建出的对象，是简单对象

// 换句话说，判断的是，一个对象是否是 Object 的实例对象

export default function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

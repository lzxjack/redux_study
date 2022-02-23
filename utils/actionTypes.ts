/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */

// redux保留的私有action，不要在自己的代码中引用这些action

const randomString = () => Math.random().toString(36).substring(7).split('').join('.');
// 返回类似以下随机字符串
// g.p.v.y.3.f
// r.0.4.8.e
// v.q.q.g.r
// j.m.b.4.s.c
// 9.d.1.u.o
// 0.s.f.q.5.9
// r.g.1.v.y.j
// 1.a.y.b.r.o
// v.q.w.4.4.p

const ActionTypes = {
  INIT: `@@redux/INIT${/* #__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* #__PURE__ */ randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`,
};

export default ActionTypes;

// Inlined / shortened version of `kindOf` from https://github.com/jonschlinkert/kind-of

// 判断数据类型的函数
// 输出字符串
function miniKindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';

  // 以下数据类型不用处理
  const type = typeof val;
  switch (type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'symbol':
    case 'function': {
      return type;
    }
    default:
      break;
  }

  // 单独判断数组、日期、错误对象
  if (Array.isArray(val)) return 'array';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';

  // 通过val.constructor.name判断以下类型
  const constructorName = ctorName(val);
  switch (constructorName) {
    case 'Symbol':
    case 'Promise':
    case 'WeakMap':
    case 'WeakSet':
    case 'Map':
    case 'Set':
      return constructorName;
    default:
      break;
  }

  // other
  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
}

function ctorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

function isError(val) {
  return (
    val instanceof Error ||
    (typeof val.message === 'string' &&
      val.constructor &&
      typeof val.constructor.stackTraceLimit === 'number')
  );
}

function isDate(val) {
  if (val instanceof Date) return true;
  return (
    typeof val.toDateString === 'function' &&
    typeof val.getDate === 'function' &&
    typeof val.setDate === 'function'
  );
}

export function kindOf(val) {
  let typeOfVal = typeof val;

  // 开发环境下，进一步处理
  if (process.env.NODE_ENV !== 'production') {
    typeOfVal = miniKindOf(val);
  }

  return typeOfVal;
}

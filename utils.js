/**
 * 将传入的callback添加到微任务队列中
 * @param {*} callback 传入的回调
 */
function runMicroTask(callback) {
    if (globalThis.process && globalThis.process.nextTick) {
        globalThis.process.nextTick(callback);
    } else if (globalThis.queueMicrotask) {
        queueMicrotask(callback);
    } else if (globalThis.MutationObserver) {
        const observer = new MutationObserver(callback);
        const element = document.documentElement.querySelector('body');
        observer.observe(element, { attributes: true, childList: true });
        element.classList.add('class');
    } else {
        setTimeout(callback, 0);
    }
}
/**
 * 判断是否是一个Promise对象
 * @param {*} obj
 * @returns true 是 false 否
 */
function isPromise(obj) {
    return !!(
        obj &&
        typeof obj === 'object' &&
        typeof obj.then === 'function'
    )
}

function isExistAndEmptyArray(obj) {
    return !!(!obj || (Array.isArray(obj) && !obj.length));
}

/**
 * promise 处理回调函数
 * @param {*} p 
 * @param {*} x 
 * @param {*} resolve 
 * @param {*} reject 
 * @returns 
 */
function reolvePromise(p, x, resolve, reject) {
    if (x === p2) {
        // 2.3.1 如果promise和x引用同一个对象
        reject(new TypeError())
    } else if ((x !== null && typeof x === 'object') || typeof x === 'function') {
        // 2.3.2 如果x是一个promise
        // 2.3.3 如果x是一个对象或函数
        let called
        try {
            let then = x.then // 检索x.then属性，做容错处理
            if (typeof then === 'function') {
                then.call(x, // 使用call绑定会立即执行then方法，做容错处理
                    (y) => { // y也可能是一个Promise，递归调用直到y被resolve或reject
                        if (called) { return }
                        called = true
                        resolvePromise(p2, y, resolve, reject)
                    },
                    (r) => {
                        if (called) { return }
                        called = true
                        reject(r)
                    }
                )
            } else {
                resolve(x)
            }
        } catch (e) {
            if (called) { return }
            called = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}

// 三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

module.exports = {
    isPromise,
    runMicroTask,
    PENDING,
    FULFILLED,
    REJECTED,
    reolvePromise,
    isExistAndEmptyArray,
}
const { PENDING, FULFILLED, REJECTED, isPromise, runMicroTask, resolvePromise, isExistAndEmptyArray } = require('./utils.js');

// 定义promise类
class MyPromise {
    // 创建实例
    constructor(executor) {
        // 成功时需要返回的数据
        this._value = void 0;
        // 失败时需要返回的理由
        this._reason = void 0;
        // 处理成功和失败时的回调
        this._handlers = [];
        // 初始化状态
        this._state = PENDING;
        try {
            executor(this._resolve.bind(this), this._reject.bind(this));
        } catch (err) {
            console.log('err ', err);
            this._reject(err);
        }
    }

    /**
     * 根据具体情况，处理执行相应的回调逻辑
     * @param {*} param
     */
    _runOneHandler({ executor, state, resolve, reject }) {
        runMicroTask(() => {
            if (this._state !== state) return;
            const value = this._state === FULFILLED ? this._value : this._reason;
            if (typeof executor !== 'function') {
                this._state === FULFILLED ? resolve(value) : reject(value);
            }
            try {
                const result = executor(value);
                if (isPromise(result)) {
                    result.then(resolve, reject);
                } else {
                    this._state === FULFILLED ? resolve(result) : reject(result);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * 运行处理回调逻辑
     * @returns 
     */
    _runHandlers() {
        // 如果还是初始状态，就不需要继续处理
        if (this._state === PENDING || !this._handlers || !this._handlers.length) return;
        while (this._handlers[0]) {
            // const handler = this._handlers.shift();
            // this._runOneHandler(handler);
            const handler = this._handlers[0];
            this._runOneHandler(handler);
            this._handlers.shift();
        }
    }

    /**
     * 向处理成功和失败时的回调中添加对应的处理回调函数
     * @param {*} executor 处理回调执行函数
     * @param {*} state 可执行的状态
     * @param {*} resolve 成功处理回调
     * @param {*} reject 失败处理回调
     */
    _runPushHandler(executor, state, resolve, reject) {
        this._handlers.push({ executor, state, resolve, reject });
    }

    /**
     * 处理状态变更逻辑函数
     * @param {*} state 
     * @param {*} data 
     * @returns 
     */
    _changeState(state, data) {
        if (this._state !== PENDING) return;
        this._state = state;
        state === FULFILLED ? (this._value = data) : (this._reason = data);
        this._runHandlers();
    }

    /**
     * 记录成功时的状态和数据
     * @param {*} data 
     */
    _resolve(data) {
        this._changeState(FULFILLED, data);
    }

    /**
     * 记录失败时的状态和原因
     * @param {*} reason 
     */
    _reject(reason) {
        this._changeState(REJECTED, reason);
    }

    /**
     * Promise A + then方法的实现过程
     * @param {*} onFulfilled 成功时的回调处理函数
     * @param {*} onRejected 失败时的回调处理函数
     * @returns 新创建的MyPromise实例
     */
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
        return new MyPromise((resolve, reject) => {
            this._runPushHandler(onFulfilled, FULFILLED, resolve, reject);
            this._runPushHandler(onRejected, REJECTED, resolve, reject);
            this._runHandlers();
        });
    }

    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    static resolve(data) {
        if (data instanceof MyPromise) {
            return data;
        }
        return new MyPromise(resolve => {
            resolve(data);
        });
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        });
    }

    static all(promiseList) {
        return new MyPromise((resolve, reject) => {
            if (isExistAndEmptyArray(promiseList)) {
                resolve([]);
                return;
            }
            let count = 0; // 记录执行成功的数量
            let resultArr = [];
            promiseList.forEach((p, i) => {
                MyPromise.resolve(p).then(d => {
                    count++;
                    resultArr[i] = d;
                    if (count === promiseList.length) {
                        resolve(resultArr);
                    };
                }, (reason) => reject(reason));
            });
        });
    }

    static race(promiseList) {
        return new MyPromise((resolve, reject) => {
            if (!isExistAndEmptyArray(promiseList)) {
                promiseList.forEach(p => {
                    if (p instanceof MyPromise) {
                        p.then(d => {
                            resolve(d);
                        }, reason => {
                            reject(reason);
                        });
                    }
                });   
            }
        });
    }

    static allSettled(promiseList) {
        return new MyPromise((resolve, reject) => {
            const resultArr = [];
            let count = 0;
            if (isExistAndEmptyArray(promiseList)) {
                resolve([]);
                return;
            }
            promiseList.forEach((p, i) => {
                count ++;
                MyPromise.resolve(p).then(d => {
                    resultArr[i] = { state: FULFILLED, value: d };
                }).catch(reason => {
                    resultArr[i] = { state: REJECTED, reason };
                });
            });
            if (count === promiseList.length) {
                resolve(resultArr);
            }
        })
    }
}

// const p1 = new MyPromise((resolve, reject) => {
//     resolve(1);
// });

// const p2 = new MyPromise((resolve, reject) => {
//     reject(2);
// });

const p = new MyPromise((resolve, reject) => {
    resolve(22222);
}).then(data => {
    return new MyPromise((r1, r2) => {
        r2('000000000');
    });
}).catch(err => {
    console.log('err', err);
    return err;
});

setTimeout(function () {
    console.log('p', p);
}, 1500);

const p1 = new Promise((resolve, reject) => {
    resolve(22222);
}).then(data => {
    return new Promise((r1, r2) => {
        r2('000000000');
    });
}).catch(err => {
    console.log('err', err);
    return err;
});

setTimeout(function () {
    console.log('p1', p1);
}, 1500);
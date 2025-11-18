/**
 * 可观察对象类
 * 用于创建可被观察的状态对象
 */
export class Observable {
    /** 可观察的状态对象 */
    state;
    /** 属性处理器映射 */
    propsHandlers = new Map();
    /** 是否正在等待微任务执行 */
    waitingMicrotask = false;
    /** 微任务集合 */
    microtasks = new Set();
    /** 是否暂停观察 */
    paused = false;
    /**
     * 构造函数
     * @param data 初始状态对象
     */
    constructor(data) {
        this.state = new Proxy(data, {
            set: (target, prop, value) => {
                const oldValue = Reflect.get(target, prop);
                if (oldValue === value)
                    return true;
                const ret = Reflect.set(target, prop, value);
                ret && !this.paused && this.trigger(prop);
                return ret;
            }
        });
    }
    /**
     * 执行微任务
     */
    async runMicrotasks() {
        try {
            await Promise.all(Array.from(this.microtasks).map(task => {
                return task.callback(task.params.map(p => Reflect.get(this.state, p)));
            }));
        }
        catch (error) {
            console.error(error);
        }
        this.microtasks.clear();
        this.waitingMicrotask = false;
    }
    /**
     * 触发属性变更事件
     * @param prop 属性名
     */
    trigger(prop) {
        const propHandlers = this.propsHandlers.get(prop);
        const handlersToRemove = [];
        propHandlers?.forEach(handler => {
            if (handler.once) {
                handlersToRemove.push(handler);
            }
            if (handler.sync) {
                handler.callback(handler.params.map(p => Reflect.get(this.state, p)));
            }
            else {
                this.microtasks.add(handler);
                if (!this.waitingMicrotask) {
                    this.waitingMicrotask = true;
                    queueMicrotask(() => this.runMicrotasks());
                }
            }
        });
        // 移除一次性处理器
        handlersToRemove.forEach(handler => {
            this.unobserveHandler(handler);
        });
    }
    /**
     * 观察属性变化
     * @param props 要观察的属性名数组
     * @param callback 属性变化时的回调函数
     * @param options 观察选项
     * @returns 取消观察的函数
     */
    observe(props, callback, options = {}) {
        const { propsHandlers } = this;
        const handler = {
            callback,
            params: [...props],
            sync: options.sync,
            once: options.once
        };
        props.forEach(prop => {
            const propHandlers = propsHandlers.get(prop);
            if (propHandlers) {
                propHandlers.add(handler);
            }
            else {
                propsHandlers.set(prop, new Set([handler]));
            }
        });
        if (options.immediate) {
            handler.callback(handler.params.map(p => this.state[p]));
        }
        // 返回取消观察的函数
        return () => this.unobserve(props, handler);
    }
    /**
     * 获取状态对象
     * @returns 状态对象
     */
    getState() {
        return this.state;
    }
    /**
     * 设置状态对象
     * @param state 状态对象
     */
    setState(state) {
        Object.assign(this.state, state);
        return this;
    }
    /**
     * 取消观察处理器
     * @param handler 要取消的处理器
     */
    unobserveHandler(handler) {
        this.microtasks.delete(handler);
        for (const [prop, handlers] of this.propsHandlers.entries()) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.propsHandlers.delete(prop);
            }
        }
    }
    /**
     * 取消观察特定属性
     * @param props 要取消观察的属性名数组
     * @param handler 要取消的处理器, 不填则取消所有处理器
     */
    unobserve(props, handler) {
        const { propsHandlers } = this;
        if (!handler) {
            props.forEach(prop => {
                propsHandlers.delete(prop);
            });
            return;
        }
        props.forEach(prop => {
            propsHandlers.get(prop)?.delete(handler);
        });
    }
    /**
     * 销毁所有观察者
     */
    destroyAll() {
        this.propsHandlers.clear();
        this.microtasks.clear();
    }
}

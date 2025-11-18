import { o } from '../data';
function dfs(data, cb, childrenKey = 'children', index = 0, parent) {
    const result = cb(data, index, parent);
    if (result === false)
        return result;
    const children = o(data).get(childrenKey);
    if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const result = dfs(child, cb, childrenKey, i, data);
            if (result === false)
                return result;
        }
    }
}
function bfs(data, callback, childrenKey = 'children') {
    const queue = [data];
    while (queue.length) {
        const item = queue.shift();
        const index = queue.length;
        const result = callback(item, index);
        if (result === false)
            return result;
        const children = o(item).get(childrenKey);
        if (Array.isArray(children)) {
            children.forEach(child => queue.push(child));
        }
    }
}
export class TreeNode {
    data;
    /** 父节点 */
    parent;
    /** 子节点 */
    children;
    /** 在树中的深度 */
    depth = 0;
    /** 是否叶子节点 */
    isLeaf = false;
    /** 在树中的索引 */
    index = 0;
    constructor(data) {
        this.data = data;
    }
    dfs(cb) {
        return dfs(this, cb);
    }
    bfs(cb) {
        return bfs(this, cb);
    }
    /** 移除当前节点 */
    remove() {
        const { parent, index } = this;
        if (!parent)
            return;
        const children = parent.children;
        children.splice(index, 1);
        for (let i = index; i < children.length; i++) {
            children[i].index = i;
        }
    }
}
export function createNode(options) {
    const { data, getNode, childrenKey, parent, index = 0 } = options;
    const node = getNode(data);
    node.index = index;
    if (parent) {
        node.parent = parent;
        parent.children?.push(node);
    }
    const childrenData = o(data).get(childrenKey);
    if (Array.isArray(childrenData) && childrenData.length) {
        const nodes = childrenData.map((data, index) => {
            return createNode({ data, getNode, childrenKey, parent: node, index });
        });
        node.children = nodes;
    }
    return node;
}
export class Tree {
    root;
    constructor(options) {
        const { data, TreeNode, childrenKey = 'children' } = options;
        this.root = createNode({
            data,
            childrenKey,
            getNode: (data) => {
                return new TreeNode(data);
            }
        });
    }
    dfs(cb) {
        return this.root.dfs(cb);
    }
    bfs(cb) {
        return this.root.bfs(cb);
    }
    /**
     * 查找第一个满足条件的节点
     * @param predicate 条件
     * @returns 满足条件的节点或 null
     */
    find(predicate) {
        let result = null;
        this.root.bfs(node => {
            if (predicate(node)) {
                result = node;
                return false;
            }
        });
        return result;
    }
    /**
     * 查找所有满足条件的节点
     * @param predicate 条件
     * @returns 满足条件的节点数组
     */
    findAll(predicate) {
        const result = [];
        this.root.dfs(node => {
            if (predicate(node)) {
                result.push(node);
            }
        });
        return result;
    }
}

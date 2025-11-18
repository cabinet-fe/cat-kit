import { TreeNode, createNode } from './tree';
export class ForestNode extends TreeNode {
    forest;
    constructor(data, forest) {
        super(data);
        this.forest = forest;
    }
    remove() {
        const { parent, index, forest } = this;
        if (parent) {
            parent.children.splice(index, 1);
        }
        else {
            const { roots } = forest;
            roots.splice(index, 1);
            for (let i = index; i < roots.length; i++) {
                roots[i].index = i;
            }
        }
    }
}
export class Forest {
    roots = [];
    constructor(options) {
        const { data, ForestNode, childrenKey = 'children' } = options;
        this.roots = data.map((item, index) => {
            return createNode({
                data: item,
                childrenKey,
                index,
                getNode: data => {
                    return new ForestNode(data, this);
                }
            });
        });
    }
    dfs(cb) {
        this.roots.forEach(root => root.dfs(cb));
    }
}

import { TreeNode } from './tree';
export declare class ForestNode<Data extends Record<string, any> = Record<string, any>> extends TreeNode<Data> {
    readonly forest: Forest<Data, ForestNode<Data>>;
    constructor(data: Data, forest: Forest<Data, ForestNode<Data>>);
    remove(): void;
}
export declare class Forest<Data extends Record<string, any>, Node extends ForestNode<Data>> {
    roots: Node[];
    constructor(options: {
        data: Data[];
        ForestNode: new (data: Data, forest: Forest<Data, any>) => Node;
        childrenKey?: string;
    });
    dfs(cb: (node: Node) => void | boolean): void;
}

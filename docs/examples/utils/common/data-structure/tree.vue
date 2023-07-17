<template>
  <div>
    <JsonEditor v-model="data" />
    <NodeRender v-for="node of tree.root.children" :node="node" />
  </div>
</template>

<script lang="tsx" setup>
import { Tree, TreeNode } from '@cat-kit/fe'
import { PropType, computed, defineComponent, reactive, shallowRef } from 'vue'

const data = shallowRef([
  {
    id: 1,
    children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }, { id: 5 }]
  },
  { id: 6 }
])

const NodeRender = defineComponent({
  name: 'NodeRender',

  props: {
    node: {
      type: Object as PropType<TreeNode<{ id: number }>>,
      required: true
    }
  },

  setup(props) {
    return () => {
      const { node } = props
      return (
        <>
          <div style={{ paddingLeft: node.depth * 20 + 'px' }}>
            - {node.data.id} <a>{node.expand ? '收起' : '展开'}</a>
          </div>

          {node.children?.map(child => <NodeRender node={child} />)}
        </>
      )
    }
  }
})

class CustomTreeNode<Data> extends TreeNode<Data> {
  props = reactive({
    expanded: false
  })

  constructor(data: Data, index: number, parent?: CustomTreeNode<Data>) {
    super(data, index, parent)
  }
}

class CustomTree<Data extends Record<string, any>> extends Tree<
  Data,
  Node
> {
  constructor(data: Data, options: TreeOptions<Node>) {
    super(data, options)
  }
}

const tree = computed(() => {
  return new CustomTree<Data, CustomTreeNode<Data>>(data.value[0]!).root.data
})

abstract class A {
  name!: string
}

class B extends A implements A {

}
</script>

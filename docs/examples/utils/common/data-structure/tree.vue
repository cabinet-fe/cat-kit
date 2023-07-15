<template>
  <div>
    <JsonEditor v-model="data" />
    <NodeRender v-for="node of tree.root" :node="node" />
  </div>
</template>

<script lang="tsx" setup>
import { Tree, TreeNode } from '@cat-kit/fe'
import { PropType, computed, defineComponent, shallowRef } from 'vue'

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
            - {node.data.id} <a>{node.expand 展开}</a>
          </div>

          {node.children?.map(child => <NodeRender node={child} />)}
        </>
      )
    }
  }
})



const tree = computed(() => {
  return new Tree(data.value)
})
</script>

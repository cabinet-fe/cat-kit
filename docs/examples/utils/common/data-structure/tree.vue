<template>
  <div>
    <JsonEditor v-model="data" />
    {{ forest.size }}
    <NodeRender v-for="node of forest.nodes" :node="node" />
  </div>
</template>

<script lang="tsx" setup>
import { Forest, TreeNode } from '@cat-kit/fe'
import {
  type PropType,
  computed,
  defineComponent,
  shallowReactive,
  shallowRef
} from 'vue'

type Data = {
  id: number
  children?: Data[]
}

const data = shallowRef<Data[]>([
  {
    id: 1,
    children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }, { id: 5 }]
  },
  { id: 6 }
])

type DataItem = (typeof data.value)[number]

// TreeNode是一个抽象类，所以你必须派生出自己的子类才能使用树相关的API
class CustomTreeNode<Val extends Record<string, any>> extends TreeNode<Val> {
  children?: CustomTreeNode<Val>[]

  parent: CustomTreeNode<Val> | null = null

  expanded = true

  constructor(value: Val, index: number, parent?: CustomTreeNode<Val>) {
    super(value, index)

    if (parent) {
      this.parent = parent
    }
    return shallowReactive(this)
  }
}

const forest = computed(() => {
  return Forest.create(data.value, CustomTreeNode)
})

const NodeRender = defineComponent({
  name: 'NodeRender',

  props: {
    node: {
      type: Object as PropType<CustomTreeNode<DataItem>>,
      required: true
    }
  },

  setup(props) {
    const toggleExpand = () => {
      props.node.expanded = !props.node.expanded
    }

    const handleDelete = () => {
      if (props.node.remove()) {
      }
    }

    const append = () => {
      props.node.append({ id: Math.random() })
    }

    const insert = () => {
      props.node.addToNext({ id: Math.random() })
    }
    const insertBefore = () => {
      props.node.addToPrev({ id: Math.random() })
    }

    return () => {
      const { node } = props
      return (
        <>
          <div style={{ paddingLeft: (node.depth - 1) * 20 + 'px' }}>
            <span>- {node.data.id}</span>
            {!node.isLeaf ? (
              <VButton onClick={toggleExpand}>
                {node.expanded ? '收起' : '展开'}
              </VButton>
            ) : null}
            <VButton onClick={handleDelete}>删除</VButton>
            <VButton onClick={append}>添加</VButton>
            <VButton onClick={insert}>插入到当前行下</VButton>
            <VButton onClick={insertBefore}>插入到当前行前</VButton>
          </div>

          {node.expanded
            ? node.children?.map(child => <NodeRender node={child} />)
            : null}
        </>
      )
    }
  }
})
</script>

<style>
a {
  user-select: none;
  cursor: pointer;
}

a + a {
  margin-left: 6px;
}
</style>

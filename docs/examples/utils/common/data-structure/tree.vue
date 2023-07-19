<template>
  <div>
    <JsonEditor v-model="data" />
    <NodeRender v-for="node of tree.children" :node="node" />
  </div>
</template>

<script lang="tsx" setup>
import { Tree, TreeNode } from '@cat-kit/fe'
import {
  PropType,
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

class CustomTreeNode<Val extends Record<string, any>> extends TreeNode<Val> {
  override children?: CustomTreeNode<Val>[] = undefined

  override parent: CustomTreeNode<Val> | null = null

  expanded = true

  constructor(value: Val, index: number, parent?: CustomTreeNode<Val>) {
    super(value, index)

    if (parent) {
      this.parent = parent
    }
  }
}

const tree = computed(() => {
  return Tree.create({ id: -1, children: data.value }, (val, index, parent) =>
    shallowReactive(new CustomTreeNode(val, index, parent))
  )
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
      props.node.append(index =>
        shallowReactive(new CustomTreeNode({ id: Math.random() }, index))
      )
    }

    const insert = () => {
      props.node.addToNext(index =>
        shallowReactive(new CustomTreeNode({ id: Math.random() }, index))
      )
    }

    return () => {
      const { node } = props
      return (
        <>
          <div style={{ paddingLeft: (node.depth - 1) * 20 + 'px' }}>
            <span>- {node.value.id}</span>
            {!node.isLeaf ? (
              <a onClick={toggleExpand}>{node.expanded ? '收起' : '展开'}</a>
            ) : null}
            <a onClick={handleDelete}>删除</a>
            <a onClick={append}>添加</a>
            <a onClick={insert}>插入到当前行下</a>
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

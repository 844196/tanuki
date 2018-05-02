<template lang="pug">
main#main.container
  sortable-tree(:data="data", childrenAttr="children", mixinParentKey="$parent", closeStateKey="fold")
    template(slot-scope="{ item }")
      div.item(v-if="item.name !== undefined")
        b-field
          p.control(v-if="item.hasChild()", style="z-index:1")
            button.button.is-small(@click="item.toggleFold()", :disabled="!item.hasChild()") {{ item.fold ? '▶' : '▼' }}
          p.control(v-if="item.hasChild()")
            span.button.is-small.is-static {{ item.totalPoint() }}人日
          b-input(
            v-if="!item.hasChild()",
            size="is-small"
            min="0",
            type="number",
            :value.number="item.hasChild() ? item.totalPoint() : item.point",
            @input="item.point = parseInt($event)",
            :disabled="item.hasChild()"
          )
          p.control(v-if="!item.hasChild()")
            span.button.is-small.is-static 人日
          b-input(size="is-small", type="text", v-model="item.name")
          p.control
            button.button.is-small.is-info(@click="item.addChild()") &plus;
          p.control
            button.button.is-small.is-warning(@click="item.$parent.removeChild(item)") &times;
  hr
  div
    b-input(size="is-small", type="textarea", v-model="dump")
  hr
  div
    b-input(size="is-small", type="textarea", v-model="data.toMarkdown()", readonly)
</template>

<script lang="ts">
import Vue from 'vue'
import SortableTree from 'vue-sortable-tree'

interface RawData {
  name: string
  point: number
  children: Array<RawData>
  fold: boolean
}

class Data {
  public name = ''
  public point = 10
  public children: Array<Data> = []
  public fold = false

  toggleFold (): void {
    this.fold = !this.fold
  }

  hasChild (): boolean {
    return this.children.length > 0
  }

  totalPoint (): number {
    if (this.children.length === 0) {
      return this.point
    }
    return this.children.reduce((acc, child) => {
      acc += child.totalPoint()
      return acc
    }, 0)
  }

  addChild (): void {
    this.children.push(new Data())
  }

  removeChild (target: Data): void {
    const idx = this.children.findIndex(child => child === target)
    this.children.splice(idx, 1)
  }

  static from ({ name, point, children, fold }: RawData): Data {
    const self = new Data()
    self.name = name
    self.point = point
    self.children = children.map(child => Data.from(child))
    self.fold = fold
    return self
  }

  toMarkdown (): string {
    let str = `* ${this.name}: ${this.totalPoint()}人日`
    if (this.hasChild()) {
      str += this.children
        .reduce((acc, child) => {
          acc = `${acc}\n${child.toMarkdown()}`
          return acc
        }, '')
        .split('\n')
        .map(e => '    ' + e)
        .join('\n')
    }
    return str
  }
}

const data = new Data()

export default Vue.extend({
  name: 'Home',
  components: {
    [SortableTree.name]: SortableTree
  },
  data () {
    return {
      data
    }
  },
  computed: {
    dump: {
      get (): string {
        return JSON.stringify(this.data, (k, v) => {
          if (k === '$parent') {
            return undefined
          }
          return v
        }, '  ')
      },
      set (value: string): void {
        this.data = Data.from(JSON.parse(value))
      }
    }
  }
})
</script>

<style lang="stylus" scoped>
#main
  padding: 1rem

.sortable-tree
  & >>> .content
    margin-bottom: unset
  & >>> ul
    margin-left: 1em !important
  & >>> li
    &:before
      border-left: 1px dashed #999 !important
    &:after
      border-top: 1px dashed #999 !important
</style>

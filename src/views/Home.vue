<template lang="pug">
main#main.container
  sortable-tree(:data="model", childrenAttr="children", mixinParentKey="$parent", closeStateKey="fold")
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
    b-input(size="is-small", type="textarea", v-model="json")
  hr
  div
    b-input(size="is-small", type="textarea", :value="markdown", readonly)
</template>

<script lang="ts">
import Vue from 'vue'
import SortableTree from 'vue-sortable-tree'
import Task from '@/models/task'

export default Vue.extend({
  name: 'Home',
  components: {
    [SortableTree.name]: SortableTree
  },
  data () {
    return {
      model: Task.empty()
    }
  },
  computed: {
    json: {
      get (): string {
        return JSON.stringify(this.model.deflate(), null, 2)
      },
      set (value: string): void {
        this.model = Task.inflate(JSON.parse(value))
      }
    },
    markdown (): string {
      return this.model.toMarkdown()
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

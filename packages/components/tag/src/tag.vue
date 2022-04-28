<template>
  <span
    v-if="!disableTransitions"
    :class="classes"
    :style="{ backgroundColor: color }"
    @click="handleClick"
  >
    <span :class="ns.e('content')">
      <slot />
    </span>
    <el-icon v-if="closable" :class="ns.e('close')" @click="handleClose">
      <Close />
    </el-icon>
  </span>
  <transition v-else :name="`${ns.namespace.value}-zoom-in-center`">
    <span
      :class="classes"
      :style="{ backgroundColor: color }"
      @click="handleClick"
    >
      <span :class="ns.e('content')">
        <slot />
      </span>
      <el-icon v-if="closable" :class="ns.e('close')" @click="handleClose">
        <svg
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          class="ads-icon"
        >
          <path
            d="M512 128a384 384 0 1 0 0 768A384 384 0 0 0 512 128zM0 512a512 512 0 1 1 1024 0A512 512 0 0 1 0 512z"
            fill="#1E4DFF"
            opacity=".4"
          />
          <path
            d="M331.008 331.008a64 64 0 0 1 90.496 0l271.552 271.552a64 64 0 0 1-90.56 90.496L331.008 421.504a64 64 0 0 1 0-90.496z"
            fill="#1E4DFF"
          />
          <path
            d="M331.008 692.992a64 64 0 0 1 0-90.496l271.552-271.552a64 64 0 1 1 90.496 90.56l-271.552 271.488a64 64 0 0 1-90.496 0z"
            fill="#1E4DFF"
          />
        </svg>
      </el-icon>
    </span>
  </transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ElIcon from '@element-plus/components/icon'
import { Close } from '@element-plus/icons-vue'

import { useNamespace, useSize } from '@element-plus/hooks'
import { tagEmits, tagProps } from './tag'

defineOptions({
  name: 'ElTag',
})
const props = defineProps(tagProps)
const emit = defineEmits(tagEmits)

const tagSize = useSize()
const ns = useNamespace('tag')
const classes = computed(() => {
  const { type, hit, effect, closable } = props
  return [
    ns.b(),
    ns.is('closable', closable),
    ns.m(type),
    ns.m(tagSize.value),
    ns.m(effect),
    ns.is('hit', hit),
  ]
})

// methods
const handleClose = (event: MouseEvent) => {
  event.stopPropagation()
  emit('close', event)
}

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

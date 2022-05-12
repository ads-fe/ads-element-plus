<template>
  <div
    ref="selectWrapper"
    v-click-outside:[popperPaneRef]="handleClose"
    :class="wrapperKls"
    @click.stop="toggleMenu"
  >
    <el-tooltip
      ref="tooltipRef"
      v-model:visible="dropMenuVisible"
      placement="bottom-start"
      :teleported="compatTeleported"
      :popper-class="[nsSelect.e('popper'), popperClass]"
      :fallback-placements="['bottom-start', 'top-start', 'right', 'left']"
      :effect="effect"
      :offset="offset"
      pure
      trigger="click"
      :transition="`${nsSelect.namespace.value}-zoom-in-top`"
      :stop-popper-mouse-event="false"
      :gpu-acceleration="false"
      :show-arrow="false"
      :persistent="persistent"
      @show="handleMenuEnter"
    >
      <template #default>
        <div class="select-trigger">
          <div
            v-if="multiple"
            ref="tags"
            :class="nsSelect.e('tags')"
            :style="selectTagsStyle"
          >
            <span
              v-if="collapseTags && selected.length"
              :class="[
                nsSelect.b('tags-wrapper'),
                { 'has-prefix': prefixWidth && selected.length },
              ]"
            >
              <el-tag
                :closable="!selectDisabled && !selected[0].isDisabled"
                :size="collapseTagSize"
                :hit="selected[0].hitState"
                :type="tagType"
                effect="dark"
                disable-transitions
                @close="deleteTag($event, selected[0])"
              >
                <span
                  :class="nsSelect.e('tags-text')"
                  :style="{ maxWidth: inputWidth - 123 + 'px' }"
                  >{{ selected[0].currentLabel }}</span
                >
              </el-tag>
              <el-tag
                v-if="selected.length > 1"
                :closable="false"
                :size="collapseTagSize"
                :type="tagType"
                effect="dark"
                disable-transitions
              >
                <el-tooltip
                  v-if="collapseTagsTooltip"
                  :disabled="dropMenuVisible"
                  :fallback-placements="['bottom', 'top', 'right', 'left']"
                  :effect="effect"
                  placement="bottom"
                  :teleported="false"
                >
                  <template #default>
                    <span :class="nsSelect.e('tags-text')"
                      >+ {{ selected.length - 1 }}</span
                    >
                  </template>
                  <template #content>
                    <div :class="nsSelect.e('collapse-tags')">
                      <div
                        v-for="(item, idx) in selected"
                        :key="idx"
                        :class="nsSelect.e('collapse-tag')"
                      >
                        <el-tag
                          :key="getValueKey(item)"
                          class="in-tooltip"
                          :closable="!selectDisabled && !item.isDisabled"
                          :size="collapseTagSize"
                          :hit="item.hitState"
                          :type="tagType"
                          effect="dark"
                          disable-transitions
                          :style="{ margin: '2px' }"
                          @close="deleteTag($event, item)"
                        >
                          <span
                            :class="nsSelect.e('tags-text')"
                            :style="{
                              maxWidth: inputWidth - 75 + 'px',
                            }"
                            >{{ item.currentLabel }}</span
                          >
                        </el-tag>
                      </div>
                    </div>
                  </template>
                </el-tooltip>
                <span v-else :class="nsSelect.e('tags-text')"
                  >+ {{ selected.length - 1 }}</span
                >
              </el-tag>
            </span>
            <!-- <div> -->
            <transition v-if="!collapseTags" @after-leave="resetInputHeight">
              <span
                :class="[
                  nsSelect.b('tags-wrapper'),
                  { 'has-prefix': prefixWidth && selected.length },
                ]"
              >
                <el-tag
                  v-for="item in selected"
                  :key="getValueKey(item)"
                  :closable="!selectDisabled && !item.isDisabled"
                  :size="collapseTagSize"
                  :hit="item.hitState"
                  :type="tagType"
                  disable-transitions
                  @close="deleteTag($event, item)"
                >
                  <span
                    :class="nsSelect.e('tags-text')"
                    :style="{ maxWidth: inputWidth - 75 + 'px' }"
                    >{{ item.currentLabel }}</span
                  >
                </el-tag>
              </span>
            </transition>
            <!-- </div> -->
            <input
              v-if="filterable"
              ref="input"
              v-model="query"
              type="text"
              :class="[nsSelect.e('input'), nsSelect.is(selectSize)]"
              :disabled="selectDisabled"
              :autocomplete="autocomplete"
              :style="{
                marginLeft:
                  (prefixWidth && !selected.length) || tagInMultiLine
                    ? `${prefixWidth}px`
                    : '',
                flexGrow: 1,
                width: `${inputLength / (inputWidth - 32)}%`,
                maxWidth: `${inputWidth - 42}px`,
              }"
              @focus="handleFocus"
              @blur="handleBlur"
              @keyup="managePlaceholder"
              @keydown="resetInputState"
              @keydown.down.prevent="navigateOptions('next')"
              @keydown.up.prevent="navigateOptions('prev')"
              @keydown.esc.stop.prevent="visible = false"
              @keydown.enter.stop.prevent="selectOption"
              @keydown.delete="deletePrevTag"
              @keydown.tab="visible = false"
              @compositionstart="handleComposition"
              @compositionupdate="handleComposition"
              @compositionend="handleComposition"
              @input="debouncedQueryChange"
            />
          </div>
          <el-input
            :id="id"
            ref="reference"
            v-model="selectedLabel"
            type="text"
            :placeholder="currentPlaceholder"
            :name="name"
            :autocomplete="autocomplete"
            :size="selectSize"
            :disabled="selectDisabled"
            :readonly="readonly"
            :validate-event="false"
            :class="[nsSelect.is('focus', visible)]"
            :tabindex="multiple && filterable ? -1 : undefined"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="debouncedOnInputChange"
            @paste="debouncedOnInputChange"
            @compositionstart="handleComposition"
            @compositionupdate="handleComposition"
            @compositionend="handleComposition"
            @keydown.down.stop.prevent="navigateOptions('next')"
            @keydown.up.stop.prevent="navigateOptions('prev')"
            @keydown.enter.stop.prevent="selectOption"
            @keydown.esc.stop.prevent="visible = false"
            @keydown.tab="visible = false"
            @mouseenter="inputHovering = true"
            @mouseleave="inputHovering = false"
          >
            <template v-if="$slots.prefix" #prefix>
              <div
                style="
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <slot name="prefix" />
              </div>
            </template>
            <template #suffix>
              <el-icon
                v-show="!showClose"
                :size="16"
                :class="[nsSelect.e('caret'), nsSelect.e('icon'), iconReverse]"
              >
                <component :is="iconComponent" v-if="iconComponent" />
                <svg
                  v-else
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  class="ads-icon"
                >
                  <path
                    d="M210.752 685.248a64 64 0 0 1 0-90.496l256-256a64 64 0 0 1 90.496 0l256 256a64 64 0 0 1-90.496 90.496L512 474.496l-210.752 210.752a64 64 0 0 1-90.496 0z"
                  />
                </svg>
              </el-icon>
              <el-icon
                v-if="showClose"
                :size="16"
                :class="[nsSelect.e('caret'), nsSelect.e('icon')]"
                @click="handleClearClick"
              >
                <component :is="clearIcon" v-if="clearIcon" />
                <svg
                  v-else
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  class="ads-icon"
                >
                  <path
                    d="M512 128a384 384 0 1 0 0 768A384 384 0 0 0 512 128zM0 512a512 512 0 1 1 1024 0A512 512 0 0 1 0 512z"
                    opacity=".4"
                  />
                  <path
                    d="M331.008 331.008a64 64 0 0 1 90.496 0l271.552 271.552a64 64 0 0 1-90.56 90.496L331.008 421.504a64 64 0 0 1 0-90.496z"
                    fill="#CBCCD1"
                  />
                  <path
                    d="M330.944 692.992a64 64 0 0 1 0-90.496l271.552-271.552a64 64 0 1 1 90.496 90.56l-271.488 271.488a64 64 0 0 1-90.56 0z"
                    fill="#CBCCD1"
                  />
                </svg>
              </el-icon>
            </template>
          </el-input>
        </div>
      </template>
      <template #content>
        <el-select-menu>
          <el-scrollbar
            v-show="options.size > 0 && !loading"
            ref="scrollbar"
            tag="ul"
            :wrap-class="nsSelect.be('dropdown', 'wrap')"
            :view-class="nsSelect.be('dropdown', 'list')"
            :class="[
              nsSelect.is(
                'empty',
                !allowCreate && query && filteredOptionsCount === 0
              ),
            ]"
          >
            <el-option v-if="showNewOption" :value="query" :created="true" />
            <slot />
          </el-scrollbar>
          <template
            v-if="
              emptyText &&
              (!allowCreate || loading || (allowCreate && options.size === 0))
            "
          >
            <slot v-if="$slots.empty" name="empty" />
            <p v-else :class="nsSelect.be('dropdown', 'empty')">
              {{ emptyText }}
            </p>
          </template>
        </el-select-menu>
      </template>
    </el-tooltip>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  toRefs,
  unref,
} from 'vue'
import { ClickOutside } from '@element-plus/directives'
import { useFocus, useLocale, useNamespace } from '@element-plus/hooks'
import ElInput from '@element-plus/components/input'
import ElTooltip, {
  useTooltipContentProps,
} from '@element-plus/components/tooltip'
import ElScrollbar from '@element-plus/components/scrollbar'
import ElTag, { tagProps } from '@element-plus/components/tag'
import ElIcon from '@element-plus/components/icon'
import { useDeprecateAppendToBody } from '@element-plus/components/popper'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import {
  addResizeListener,
  isValidComponentSize,
  removeResizeListener,
} from '@element-plus/utils'
// import { ArrowUp, CircleClose } from '@element-plus/icons-vue'
import ElOption from './option.vue'
import ElSelectMenu from './select-dropdown.vue'
import { useSelect, useSelectStates } from './useSelect'
import { selectKey } from './token'

import type { Component, PropType } from 'vue'
import type { ComponentSize } from '@element-plus/constants'
import type { SelectContext } from './token'

const COMPONENT_NAME = 'ElSelect'
export default defineComponent({
  name: COMPONENT_NAME,
  componentName: COMPONENT_NAME,
  components: {
    ElInput,
    ElSelectMenu,
    ElOption,
    ElTag,
    ElScrollbar,
    ElTooltip,
    ElIcon,
  },
  directives: { ClickOutside },
  props: {
    name: String,
    id: String,
    modelValue: {
      type: [Array, String, Number, Boolean, Object],
      default: undefined,
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    automaticDropdown: Boolean,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    effect: {
      type: String as PropType<'light' | 'dark' | string>,
      default: 'light',
    },
    offset: {
      type: Number,
      default: -1,
    },
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    allowCreate: Boolean,
    loading: Boolean,
    popperClass: {
      type: String,
      default: '',
    },
    remote: Boolean,
    loadingText: String,
    noMatchText: String,
    noDataText: String,
    remoteMethod: Function,
    filterMethod: Function,
    multiple: Boolean,
    multipleLimit: {
      type: Number,
      default: 0,
    },
    placeholder: {
      type: String,
    },
    defaultFirstOption: Boolean,
    reserveKeyword: {
      type: Boolean,
      default: true,
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    collapseTags: Boolean,
    collapseTagsTooltip: {
      type: Boolean,
      default: false,
    },
    popperAppendToBody: {
      type: Boolean,
      default: undefined,
    },
    teleported: useTooltipContentProps.teleported,
    persistent: {
      type: Boolean,
      default: true,
    },
    clearIcon: {
      type: [String, Object] as PropType<string | Component>,
    },
    fitInputWidth: {
      type: Boolean,
      default: false,
    },
    suffixIcon: {
      type: [String, Object] as PropType<string | Component>,
    },
    // eslint-disable-next-line vue/require-prop-types
    tagType: { ...tagProps.type, default: 'default' },
  },
  emits: [
    UPDATE_MODEL_EVENT,
    CHANGE_EVENT,
    'remove-tag',
    'clear',
    'visible-change',
    'focus',
    'blur',
  ],

  setup(props, ctx) {
    const nsSelect = useNamespace('select')
    const nsInput = useNamespace('input')
    const { t } = useLocale()
    const states = useSelectStates(props)
    const {
      optionsArray,
      selectSize,
      readonly,
      handleResize,
      collapseTagSize,
      debouncedOnInputChange,
      debouncedQueryChange,
      deletePrevTag,
      deleteTag,
      deleteSelected,
      handleOptionSelect,
      scrollToOption,
      setSelected,
      resetInputHeight,
      managePlaceholder,
      showClose,
      selectDisabled,
      iconComponent,
      iconReverse,
      showNewOption,
      emptyText,
      toggleLastOptionHitState,
      resetInputState,
      handleComposition,
      onOptionCreate,
      onOptionDestroy,
      handleMenuEnter,
      handleFocus,
      blur,
      handleBlur,
      handleClearClick,
      handleClose,
      toggleMenu,
      selectOption,
      getValueKey,
      navigateOptions,
      dropMenuVisible,

      reference,
      input,
      tooltipRef,
      tags,
      selectWrapper,
      scrollbar,
      queryChange,
      groupQueryChange,
    } = useSelect(props, states, ctx)

    const { focus } = useFocus(reference)

    const {
      inputWidth,
      selected,
      inputLength,
      filteredOptionsCount,
      visible,
      softFocus,
      selectedLabel,
      hoverIndex,
      query,
      inputHovering,
      currentPlaceholder,
      menuVisibleOnFocus,
      isOnComposition,
      isSilentBlur,
      options,
      cachedOptions,
      optionsCount,
      prefixWidth,
      tagInMultiLine,
    } = toRefs(states)

    const wrapperKls = computed(() => {
      const classList = [nsSelect.b()]
      const _selectSize = unref(selectSize)
      if (_selectSize) {
        classList.push(nsSelect.m(_selectSize))
      }
      if (props.disabled) {
        classList.push(nsSelect.m('disabled'))
      }
      return classList
    })

    const selectTagsStyle = computed(() => ({
      maxWidth: `${unref(inputWidth) - 32}px`,
      width: '100%',
    }))

    provide(
      selectKey,
      reactive({
        props,
        options,
        optionsArray,
        cachedOptions,
        optionsCount,
        filteredOptionsCount,
        hoverIndex,
        handleOptionSelect,
        onOptionCreate,
        onOptionDestroy,
        selectWrapper,
        selected,
        setSelected,
        queryChange,
        groupQueryChange,
      }) as unknown as SelectContext
    )

    onMounted(() => {
      states.cachedPlaceHolder = currentPlaceholder.value =
        props.placeholder || t('el.select.placeholder')
      if (
        props.multiple &&
        Array.isArray(props.modelValue) &&
        props.modelValue.length > 0
      ) {
        currentPlaceholder.value = ''
      }
      addResizeListener(selectWrapper.value as any, handleResize)
      if (reference.value && reference.value.$el) {
        const sizeMap = {
          large: 36,
          default: 32,
          small: 28,
        }
        const input = reference.value.input as HTMLInputElement
        states.initialInputHeight =
          input.getBoundingClientRect().height || sizeMap[selectSize.value]
      }
      if (props.remote && props.multiple) {
        resetInputHeight()
      }
      nextTick(() => {
        if (!reference.value) return
        if (reference.value.$el) {
          inputWidth.value = reference.value.$el.getBoundingClientRect().width
        }
        if (ctx.slots.prefix) {
          const inputChildNodes = reference.value.$el.childNodes
          const input = (Array.from(inputChildNodes) as HTMLElement[]).find(
            (item) => item.tagName === 'INPUT'
          )
          const prefix = reference.value.$el.querySelector(
            `.${nsInput.e('prefix')}`
          )
          prefixWidth.value = Math.max(
            prefix.getBoundingClientRect().width + 5,
            30
          )
          if (states.prefixWidth) {
            input.style.paddingLeft = `${Math.max(states.prefixWidth, 30)}px`
          }
        }
      })
      setSelected()
    })

    onBeforeUnmount(() => {
      removeResizeListener(selectWrapper.value as any, handleResize)
    })

    if (props.multiple && !Array.isArray(props.modelValue)) {
      ctx.emit(UPDATE_MODEL_EVENT, [])
    }
    if (!props.multiple && Array.isArray(props.modelValue)) {
      ctx.emit(UPDATE_MODEL_EVENT, '')
    }

    const popperPaneRef = computed(() => {
      return tooltipRef.value?.popperRef?.contentRef
    })

    const { compatTeleported } = useDeprecateAppendToBody(
      COMPONENT_NAME,
      'popperAppendToBody'
    )

    return {
      tagInMultiLine,
      prefixWidth,
      selectSize,
      readonly,
      handleResize,
      collapseTagSize,
      debouncedOnInputChange,
      debouncedQueryChange,
      deletePrevTag,
      deleteTag,
      deleteSelected,
      handleOptionSelect,
      scrollToOption,
      inputWidth,
      selected,
      inputLength,
      filteredOptionsCount,
      visible,
      softFocus,
      selectedLabel,
      hoverIndex,
      query,
      inputHovering,
      currentPlaceholder,
      menuVisibleOnFocus,
      isOnComposition,
      isSilentBlur,
      options,
      resetInputHeight,
      managePlaceholder,
      showClose,
      selectDisabled,
      iconComponent,
      iconReverse,
      showNewOption,
      emptyText,
      toggleLastOptionHitState,
      resetInputState,
      handleComposition,
      handleMenuEnter,
      handleFocus,
      blur,
      handleBlur,
      handleClearClick,
      handleClose,
      toggleMenu,
      selectOption,
      getValueKey,
      navigateOptions,
      dropMenuVisible,
      focus,

      reference,
      input,
      tooltipRef,
      popperPaneRef,
      tags,
      selectWrapper,
      scrollbar,

      wrapperKls,
      selectTagsStyle,
      compatTeleported,
      nsSelect,
    }
  },
})
</script>

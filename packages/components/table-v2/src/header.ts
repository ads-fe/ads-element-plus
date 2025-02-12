import { buildProps, definePropType } from '@element-plus/utils'
import { columns } from './common'

import type { ExtractPropTypes } from 'vue'

const requiredNumberType = {
  type: Number,
  required: true,
} as const

export const tableV2HeaderProps = buildProps({
  class: String,
  columns,
  fixedHeaderData: {
    type: definePropType<any[]>(Array),
  },
  headerData: {
    type: definePropType<any[]>(Array),
    required: true,
  },
  headerHeight: {
    type: definePropType<number | number[]>([Number, Array]),
    required: true,
  },
  rowWidth: requiredNumberType,
  rowHeight: requiredNumberType,

  height: requiredNumberType,
  width: requiredNumberType,
} as const)

export type TableV2HeaderProps = ExtractPropTypes<typeof tableV2HeaderProps>

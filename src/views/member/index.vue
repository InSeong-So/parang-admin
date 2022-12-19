<script setup lang="ts">
import { tableDataMore } from './data';
import { PureTable } from '@pureadmin/table';

const props = withDefaults(
  defineProps<{
    height?: string;
  }>(),
  {
    height: null,
  },
);
const columns: TableColumnList = [
  {
    label: '사용자 ID',
    prop: 'user_uuid',
    width: '100',
    fixed: true,
  },
  {
    label: '등급',
    prop: 'level',
    width: '60',
  },
  {
    label: '점수',
    prop: 'total_score',
    width: '100',
  },
  {
    label: '마일리지',
    prop: 'usable_score',
    width: '260',
  },
  {
    label: '생성 시간',
    prop: 'create_at',
    width: '260',
  },
  {
    label: '수정 시간',
    prop: 'update_at',
    width: '260',
  },
  {
    label: '편집',
    width: '120',
    fixed: 'right',
    slot: 'operation',
  },
];
function handleClick(row) {
  console.log(
    '%crow===>>>: ',
    'color: MidnightBlue; background: Aquamarine; font-size: 20px;',
    row,
  );
}
</script>

<template>
  <pure-table
    :data="props.height ? tableDataMore.concat(tableDataMore).concat(tableDataMore) : tableDataMore"
    :columns="columns"
    :height="props.height"
  >
    <template #operation="{ row }">
      <el-button link type="primary" size="small" @click="handleClick(row)"> Detail </el-button>
      <el-button link type="primary" size="small">Edit</el-button>
    </template>
  </pure-table>
</template>

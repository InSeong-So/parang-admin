<script setup lang="ts">
import { tableDataMore } from './data';
import { PureTable } from '@pureadmin/table';

const props = withDefaults(defineProps<{ height?: string }>(), { height: null });

const columns: TableColumnList = [
  {
    label: '사용자 ID',
    prop: 'user_uuid',
    width: '100',
    fixed: true,
    slot: 'userId',
  },
  {
    label: '등급',
    prop: 'level',
    width: '100',
    slot: 'level',
  },
  {
    label: '점수',
    prop: 'total_score',
    width: '100',
    slot: 'totalScore',
  },
  {
    label: '마일리지',
    prop: 'usable_score',
    width: '260',
    slot: 'usableScore',
  },
  {
    label: '생성 시간',
    prop: 'create_at',
    width: '260',
    slot: 'createAt',
  },
  {
    label: '수정 시간',
    prop: 'update_at',
    width: '260',
    slot: 'updateAt',
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
    <template #userId="{ row }">
      <el-tag>{{ row.name }}</el-tag>
    </template>
    <template #level="{ row }">
      <el-tag>{{ row['post-code'] }}</el-tag>
    </template>
    <template #totalScore="{ row }">
      <el-tag>{{ row.city }}</el-tag>
    </template>
    <template #usableScore="{ row }">
      <el-tag>{{ row.address }}</el-tag>
    </template>
    <template #createAt="{ row }">
      <el-tag>{{ row.state }}</el-tag>
    </template>
    <template #updateAt="{ row }">
      <el-tag>{{ row.date }}</el-tag>
    </template>
    <template #operation="{ row }">
      <el-button link type="primary" size="small" @click="handleClick(row)"> Detail </el-button>
      <el-button link type="primary" size="small">Edit</el-button>
    </template>
  </pure-table>
</template>

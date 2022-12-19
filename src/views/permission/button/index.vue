<script setup lang="ts">
import { type CSSProperties, computed } from 'vue';
import { hasAuth, getAuths } from '@/router/utils';

defineOptions({
  name: 'PermissionButton',
});

const elStyle = computed((): CSSProperties => {
  return {
    width: '85vw',
    justifyContent: 'start',
  };
});
</script>

<template>
  <el-space direction="vertical" size="large">
    <el-tag :style="elStyle" size="large" effect="dark">
      현재 가지고 있는 code 목록: {{ getAuths() }}
    </el-tag>

    <el-card shadow="never" :style="elStyle">
      <template #header>
        <div class="card-header">컴포넌트 방식 판단 권한</div>
      </template>
      <Auth value="btn_add">
        <el-button type="success"> 코드: ['btn_add'] 권한 보유 </el-button>
      </Auth>
      <Auth :value="['btn_edit']">
        <el-button type="primary"> 코드: ['btn_edit'] 권한 보유 </el-button>
      </Auth>
      <Auth :value="['btn_add', 'btn_edit', 'btn_delete']">
        <el-button type="danger"> 코드: ['btn_add', 'btn_edit', 'btn_delete'] 권한 보유 </el-button>
      </Auth>
    </el-card>

    <el-card shadow="never" :style="elStyle">
      <template #header>
        <div class="card-header">함수 방식 판단 권한</div>
      </template>
      <el-button type="success" v-if="hasAuth('btn_add')"> 코드: ['btn_add'] 권한 보유 </el-button>
      <el-button type="primary" v-if="hasAuth(['btn_edit'])">
        코드: ['btn_edit'] 권한 보유
      </el-button>
      <el-button type="danger" v-if="hasAuth(['btn_add', 'btn_edit', 'btn_delete'])">
        코드: ['btn_add', 'btn_edit', 'btn_delete'] 권한 보유
      </el-button>
    </el-card>

    <el-card shadow="never" :style="elStyle">
      <template #header>
        <div class="card-header">명령 방식 판단 권한 (이 방식은 동적으로 수정할 수 없습니다)</div>
      </template>
      <el-button type="success" v-auth="'btn_add'"> 코드: ['btn_add'] 권한 보유 </el-button>
      <el-button type="primary" v-auth="['btn_edit']"> 코드: ['btn_edit'] 권한 보유 </el-button>
      <el-button type="danger" v-auth="['btn_add', 'btn_edit', 'btn_delete']">
        코드: ['btn_add', 'btn_edit', 'btn_delete'] 권한 보유
      </el-button>
    </el-card>
  </el-space>
</template>

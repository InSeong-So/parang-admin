<script setup lang="ts">
import { initRouter } from '@/router/utils';
import { type CSSProperties, ref, computed } from 'vue';
import { useUserStoreHook } from '@/store/modules/user';
import { usePermissionStoreHook } from '@/store/modules/permission';

defineOptions({
  name: 'PermissionPage',
});

const elStyle = computed((): CSSProperties => {
  return {
    width: '85vw',
    justifyContent: 'start',
  };
});

const email = ref(useUserStoreHook()?.email);

const options = [
  {
    value: 'admin',
    label: '관리자',
  },
  {
    value: 'common',
    label: '일반 유저',
  },
];

function onChange() {
  useUserStoreHook()
    .loginByemail({ email: email.value, password: 'admin123' })
    .then((res) => {
      if (res.success) {
        sessionStorage.removeItem('async-routes');
        usePermissionStoreHook().clearAllCachePage();
        initRouter();
      }
    });
}
</script>

<template>
  <el-space direction="vertical" size="large">
    <el-tag :style="elStyle" size="large" effect="dark">
      시뮬레이션 백그라운드 역할별 대응 라우팅(구체적으로 풀버전 pure-admin 코드 참조)
    </el-tag>
    <el-card shadow="never" :style="elStyle">
      <template #header>
        <div class="card-header">
          <span>현재 역할: {{ email }}</span>
        </div>
      </template>
      <el-select v-model="email" @change="onChange">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-card>
  </el-space>
</template>

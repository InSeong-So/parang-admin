<script setup lang="ts">
import Motion from './utils/motion';
import { useRouter } from 'vue-router';
import { message } from '@/utils/message';
import { loginRules } from './utils/rule';
import { initRouter } from '@/router/utils';
import { useNav } from '@/layout/hooks/useNav';
import type { FormInstance } from 'element-plus';
import { useLayout } from '@/layout/hooks/useLayout';
import { useUserStoreHook } from '@/store/modules/user';
import { bg, avatar, illustration } from './utils/static';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import { ref, reactive, toRaw, onMounted, onBeforeUnmount } from 'vue';
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange';

import dayIcon from '@/assets/svg/day.svg?component';
import darkIcon from '@/assets/svg/dark.svg?component';
import Lock from '@iconify-icons/ri/lock-fill';
import User from '@iconify-icons/ri/user-3-fill';

defineOptions({
  name: 'Login',
});
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title } = useNav();

const ruleForm = reactive({
  username: 'admin',
  password: 'admin123',
});

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername({ username: ruleForm.username, password: 'admin123' })
        .then((res) => {
          if (res.success) {
            // 백엔드 라우팅 가져오기
            initRouter().then(() => {
              router.push('/');
              message('로그인 성공!', { type: 'success' });
            });
          }
        });
    } else {
      loading.value = false;
      return fields;
    }
  });
};

/** 공통 함수를 사용하여, `removeEventListener` 무효를 무시. */
function onkeypress({ code }: KeyboardEvent) {
  if (code === 'Enter') {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener('keypress', onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener('keypress', onkeypress);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '아이디를 입력해주세요.',
                    trigger: 'blur',
                  },
                ]"
                prop="username"
              >
                <el-input
                  clearable
                  v-model="ruleForm.username"
                  placeholder="아이디"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  clearable
                  show-password
                  v-model="ruleForm.password"
                  placeholder="비밀번호"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                로그인
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('@/style/login.css');
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>

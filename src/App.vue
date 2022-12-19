<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ElConfigProvider } from 'element-plus';
import ko from 'element-plus/lib/locale/lang/ko';
export default defineComponent({
  name: 'app',
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
  },
  computed: {
    currentLocale() {
      return ko;
    },
  },
});
</script>

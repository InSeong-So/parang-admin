<script setup lang="ts">
import profile from '/profile.png';
import Search from './search/index.vue';
// import Notice from './notice/index.vue';
import mixNav from './sidebar/mixNav.vue';
import { useNav } from '@/layout/hooks/useNav';
import Breadcrumb from './sidebar/breadCrumb.vue';
import topCollapse from './sidebar/topCollapse.vue';
import LogoutCircleRLine from '@iconify-icons/ri/logout-circle-r-line';
import Setting from '@iconify-icons/ri/settings-3-line';

const { layout, device, logout, onPanel, pureApp, email, avatarsStyle, toggleSideBar } = useNav();
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0, 21, 41, 0.08)] dark:shadow-[#0d0d0d]">
    <topCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <Breadcrumb v-if="layout !== 'mix' && device !== 'mobile'" class="breadcrumb-container" />

    <mixNav v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <Search />
      <!-- <Notice id="header-notice" /> -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="profile" :style="avatarsStyle" />
          <p v-if="email" class="dark:text-white">{{ email }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
              <span>로그아웃</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span class="set-icon navbar-bg-hover" title="프로젝트 설정 열기" @click="onPanel">
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    line-height: 48px;
    height: 100%;
    float: left;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    min-width: 280px;
    height: 48px;
    align-items: center;
    color: #000000d9;
    justify-content: flex-end;

    .el-dropdown-link {
      height: 48px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      color: #000000d9;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  max-width: 130px;

  ::v-deep(.el-dropdown-menu__item) {
    padding: 10px;
    min-width: 100%;
    display: inline-flex;
    flex-wrap: wrap;

    span {
      padding: 0 5px;
    }
  }
}
</style>

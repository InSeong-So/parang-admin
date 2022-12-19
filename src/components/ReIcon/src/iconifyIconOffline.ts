import { h, defineComponent } from 'vue';
import { Icon as IconifyIcon, addIcon } from '@iconify/vue/dist/offline';

// Iconify Icon은 Vue에서 로컬로 사용 (인트라넷 환경용) https://docs.iconify.design/icon-components/vue/offline.html
export default defineComponent({
  name: 'IconifyIconOffline',
  components: { IconifyIcon },
  props: {
    icon: {
      default: null,
    },
  },
  render() {
    if (typeof this.icon === 'object') addIcon(this.icon, this.icon);
    const attrs = this.$attrs;
    return h(
      IconifyIcon,
      {
        icon: this.icon,
        style: attrs?.style ? Object.assign(attrs.style, { outline: 'none' }) : { outline: 'none' },
        ...attrs,
      },
      {
        default: () => [],
      },
    );
  },
});

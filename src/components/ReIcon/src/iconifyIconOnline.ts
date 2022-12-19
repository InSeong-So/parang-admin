import { h, defineComponent } from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue';

// Iconify Icon은 Vue에서 온라인으로 사용 (아웃바운드 환경에서 사용)
export default defineComponent({
  name: 'IconifyIconOnline',
  components: { IconifyIcon },
  props: {
    icon: {
      type: String,
      default: '',
    },
  },
  render() {
    const attrs = this.$attrs;
    return h(
      IconifyIcon,
      {
        icon: `${this.icon}`,
        style: attrs?.style ? Object.assign(attrs.style, { outline: 'none' }) : { outline: 'none' },
        ...attrs,
      },
      {
        default: () => [],
      },
    );
  },
});

import { h, defineComponent } from 'vue';

// iconfont 컴포넌트를 캡슐화하고, 기본 `font-class` 인용 모드를 지원하며, `unicode` 인용, `font-class` 인용, `symbol` 인용을 지원합니다. （https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.20&helptype=code）
export default defineComponent({
  name: 'FontIcon',
  props: {
    icon: {
      type: String,
      default: '',
    },
  },
  render() {
    const attrs = this.$attrs;
    if (Object.keys(attrs).includes('uni') || attrs?.iconType === 'uni') {
      return h(
        'i',
        {
          class: 'iconfont',
          ...attrs,
        },
        this.icon,
      );
    } else if (Object.keys(attrs).includes('svg') || attrs?.iconType === 'svg') {
      return h(
        'svg',
        {
          class: 'icon-svg',
          'aria-hidden': true,
        },
        {
          default: () => [
            h('use', {
              'xlink:href': `#${this.icon}`,
            }),
          ],
        },
      );
    } else {
      return h('i', {
        class: `iconfont ${this.icon}`,
        ...attrs,
      });
    }
  },
});

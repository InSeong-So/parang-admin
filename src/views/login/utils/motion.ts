import { h, defineComponent, withDirectives, resolveDirective } from 'vue';

/** 패키지 @vueuse/motion 애니메이션 라이브러리의 사용자 지정 명령 v-motion */
export default defineComponent({
  name: 'Motion',
  props: {
    delay: {
      type: Number,
      default: 50,
    },
  },
  render() {
    const { delay } = this;
    const motion = resolveDirective('motion');
    return withDirectives(
      h(
        'div',
        {},
        {
          default: () => [this.$slots.default()],
        },
      ),
      [
        [
          motion,
          {
            initial: { opacity: 0, y: 100 },
            enter: {
              opacity: 1,
              y: 0,
              transition: {
                delay,
              },
            },
          },
        ],
      ],
    );
  },
});

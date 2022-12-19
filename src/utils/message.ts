import { type VNode } from 'vue';
import { isFunction } from '@pureadmin/utils';
import { type MessageHandler, ElMessage } from 'element-plus';

type messageStyle = 'el' | 'antd';
type messageTypes = 'info' | 'success' | 'warning' | 'error';

interface MessageParams {
  /** 메시지 유형, 옵션 `info`, `success`, `warning`, `error`, 기본값 `info` */
  type?: messageTypes;
  /** 사용자 정의 아이콘, 이 속성은 `type` 아이콘을 덮어씁니다*/
  icon?: any;
  /** `message` 속성을 `HTML` 세션으로 처리할지 여부, 기본 `false` */
  dangerouslyUseHTMLString?: boolean;
  /** 메시지 스타일, 옵션 `el`, `antd`, 기본값 `antd` */
  customClass?: messageStyle;
  /** 시간 표시, 단위는 밀리초입니다.`0`으로 설정하면 자동으로 닫히지 않으며, `element-plus`는 기본 `3000`, 플랫폼은 기본 `2000`으로 변경*/
  duration?: number;
  /** 닫기 단추 표시 여부, 기본값 `false` */
  showClose?: boolean;
  /** 텍스트 중심 여부, 기본값 `false` */
  center?: boolean;
  /** `Message` 창 상단으로부터의 오프셋, 기본값 `20` */
  offset?: number;
  /** 구성 요소의 루트 요소 설정, 기본값 `document.body` */
  appendTo?: string | HTMLElement;
  /** 동일한 내용의 메시지를 병합하고, `VNode` 유형의 메시지를 지원하지 않으며, 기본값 `false` */
  grouping?: boolean;
  /** 종료 시 콜백 함수, 인자는 종료된 `message` 인스턴스 */
  onClose?: Function | null;
}

/** 사용법은 매우 간단합니다. src/views/components/message/index.vue 파일 참조*/

/**
 * `Message` 메시지 큐 함수
 */
const message = (
  message: string | VNode | (() => VNode),
  params?: MessageParams,
): MessageHandler => {
  if (!params) {
    return ElMessage({
      message,
      customClass: 'pure-message',
    });
  } else {
    const {
      icon,
      type = 'info',
      dangerouslyUseHTMLString = false,
      customClass = 'antd',
      duration = 2000,
      showClose = false,
      center = false,
      offset = 20,
      appendTo = document.body,
      grouping = false,
      onClose,
    } = params;

    return ElMessage({
      message,
      type,
      icon,
      dangerouslyUseHTMLString,
      duration,
      showClose,
      center,
      offset,
      appendTo,
      grouping,
      // 전역적으로 pure-message를 검색하면 이 클래스의 스타일 위치를 알 수 있습니다
      customClass: customClass === 'antd' ? 'pure-message' : '',
      onClose: () => (isFunction(onClose) ? onClose() : null),
    });
  }
};

/**
 * 메시지 프롬프트를 모두 닫습니다
 */
const closeAllMessage = (): void => ElMessage.closeAll();

export { message, closeAllMessage };

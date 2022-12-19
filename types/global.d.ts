import type {
  VNode,
  FunctionalComponent,
  PropType as VuePropType,
  ComponentPublicInstance
} from "vue";
import type { ECharts } from "echarts";
import type { IconifyIcon } from "@iconify/vue";
import type { TableColumns } from "@pureadmin/table";
import { type RouteComponent, type RouteLocationNormalized } from "vue-router";

/**
 * 전역 유형 선언. '.vue`, '.ts`, '.tsx` 파일에서 직접 사용할 필요 없이 유형 힌트를 얻을 수 있습니다
 */
declare global {
  /**
   * 플랫폼 이름, 버전, 의존성, 최종 구축 시간 유형 힌트
   */
  const __APP_INFO__: {
    pkg: {
      name: string;
      version: string;
      dependencies: Recordable<string>;
      devDependencies: Recordable<string>;
    };
    lastBuildTime: string;
  };

  /**
   * Window 의 타입 힌트
   */
  interface Window {
    // Global vue app instance
    __APP__: App<Element>;
    webkitCancelAnimationFrame: (handle: number) => void;
    mozCancelAnimationFrame: (handle: number) => void;
    oCancelAnimationFrame: (handle: number) => void;
    msCancelAnimationFrame: (handle: number) => void;
    webkitRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    mozRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    oRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    msRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  }

  /**
   * 압축된 형식의 선언을 패키징합니다.
   */
  type ViteCompression =
    | "none"
    | "gzip"
    | "brotli"
    | "both"
    | "gzip-clear"
    | "brotli-clear"
    | "both-clear";

  /**
   * 전역 사용자 지정 환경 변수의 유형 선언
   */
  interface ViteEnv {
    VITE_PORT: number;
    VITE_PUBLIC_PATH: string;
    VITE_ROUTER_HISTORY: string;
    VITE_CDN: boolean;
    VITE_COMPRESSION: ViteCompression;
  }

  /**
   *  `@pureadmin/table`의 `TableColumns`를 계승하여 전역적으로 직접 호출하기 편리함
   */
  interface TableColumnList extends Array<TableColumns> { }

  /**
   * `public/serverConfig.json` 파일에 대응하는 형식 선언
   */
  interface ServerConfigs {
    Version?: string;
    Title?: string;
    FixedHeader?: boolean;
    HiddenSideBar?: boolean;
    MultiTagsCache?: boolean;
    KeepAlive?: boolean;
    Locale?: string;
    Layout?: string;
    Theme?: string;
    DarkMode?: boolean;
    Grey?: boolean;
    Weak?: boolean;
    HideTabs?: boolean;
    SidebarStatus?: boolean;
    EpThemeColor?: string;
    ShowLogo?: boolean;
    ShowModel?: string;
    MenuArrowIconNoTransition?: boolean;
    CachingAsyncRoutes?: boolean;
    TooltipEffect?: Effect;
  }

  /**
   * `ServerConfigs` 형식과 달리 브라우저 로컬 스토리지에 캐싱하는 형식 선언입니다.
   */
  interface StorageConfigs {
    version?: string;
    title?: string;
    fixedHeader?: boolean;
    hiddenSideBar?: boolean;
    multiTagsCache?: boolean;
    keepAlive?: boolean;
    locale?: string;
    layout?: string;
    theme?: string;
    darkMode?: boolean;
    grey?: boolean;
    weak?: boolean;
    hideTabs?: boolean;
    sidebarStatus?: boolean;
    epThemeColor?: string;
    showLogo?: boolean;
    showModel?: string;
    username?: string;
  }

  /**
   * `responsive-storage` 로컬 응답형 `storage` 유형 선언
   */
  interface ResponsiveStorage {
    locale: {
      locale?: string;
    };
    layout: {
      layout?: string;
      theme?: string;
      darkMode?: boolean;
      sidebarStatus?: boolean;
      epThemeColor?: string;
    };
    configure: {
      grey?: boolean;
      weak?: boolean;
      hideTabs?: boolean;
      showLogo?: boolean;
      showModel?: string;
      multiTagsCache?: boolean;
    };
    tags?: Array<any>;
  }

  /**
   * `src/router` 폴더의 형식 선언
   */
  interface toRouteType extends RouteLocationNormalized {
    meta: {
      roles: Array<string>;
      keepAlive?: boolean;
      dynamicLevel?: string;
    };
  }

  /**
   * @description 전체 하위 라우팅 구성표
   */
  interface RouteChildrenConfigsTable {
    /** 하위 라우팅 주소 `필수 입력` */
    path: string;
    /** 라우팅 이름(반복하지 말고 현재 컴포넌트의 `name`과 일치) `필수 입력` */
    name?: string;
    /** 리다이렉트 `선택 사항` */
    redirect?: string;
    /** 필요에 따라 컴포넌트 로딩 `선택사항` */
    component?: RouteComponent;
    meta?: {
      /** 메뉴 이름(국제화, 비국제화 호환, 국제화 쓰기 방법은 루트 디렉토리의 `locales` 폴더에 대응하여 추가) `필수 입력` */
      title: string;
      /** 메뉴 아이콘 `선택사항` */
      icon?: string | FunctionalComponent | IconifyIcon;
      /** 메뉴 이름 오른쪽에 있는 추가 아이콘으로, `fontawesome`, `iconfont`, `element-plus-icon`을 지원한다. `선택사항` */
      extraIcon?: {
        svg?: boolean;
        name?: string;
      };
      /** 메뉴에 표시할 지 여부(기본값 `true`) `선택사항` */
      showLink?: boolean;
      /** 부모 메뉴 보이기 `선택사항` */
      showParent?: boolean;
      /** 페이지 수준 권한 설정 `선택사항` */
      roles?: Array<string>;
      /** 버튼 권한 설정 `선택사항` */
      auths?: Array<string>;
      /** 라우팅 컴포넌트 캐시(`true` 켜기, `false` 끄기) `선택사항` */
      keepAlive?: boolean;
      /** 내장된 `iframe` 링크 `선택사항` */
      frameSrc?: string;
      /** `iframe` 페이지에서 애니메이션을 처음 불러올지 여부(기본값 `true`) `선택사항` */
      frameLoading?: boolean;
      /** 페이지 로딩 애니메이션(vue에 내장된 `transitions` 애니메이션을 직접 사용하는 것과 `animate.css`를 사용하여 기입, 퇴장하는 두 가지 형식) `선택사항` */
      transition?: {
        /**
         * @description 현재 라우팅 애니메이션 효과
         * @see {@link https://next.router.vuejs.org/guide/advanced/transitions.html#transitions}
         * @see animate.css {@link https://animate.style}
         */
        name?: string;
        /** 진입 애니메이션 */
        enterTransition?: string;
        /** 진출 애니메이션 */
        leaveTransition?: string;
      };
      // 탭에 정보 추가 여부, (기본값 `false`)
      hiddenTag?: boolean;
      /** 동적 라우팅 레벨 `선택사항` */
      dynamicLevel?: number;
    };
    /** 하위 경로 설정 항목 */
    children?: Array<RouteChildrenConfigsTable>;
  }

  /**
   * @description 전체 라우팅 구성표(전체 하위 라우팅 포함)
   */
  interface RouteConfigsTable {
    /** 라우팅 주소 `필수 입력` */
    path: string;
    /** 라우팅 이름( 고유하게 유지) `선택사항` */
    name?: string;
    /** `Layout` 컴포넌트 `선택사항` */
    component?: RouteComponent;
    /** 리다이렉트 `선택사항` */
    redirect?: string;
    meta?: {
      /** 메뉴 이름(국제화, 비국제화 호환, 국제화 쓰기 방법은 루트 디렉토리의 `locales` 폴더에 대응하여 추가)   `필수 입력` */
      title: string;
      /** 메뉴 아이콘 `선택사항` */
      icon?: string | FunctionalComponent | IconifyIcon;
      /** 메뉴에 표시할 지 여부(기본값 `true`) `선택사항` */
      showLink?: boolean;
      /** 메뉴 오름차순으로 정렬, 값이 높을수록 뒤로 정렬 (최상위 라우팅만 해당) `선택사항` */
      rank?: number;
    };
    /** 하위 경로 설정 항목 */
    children?: Array<RouteChildrenConfigsTable>;
  }

  /**
   * 플랫폼의 모든 구성 요소 인스턴스에 액세스할 수 있는 전역 속성 개체 유형 선언
   */
  interface GlobalPropertiesApi {
    $echarts: ECharts;
    $storage: ResponsiveStorage;
    $config: ServerConfigs;
  }
}

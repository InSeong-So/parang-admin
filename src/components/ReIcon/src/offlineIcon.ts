import { addIcon } from '@iconify/vue/dist/offline';

/**
 * src/layout/index.vue 파일에 로컬 아이콘을 저장하여 첫 번째 시작에서 로드하지 않도록 합니다.
 */

// 로컬 메뉴 아이콘, 백엔드가 라우팅된 icon에서 해당 아이콘 문자열을 반환하고, 프론트엔드가 addIcon을 사용하여 추가할 경우 메뉴 아이콘을 렌더링합니다.
import HomeFilled from '@iconify-icons/ep/home-filled';
import InformationLine from '@iconify-icons/ri/information-line';
import Lollipop from '@iconify-icons/ep/lollipop';

addIcon('homeFilled', HomeFilled);
addIcon('informationLine', InformationLine);
addIcon('lollipop', Lollipop);

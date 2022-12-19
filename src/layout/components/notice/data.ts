export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: '' | 'success' | 'warning' | 'info' | 'danger';
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
}

export const noticesData: TabItem[] = [
  {
    key: '1',
    name: '알림',
    list: [
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
        title: '너는 12개의 새 주간지를 받았다.',
        datetime: '1년 전',
        description: '',
        type: '1',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
        title: '당신이 추천한 프런트 고수는 이미 3차 면접을 통과했습니다.',
        datetime: '1년 전',
        description: '',
        type: '1',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
        title: '这种模板可以区分多种通知类型',
        datetime: '1년 전',
        description: '',
        type: '1',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title:
          '제목 내용이 한 줄 이상이면 자동으로 잘리고 전체 제목을 표시할 수 있도록 tooltip을 지원합니다.',
        datetime: '1년 전',
        description: '',
        type: '1',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '왼쪽 아이콘은 다른 유형을 구분하는 데 사용됩니다.',
        datetime: '1년 전',
        description: '',
        type: '1',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '왼쪽 아이콘은 다른 유형을 구분하는 데 사용됩니다.',
        datetime: '1년 전',
        description: '',
        type: '1',
      },
    ],
  },
  {
    key: '2',
    name: '뉴스',
    list: [
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
        title: '인성님 댓글 달아주셨어요',
        description: '긴 바람과 파도는 때때로 구름 돛을 달고 바다를 건다.',
        datetime: '1년 전',
        type: '2',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
        title: '인성이가 답장했대',
        description: '가는 길이 어렵고, 기로가 많으니, 지금 안재하시다.',
        datetime: '1년 전',
        type: '2',
      },
      {
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
        title: '제목',
        description:
          '여기서 긴 메시지가 어떻게 처리되는지 테스트할 수 있도록 마우스를 여기로 이동하십시오.이 예에서 설정한 설명의 최대 행 수는 2개이며, 2개 이상의 행에 대한 설명은 생략되며, 전체 내용은 tooltip을 통해 볼 수 있습니다.',
        datetime: '1년 전',
        type: '2',
      },
    ],
  },
  {
    key: '3',
    name: '대행',
    list: [
      {
        avatar: '',
        title: '작업 이름',
        description: '작업은 2022-11-16 20:00 전에 시작해야 합니다',
        datetime: '',
        extra: '시작 안 함',
        status: 'info',
        type: '3',
      },
      {
        avatar: '',
        title: '제3자 긴급코드 변경',
        description: '흠냠냠 2022-11-16 제출, 2022-11-18까지 코드변경 완료',
        datetime: '',
        extra: '기한 임박',
        status: 'danger',
        type: '3',
      },
      {
        avatar: '',
        title: '정보보안 시험',
        description: '2022-12-12까지 업데이트 완료 및 게시',
        datetime: '',
        extra: '이미 8일이 걸렸다.',
        status: 'warning',
        type: '3',
      },
      {
        avatar: '',
        title: '신버전이 배포되었습니다.',
        description: '신버전이 배포되었습니다.',
        datetime: '',
        extra: '진행 중',
        type: '3',
      },
    ],
  },
];

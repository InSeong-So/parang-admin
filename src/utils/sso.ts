import { removeToken, setToken, type DataInfo } from './auth';
import { subBefore, getQueryMap } from '@pureadmin/utils';

/**
 * 간단한 SSO, 실제 업무에 따라 자체 작성
 * 요약 :
 * SSO인지 아닌지를 판단하여 그렇지 않으면 그대로 되돌아가서 프로세스도 처리 하지 않고, 맞다면 SSO 후의 로직 전개
 * 1. 로컬의 오래된 정보를 비웁니다.
 * 2. url에서 중요한 매개 변수 정보를 얻은 다음 setToken을 통해 로컬에 저장합니다.
 * 3.url에 표시할 필요가 없는 인자를 삭제합니다.
 * 4. window.location.replace를 사용하여 올바른 페이지로 이동
 */
(function () {
  // url에서 인자 가져오기
  const params = getQueryMap(location.href) as DataInfo<Date>;
  const must = ['username', 'roles', 'accessToken'];
  const mustLength = must.length;
  if (Object.keys(params).length !== mustLength) return;

  // url 파라미터가 must의 모든 값을 만족해야 SSO로 판정되며, SSO 이외의 경우 페이지 무한 루프 재호출을 방지합니다.
  let sso = [];
  let start = 0;

  while (start < mustLength) {
    if (Object.keys(params).includes(must[start]) && sso.length <= mustLength) {
      sso.push(must[start]);
    } else {
      sso = [];
    }
    start++;
  }

  if (sso.length === mustLength) {
    // SSO라면

    // 로컬 이전 정보 비우기
    removeToken();

    // 새 정보를 로컬로 저장
    setToken(params);

    // url에 표시할 필요가 없는 인자를 삭제합니다.
    delete params['roles'];
    delete params['accessToken'];

    const newUrl = `${location.origin}${location.pathname}${subBefore(
      location.hash,
      '?',
    )}?${JSON.stringify(params).replace(/["{}]/g, '').replace(/:/g, '=').replace(/,/g, '&')}`;

    // 기록 항목 바꾸기
    window.location.replace(newUrl);
  } else {
    return;
  }
})();

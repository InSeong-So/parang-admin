// 만약 항목에 `global is not defined` 에 오류가 있다면, 당신이 어떤 라이브러리를 도입한 문제일 수 있습니다. 예를 들어 aws-sdk-js https://github.com/aws/aws-sdk-js
// 해결책은 파일을 src/main.ts에 가져오는 것입니다. import "@/utils/globalPolyfills";
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

export {};

import { reactive } from 'vue';
import type { FormRules } from 'element-plus';

/** 비밀번호 정규(비밀번호 형식은 8-18자리 숫자, 문자의 두 가지 조합이어야 함) */
export const REGEXP_PWD =
  /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

/** 로그인 검사 */
const loginRules = reactive(<FormRules>{
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('비밀번호를 입력해 주세요.'));
        } else if (!REGEXP_PWD.test(value)) {
          callback(
            new Error('암호 형식은 8-18자리 숫자, 알파벳의 임의의 두 가지 조합이어야 합니다.'),
          );
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
});

export { loginRules };

# SmallLisp

브라우저 안에서 동작하는 작은 Lisp 인터프리터입니다. SimpleScheme의 VM/문법을 참고하여 **bytecode VM**으로 다시 작성했고, 외부 의존성 없이 단일 `index.html` 한 파일로 동작합니다.

🔗 데모: <http://www.chobocho.com/javascript/index.html>

## 빠른 시작

`index.html` 파일을 브라우저로 열기만 하면 됩니다. 빌드 단계 없음.

```sh
# 로컬에서 바로 열기
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

또는 가벼운 정적 서버:

```sh
python3 -m http.server 8001
# → http://localhost:8001
```

## 화면 구성

```
┌─ ▶️ Run | 🧹 | ♻️ | 📂 Pick a snippet… | 🏷️ Save | 🗑️ | 📤 Open | ⬇️ Download | 🔬 BC | 🌙 ─┐
│                                              📄 untitled  💾 saved   12.3 ms │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ ; SmallLisp           │  9                                                    │
│ (define pi 3)         │  4                                                    │
│ (if (= pi 3) ...)     │  16                                                   │
│ ...                   │  (1 4 9)                                              │
│                       │                                                       │
│  Source (Lisp)        │  Output                                               │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

| 아이콘 | 동작 |
| --- | --- |
| ▶️ Run | 코드 실행 (`Ctrl/Cmd+Enter`) |
| 🧹 | 소스 + 출력 + 상태 모두 비움 |
| ♻️ | 기본 예제로 리셋 |
| 📂 | 예제 / 저장된 스니펫 선택 (선택한 항목이 그대로 표시됨) |
| 🏷️ Save | IndexedDB에 이름 지정해 저장 (`Ctrl/Cmd+S`) |
| 🗑️ | 현재 활성 스니펫 삭제 |
| 📤 Open | 로컬 파일(.lisp/.scm/.smalllisp/.txt) 열기 |
| ⬇️ Download | 현재 소스를 `.lisp` 파일로 다운로드 |
| 🔬 BC | 컴파일된 바이트코드 디스어셈블리 표시 |
| 🌙 / ☀️ | 다크 ↔ 라이트 테마 토글 |

## 언어 기능

기존 Norvig lispy 기반 SmallLisp의 4개 형식(`+ - * /`, 비교, `define`, `if`, `lambda`)에서 다음으로 확장됐습니다:

- **특수 형식**: `quote` `if` `define` `set!` `lambda` `begin` `let` `let*` `and` `or` `cond` `when` `unless`
- **클로저**: 어휘 캡처 + `set!`을 통한 변경 가능한 캡처
- **꼬리 호출 최적화**: 200,000회 루프도 호스트 스택 안전
- **수치 타워**: BigInt 정수 + Number 실수 (혼합 연산 자동 승격)
- **가변 인자**: 점쌍 람다 리스트 — `(define (f . xs) ...)`, `(define (g a b . rest) ...)`
- **60+ 내장 함수**:
  - 산술/비교: `+ - * / // % modulo = < > <= >=`
  - 술어: `not zero? null? pair? list? number? integer? string? symbol? boolean? procedure?`
  - 리스트: `car cdr cons list length reverse append`
  - 고차: `map filter foldl for-each apply` (다중 리스트 `map` 지원)
  - 동등: `eq? equal?`
  - I/O: `display write newline print` (출력 패널로 직접 출력)
  - 문자열: `string-length string-append string-split string-join string-contains? string-replace substring`
  - 변환: `number->string string->number symbol->string string->symbol`
  - 수학: `min max abs expt sqrt floor ceiling round exact->inexact inexact->exact`

```scheme
(define (fact n)
  (if (<= n 1) 1 (* n (fact (- n 1)))))

(fact 100)
;=> 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000

(define (make-counter)
  (let ((n 0))
    (lambda ()
      (set! n (+ n 1))
      n)))

(define c (make-counter))
(c) (c) (c)   ;=> 3
```

## 파일 입출력 & 영속화

| 기능 | 구현 |
| --- | --- |
| 📤 **Open** | 숨겨진 `<input type="file">` + `FileReader`로 로컬 파일을 편집기에 로드. 파일명이 자동 문서명으로 |
| ⬇️ **Download** | 현재 소스를 `Blob` + `URL.createObjectURL`로 `.lisp` 파일 다운로드 |
| 🏷️ **Save** | `IndexedDB`(`smalllisp.snippets` 객체 저장소, `keyPath: "name"`)에 이름 지정해 저장 |
| 📂 **Load** | 드롭다운에서 📚 Examples / 💾 Saved 선택 |
| 🗑️ **Delete** | 현재 활성 스니펫 삭제 (확인 프롬프트) |
| 자동저장 | 입력 시 500ms 디바운스 → `__autosave__` 키. 새로고침 시 그대로 복원, `beforeunload`에서 마지막 키 입력까지 플러시 |

저장된 스니펫이 로드되면 드롭다운이 그대로 그 항목을 표시해서 무엇이 열려있는지 시각적으로 확인할 수 있습니다. 편집기를 수정하기 시작하면 드롭다운이 placeholder로 돌아갑니다.

## 단축키

| 키 | 동작 |
| --- | --- |
| `Ctrl/Cmd+Enter` | 실행 |
| `Ctrl/Cmd+S` | Save As (IndexedDB) |
| `Tab` | 2 스페이스 들여쓰기 |

## 테마

🌙 다크 / ☀️ 라이트 테마 토글. 선택값은 `localStorage["smalllisp.theme"]`에 영속화되며, 첫 방문은 OS의 `prefers-color-scheme`을 자동 감지합니다.

## 아키텍처 (SimpleScheme 포팅)

```
source ──► Lexer ──► Parser ──► Compiler (FunctionProto) ──► VM (stack machine)
```

| 컴포넌트 | 역할 |
| --- | --- |
| `Lexer` | 숫자, 문자열(이스케이프), 불리언, 심볼, `'` `` ` `` `,` `,@` `.`, 주석 |
| `Parser` | 태그된 값(`Nil`/`Bool`/`IntV`/`FloatV`/`StrV`/`Sym`/`Pair`)으로 AST 생성, 심볼 인터닝 |
| `Compiler` | AST → `FunctionProto` (bytecode + consts + 파라미터/로컬/upvalue 메타데이터). 부모→자식 upvalue 체인으로 클로저 캡처 |
| `VM` | 22-opcode 스택 머신. `OP_TAIL_CALL`이 현재 프레임을 재사용하여 호스트 JS 스택을 보호 |

### 바이트코드 명령어 (22개)

```
NOP  LOAD_CONST  LOAD_NIL  LOAD_TRUE  LOAD_FALSE
LOAD_LOCAL  STORE_LOCAL
LOAD_GLOBAL  DEFINE_GLOBAL  STORE_GLOBAL
LOAD_UPVALUE  STORE_UPVALUE
POP  DUP  JUMP  JUMP_IF_FALSE  JUMP_IF_TRUE
CALL  TAIL_CALL  RETURN  MAKE_CLOSURE  HALT
```

`🔬 BC` 토글을 켜면 컴파일 결과를 사람이 읽을 수 있는 형태로 출력 패널 상단에 보여줍니다.

## 검증

페이지 로드 시 자동으로 19개의 인라인 self-test를 실행합니다 (성공 시 무음, 실패 시 `console.warn`).

추가로 검증된 동작:
- 클로저 (counter, 공유 환경 read/write)
- BigInt: `(fact 100)` 정확
- 깊은 꼬리 재귀 (200,000회)
- 상호 꼬리 재귀 (50,000회)
- `apply`, 다중 리스트 `map`
- 가변 인자, `cond`/`when`/`unless`, `let*`
- 문자열 연산, 수치 승격

## 호환성

- 외부 의존성 0개 — 단일 `index.html` (~78 KB)
- BigInt를 지원하는 모든 모던 브라우저 (Chrome 67+, Firefox 68+, Safari 14+, Edge 79+)
- 원본 README의 모든 예제(`(define pi 3)`, `(twice 2)`, `(forth 2)`, `(fact 16)`, `(fact (forth 2))`)가 그대로 동작

## 참고

- Peter Norvig, *(How to Write a (Lisp) Interpreter (in Python))* — <https://norvig.com/lispy.html>
- VM/문법 레퍼런스: [chobocho/SimpleScheme](https://github.com/chobocho/SimpleScheme)

## 라이선스

이 프로젝트의 라이선스는 저장소를 따릅니다.

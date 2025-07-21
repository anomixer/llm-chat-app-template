# LLM 챗봇 애플리케이션 템플릿

Cloudflare Workers AI 기반의 간단하고 즉시 배포 가능한 챗봇 애플리케이션 템플릿입니다. 이 템플릿은 스트리밍 응답을 지원하는 AI 챗봇을 빠르게 구축할 수 있는 출발점을 제공합니다.

[![Cloudflare에 배포](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/llm-chat-app-template)

<!-- dash-content-start -->

### 데모

이 템플릿은 Cloudflare Workers AI를 활용한 스트리밍 응답 지원 챗봇 인터페이스 구축 방법을 보여줍니다. 주요 특징:

- Server-Sent Events (SSE)로 AI 응답 실시간 스트리밍
- 모델 및 시스템 프롬프트 손쉬운 커스터마이즈
- AI Gateway 연동 지원
- 모바일/데스크톱 모두 대응하는 깔끔한 UI

### 특징

- 💬 심플하고 반응형 챗 UI
- ⚡ SSE 기반 스트리밍 응답
- 🧠 Cloudflare Workers AI LLM 탑재
- 🛠️ TypeScript와 Cloudflare Workers로 개발
- 📱 모바일 친화적 디자인
- 🔄 클라이언트에서 채팅 기록 유지
<!-- dash-content-end -->

### 시작하기

#### 사전 준비

- [Node.js](https://nodejs.org/) (v18 이상)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Workers AI 권한이 있는 Cloudflare 계정

#### 설치

1. 저장소 클론:

   ```bash
   git clone https://github.com/cloudflare/templates.git
   cd templates/llm-chat-app
   ```

2. 의존성 설치:

   ```bash
   npm install
   ```

3. Worker 타입 정의 생성:
   ```bash
   npm run cf-typegen
   ```

#### 개발

로컬 개발 서버 실행:

```bash
npm run dev
```

http://localhost:8787 에서 서버가 시작됩니다.

참고: 로컬 개발 중에도 Workers AI 사용 시 Cloudflare 계정에 요금이 부과될 수 있습니다.

#### 배포

Cloudflare Workers에 배포:

```bash
npm run deploy
```

### 프로젝트 구조

```
/
├── public/             # 정적 자산
│   ├── index.html      # 챗 UI HTML
│   └── chat.js         # 프론트엔드 스크립트
├── src/
│   ├── index.ts        # Worker 엔트리 포인트
│   └── types.ts        # TypeScript 타입 정의
├── test/               # 테스트 파일
├── wrangler.jsonc      # Cloudflare Worker 설정
├── tsconfig.json       # TypeScript 설정
└── README.md           # 이 문서
```

### 동작 원리

#### 백엔드

백엔드는 Cloudflare Workers로 구축되며, Workers AI 플랫폼을 통해 응답을 생성합니다. 주요 구성 요소:

1. **API 엔드포인트** (`/api/chat`): POST 요청을 받아 응답을 스트리밍
2. **스트리밍**: SSE로 AI 응답 실시간 전송
3. **Workers AI 바인딩**: Cloudflare AI 서비스와 연동

#### 프론트엔드

프론트엔드는 심플한 HTML/CSS/JavaScript 애플리케이션입니다:

1. 챗 인터페이스 제공
2. 사용자 메시지를 API로 전송
3. 스트리밍 응답 실시간 처리
4. 클라이언트에서 채팅 기록 유지

### 커스터마이즈

#### 모델 변경

AI 모델을 변경하려면 `src/index.ts`의 `MODEL_ID` 상수를 수정하세요. 사용 가능한 모델은 [Cloudflare Workers AI 문서](https://developers.cloudflare.com/workers-ai/models/)를 참고하세요.

#### AI Gateway 사용

이 템플릿에는 AI Gateway 연동 주석 코드가 포함되어 있습니다. 트래픽 제어, 캐시, 분석 등 다양한 기능을 제공합니다.

활성화 방법:

1. Cloudflare 대시보드에서 AI Gateway 생성
2. `src/index.ts`의 gateway 설정 주석 해제
3. `YOUR_GATEWAY_ID`를 실제 Gateway ID로 교체
4. 필요에 따라 기타 옵션 설정

자세한 내용은 [AI Gateway 문서](https://developers.cloudflare.com/ai-gateway/) 참고.

#### 시스템 프롬프트 수정

`src/index.ts`의 `SYSTEM_PROMPT` 상수를 수정하세요.

#### 스타일 조정

UI 스타일은 `public/index.html`의 `<style>` 섹션에 정의되어 있습니다. CSS 변수로 색상 테마를 쉽게 변경할 수 있습니다.

### 참고 자료

- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI 문서](https://developers.cloudflare.com/workers-ai/)
- [Workers AI 모델](https://developers.cloudflare.com/workers-ai/models/) 
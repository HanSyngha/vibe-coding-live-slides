# 바이브 코딩 개론 · Live Slides

아하슬라이드 스타일의 **실시간 질문/반응형 강의 슬라이드**. 청중은 강사가 넘기는
슬라이드를 그대로 따라가고(잠김), 질문을 올리면 화면에 뽀잉 떠오르고, 👍/🤔 반응을 누를 수 있다.

의존성 0 (순수 Node `http` + SSE). 단일 컨테이너, 단일 replica.

## 로컬 실행

의존성 설치도 빌드도 없다. Node만 있으면 된다.

```bash
node server.js        # http://localhost:8080
# 강사 키를 바꾸려면:  PRESENT_KEY=mykey PORT=8080 node server.js
```

- **청중**: `http://localhost:8080/` — 첫 접속 시 닉네임/아바타 설정, 슬라이드 잠김
- **강사**: `http://localhost:8080/present` — 키 입력 프롬프트가 뜬다 (기본 `change-me`)
  - 또는 바로: `http://localhost:8080/present/change-me` · `http://localhost:8080/?present=change-me`

강사는 ← → (또는 Space)로 슬라이드를 넘기고, 청중은 잠금 상태로 따라온다.
강사 키는 기본 `change-me` (서버 `PRESENT_KEY` 환경변수로 변경).

## NAS 배포

Docker Compose로 단일 컨테이너를 띄운다. 라이브 상태가 프로세스 메모리에 있으므로
replica는 1개만 사용한다.

```bash
PRESENT_KEY=<강사키> HOST_PORT=7007 docker compose up -d --build
```

- **수강생**: `http://<host>:7007/`
- **강사**: `http://<host>:7007/present`

DSM Reverse Proxy로 HTTPS를 붙일 경우 외부 `https://*:7007`을 이 컨테이너의
HTTP 포트로 연결한다.

## 전체 소스 받기

실행 중인 서버에서 라이브 코드 그대로 tar.gz로 받을 수 있다:

```bash
curl -o slides.tar.gz http://<host>:8080/source
mkdir vibe-slides && tar xzf slides.tar.gz -C vibe-slides
cd vibe-slides && node server.js        # → http://localhost:8080
```

## 동작 요약

| 기능 | 구현 |
|---|---|
| 실시간 동기화 | SSE (`/events`) 브로드캐스트 |
| 슬라이드 잠금 | 청중은 넘김 비활성, `/slide`는 강사 키로만 |
| 지각 입장 싱크 | 접속 시 `snapshot`으로 현재 슬라이드+질문+반응 수신 |
| 질문 뽀잉 | `/questions` POST → `question` 이벤트 → 화면에 버블 |
| 질문 추천 | 버블의 👍 → `/questions/vote` |
| 반응 | `/react` (up/confused) → 떠오르는 이모지 + 상단 카운터 |
| 닉네임 | 첫 접속 모달, localStorage 저장 |

## forge 배포

`.forge-config.yml`의 `<tenant>`/`<project>`를 LaunchPad 값으로 채운 뒤:

```bash
mlptk forge repo validate
git push        # feature branch → sandbox
```

배포되면 `https://live-slides.<env>.forge.<domain>` 로 공개됨. 그 URL을 청중에게 공유.

> ⚠️ **replicas는 반드시 1**. 상태가 인메모리 + SSE라서 2개 이상이면 청중이
> 파드별로 갈려서 질문/반응이 어긋난다. 수백 명+영구저장이 필요해지면 Redis pub/sub 도입.

## 구조

```
live-slides/
├── server.js              # SSE + REST, 인메모리 상태, 강사 키 가드
├── public/
│   ├── index.html         # 셸
│   ├── styles.css         # 글래스모피즘 + 애니메이션 테마
│   ├── slides.js          # 슬라이드 정의 (SVG 도식 위주, 글자 최소)
│   └── app.js             # SSE 클라이언트, 모드 분기, 뽀잉/반응
├── Dockerfile
└── .forge-config.yml
```

슬라이드 내용 수정은 `public/slides.js`만 고치면 된다.

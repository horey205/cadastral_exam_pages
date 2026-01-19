# SurveyingExam (측량및지형공간정보산업기사 기출정복)

측량및지형공간정보산업기사 자격증 취득을 위한 기출문제 풀이 시스템입니다.

## 주요 기능
- 과목별 기출문제 풀이 (측량학, 사진측량 및 원격탐사, 지리정보시스템, 응용측량 등)
- 실시간 정답 확인 및 해설 제공
- 반응형 웹 디자인 (모바일 지원)
- 다크 모드 지원 및 세련된 UI

## 프로젝트 구조
- `index.html`, `style.css`, `script.js`: 웹 애플리케이션 프론트엔드
- `questions.js`: 문제 데이터 (JSON 형식 포함)
- `data/`: 원본 기출문제 JSON 데이터
- `tools/`: 데이터 수집(Scraper) 및 가공 도구
- `setup_survey_app.py`: 데이터를 병합하여 웹 앱용 파일을 생성하는 스크립트

## 서비스 주소
이 프로젝트는 다음 주소에서 직접 이용하실 수 있습니다:
[https://horey205.github.io/cadastral_exam_pages/surveying_exam/](https://horey205.github.io/cadastral_exam_pages/surveying_exam/)

## 시작하기
- **웹에서 바로 실행:** 위의 서비스 주소로 접속하세요.
- **로컬에서 실행:** `index.html` 파일을 브라우저에서 열면 바로 실행 가능합니다.
(로그인이 필요한 경우 ID: `user`, PW: `user2685`를 사용하세요.)

## 데이터 업데이트 방법
1. `data/` 폴더에 새로운 기출문제 JSON 파일을 추가합니다.
2. `python setup_survey_app.py`를 실행하여 `questions.js`를 갱신합니다.
3. `index.html`을 새로고침하여 확인합니다.

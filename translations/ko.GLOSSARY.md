# 한국어(ko) 번역 용어집 · 결정 기록

> 이 문서는 **판단 근거를 남기는 곳**이다. 전체 키 목록은 `translations/ko.jsonc`에 있으므로
> 여기에 다시 옮겨 적지 않는다. 여기에는 **결정이 필요했던 것만** 기록한다.
>
> 원칙: 정발판 텍스트를 통째로 옮겨 적지 말 것. 용어 대응과 판정 근거만 남긴다.

---

## 0. 저본 (Source of truth)

| 구분 | 저본 | 비고 |
|---|---|---|
| 게임 용어 (역할·사건·플롯·참극세트·캐릭터·카운터) | **MTS 게임즈 정식 한국어판 (2022)** | 크라우드펀딩 발매. 일본어 5th 기준 |
| 정발 미수록 항목 | 일본어 원문 → 영어판 순 | 팬 확장, WizKids 신규 요소 등 |
| UI 문자열 | 자유 번역 | 정발 무관 |
| 각본 스토리·지침 | 일본어 원문 있으면 원문, 없으면 영어 | 각본별로 §5에 기록 |

**중요한 전제:** 이 사이트의 원문 키는 **Z-Man / WizKids 영어판** 기준이고,
정발판은 **일본어 5th** 기준이다. 두 계보가 다르므로 1:1로 안 맞는 지점이 반드시 생긴다.
`ko.jsonc`의 `// ja:` 주석이 정발 용어 추정에 가장 유용하지만, **반드시 실물 대조 후 확정**한다.

### 정발 수록 범위 (확인 필요)

MTS 한국어판은 스트레치 골 달성으로 대부분의 확장이 포함되었다고 알려져 있다.
아래 표는 저장소의 `data/` 폴더와 정발 확장의 대응 추정이다. **실물로 검증할 것.**

| `data/` 폴더 | 영어명 | 정발 추정명 | 확인 |
|---|---|---|---|
| `base-game` | Basic Tragedy | 기본 세트 | ☐ |
| `midnight-circle` | Midnight Zone | 미드나이트 존 | ☐ |
| `cosmic-evil` | Cosmic Mythology | 위어드 미솔로지 | ☐ |
| `haunted-stage` | Prime Evil | 헌티드 스테이지 | ☐ |
| — | Mystery Circle | 미스터리 서클 | ☐ |
| `script-collection-2` | Script Collection 2 | 시나리오 모음집 2 | ☐ |
| `another-horizon` | Another Horizon | 정발 여부 불명 | ☐ |
| `last-liar` / `rei` / `supernatural` / `visual-novel` | 팬/기타 | 정발 없음 → 자체 번역 | ☐ |
| `sangeki` / `tragedylooperscripts` | 팬 각본 모음 | 정발 없음 → 자체 번역 | ☐ |

---

## 1. 확신도 등급

모든 결정에 등급을 붙인다. 등급이 `미정`이면 **`ko.jsonc`에 값을 넣지 않는다.**
빈 값은 영어로 폴백되므로, 틀린 한국어보다 안전하고 나중에 다시 찾기도 쉽다.

| 등급 | 뜻 | ko.jsonc 반영 |
|---|---|---|
| `확정` | 정발 실물(카드·요약시트·룰북)에서 직접 확인 | ✅ 반영 |
| `추정` | 커뮤니티 통용 표기 / 일본어 원문에서 유추 | ⚠️ 반영하되 여기 기록 |
| `자체` | 정발에 없는 항목, 우리가 만든 번역 | ✅ 반영 |
| `미정` | 근거 부족 | ❌ 비워둘 것 |

---

## 2. 핵심 용어 대응표

정발 실물을 확인하면서 채운다. `ja` 열은 `ko.jsonc` 주석에서 가져온 참고값이다.

### 2.1 기본 개념

| 영문 키 (원문) | ja 참고 | 정발 용어 | 등급 | 출처 · 비고 |
|---|---|---|---|---|
| `Mastermind` | 脚本家 | 각본가 | 확정 | 정발 확인 (사용자, 2026-07-22). 사이트에선 아이콘 렌더링 — ko.jsonc 반영 안 함 |
| `Protagonists` | 主人公 | 주인공 | 확정 | 정발 확인 (사용자, 2026-07-22). 사이트에선 아이콘 렌더링 — ko.jsonc 반영 안 함 |
| `Script` | 脚本 | 시나리오 | 확정 | 정발 설명서 대조로 정정 (2026-07-23, 사용자 승인). 설명서 전 구간 '시나리오' — '각본'은 '각본가'에만 사용 |
| `Loop` | ループ | 루프 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `Paranoia` | 不安 | 불안 | 확정 | 카운터. 정발 확인 (사용자, 2026-07-22). 사이트에선 아이콘 렌더링 — ko.jsonc 반영 안 함 |
| `Goodwill` | 友好 | 우호 | 확정 | 카운터. 정발 확인 (사용자, 2026-07-22) |
| `Intrigue` | 暗躍 | 음모 | 확정 | 카운터. 정발 확인 (사용자, 2026-07-22). ja 暗躍의 직역(암약)이 아님에 주의 |
| `Paranoia limit` | 不安限度 | 최대 불안 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `Final Guess` | 最終決戦 | 최후의 싸움 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Incident` | 事件 | 사건 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `Culprit` | 犯人 | 범인 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `Role` | 役職 | 역할 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Tragedy Set` | 惨劇セット | 참극 세트 | 확정 | 정발 확인 (사용자, 2026-07-23) |

### 2.2 역할 (Roles)

| 영문 키 | ja 참고 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|---|
| `Brain` | クロマク | 흑막 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Key Person` | キーパーソン | 핵심 인물 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Killer` | キラー | 살인 청부업자 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Serial Killer` | シリアルキラー | 연쇄 살인마 | 확정 | 정발 확인 (사용자, 2026-07-23). 띄어쓰기 포함 |
| `Cultist` | カルティスト | 광신도 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Time Traveler` | | 시간 여행자 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| … | | | | 전체 목록은 §2.5 일괄 대조 기록 참조 |

### 2.3 장소 (Locations)

| 영문 키 | ja 참고 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|---|
| `Shrine` | 神社 | 신사 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `School` | 学校 | 학교 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `Hospital` | 病院 | 병원 | 확정 | 정발 확인 (사용자, 2026-07-22) |
| `City` | 都市 | 도심 | 확정 | 정발 확인 (사용자, 2026-07-22). 都市의 직역(도시)이 아니라 '도심'임에 주의 |

> 나머지 카테고리(사건 80 / 플롯 126 / 캐릭터 40 / 키워드·태그 10)는
> 결정이 갈린 항목만 아래 §3에 기록하고, 단순 확정 항목은 `ko.jsonc`에 바로 넣는다.

### 2.5 일괄 대조 기록 — 2026-07-23 사용자 입력

> 출처: 정발판 실물 대조(확정) / 미정발 세트는 Tabletop Simulator 유저 번역 참고(자체).
> 대조표(xlsx) 일괄 입력분. 개별 이슈는 §3.3에 기록.

**핵심 개념** (11개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `Mastermind` | 각본가 | 확정 | 사이트에선 아이콘 렌더링 — 표기 통일 참고용 |
| `Protagonists` | 주인공 | 확정 | 사이트에선 아이콘 렌더링 — 표기 통일 참고용 |
| `Script` | 시나리오 | 확정 | 2026-07-23 설명서 대조로 각본→시나리오 정정 |
| `Loop` | 루프 | 확정 |  |
| `Paranoia` | 불안 | 확정 | 카운터. 사이트에선 아이콘 렌더링 |
| `Goodwill` | 우호 | 확정 | 카운터 |
| `Intrigue` | 음모 | 확정 | 카운터. 직역(암약) 아님 |
| `Paranoia limit` | 최대 불안 | 확정 |  |
| `Final Guess` | 최후의 싸움 | 확정 |  |
| `Role` | 역할 | 확정 |  |
| `Tragedy Set` | 참극 세트 | 확정 |  |

**역할** (55개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `Fool` | 바보 | 확정 |  |
| `Twin` | 쌍둥이 | 확정 |  |
| `Alice` | 앨리스 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Brain` | 흑막 | 확정 |  |
| `Ghost` | 유령 | 확정 |  |
| `Lover` | 연인B | 확정 |  |
| `Ninja` | 닌자 | 확정 |  |
| `Witch` | 마녀 | 확정 |  |
| `Coward` | 겁쟁이 | 확정 |  |
| `Factor` | 변수 | 확정 |  |
| `Friend` | 친구 | 확정 |  |
| `Killer` | 살인 청부업자 | 확정 |  |
| `Person` | 엑스트라 | 확정 |  |
| `Wizard` | 마법사 | 확정 |  |
| `Zombie` | 좀비 | 확정 |  |
| `Cultist` | 광신도 | 확정 |  |
| `Lullaby` | 동화 구연가 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Prophet` | 예언자 | 확정 |  |
| `Shifter` | 차원 여행자 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Vampire` | 뱀파이어 | 확정 |  |
| `Watcher` | 감시자 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Witness` | 목격자 | 확정 |  |
| `Agitator` | 사회 운동가 | 자체 | 정발 확정 `Conspiracy Theorist`=선동가와 충돌하여 개명 — §3.3 참조 |
| `Deep One` | 심해인 | 확정 |  |
| `Faceless` | 얼굴 없는 자 | 확정 |  |
| `Fragment` | 세계의 조각 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Gossiper` | 수다쟁이 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Immortal` | 불멸자 | 확정 |  |
| `Magician` | 마술사 | 확정 |  |
| `Poisoner` | 바리스타 | 확정 |  |
| `Show-Off` | 허당 | 확정 |  |
| `Werewolf` | 늑대 인간 | 확정 |  |
| `Wildcard` | 조커 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Loved One` | 연인A | 확정 |  |
| `Nightmare` | 악몽 | 확정 |  |
| `Obstinate` | 절대자 | 확정 |  |
| `Paranoiac` | 편집증 환자 | 확정 |  |
| `Sacrifice` | 인간 제물 | 확정 |  |
| `Therapist` | 심리 치료사 | 확정 |  |
| `Curmudgeon` | 골칫거리 | 확정 |  |
| `Influencer` | 인플루언서 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Key Person` | 핵심 인물 | 확정 |  |
| `Marionette` | 꼭두각시 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Pied Piper` | 피리 부는 사나이 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Storyteller` | 이야기꾼 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Secretkeeper` | 비밀 요원 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Serial Killer` | 연쇄 살인마 | 확정 |  |
| `Time Traveler` | 시간 여행자 | 확정 |  |
| `Conspiracy Theorist` | 선동가 | 확정 |  |
| `Private Investigator` | 명탐정 | 확정 |  |
| `Ghost (Haunted Stage)` | 유령 (Haunted Stage) | 자체 | 구버전 역할 |
| `Zombie (Haunted Stage)` | 좀비 (Haunted Stage) | 자체 | 구버전 역할 |
| `Vampire (Haunted Stage)` | 뱀파이어 (Haunted Stage) | 자체 | 구버전 역할 |
| `Werewolf (Haunted Stage)` | 늑대 인간 (Haunted Stage) | 자체 | 구버전 역할 |
| `Nightmare (Haunted Stage)` | 악몽 (Haunted Stage) | 자체 | 구버전 역할 |

**사건** (47개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `Murder` | 살인 사건 | 확정 |  |
| `Uproar` | 대폭동 | 확정 |  |
| `Portent` | 전조 | 확정 |  |
| `Suicide` | 자살 | 확정 |  |
| `Barricade` | 농성 | 확정 |  |
| `Discovery` | 발견 | 확정 |  |
| `Foul Evil` | 사악한 기운의 오염 | 확정 |  |
| `Last Will` | 유언 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Spreading` | 유포 | 확정 |  |
| `Terrorism` | 테러리즘 | 확정 |  |
| `Confession` | 고백 | 확정 |  |
| `Dark Rumor` | 소문의 저주 | 확정 |  |
| `Distortion` | 표변 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Left Behind` | 분실물 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Breakthrough` | 타개 | 확정 |  |
| `Conspiracies` | 음모 공작 | 확정 |  |
| `Mass Suicide` | 집단 자살 | 확정 |  |
| `Closed Circle` | 클로즈드 서클 | 확정 |  |
| `Fake Incident` | 위장 사건 | 확정 |  |
| `Faked Suicide` | 위장 자살 | 확정 |  |
| `Insane Murder` | 광기의 살인 | 확정 |  |
| `Serial Murder` | 연속 살인 | 확정 |  |
| `Awakened Curse` | 저주의 각성 | 확정 |  |
| `Bestial Murder` | 엽기 살인 | 확정 |  |
| `Faraway Murder` | 원격 살인 | 확정 |  |
| `Fire of Demise` | 멸망의 불 | 확정 |  |
| `Missing Person` | 행방불명 | 확정 |  |
| `Hound Dog Scent` | 사냥개의 후각 | 확정 |  |
| `The Executioner` | 수행자 | 확정 |  |
| `The Singularity` | 특이점 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Butterfly Effect` | 나비의 날갯짓 | 확정 |  |
| `Crime of Passion` | 충동적 살인 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Night of Madness` | 광기의 밤 | 확정 |  |
| `Seeping Daylight` | 틈새로 비친 햇살 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Fountain of Filth` | 추악함의 분출 | 확정 |  |
| `Hospital Incident` | 병원 사건 | 확정 |  |
| `Increasing Unease` | 불안 확대 | 확정 |  |
| `The Light of Hope` | 희망의 빛 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The Silver Bullet` | 은 총탄 | 확정 |  |
| `A Suspicious Letter` | 수상한 편지 | 확정 |  |
| `Phantasmal Incident` | 공상 사건 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Sacrilegious Murder` | 모독 살인 | 확정 |  |
| `The Murk of Despair` | 절망의 어둠 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Dimensional Fracture` | 차원 단층 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Dimensional Distortion` | 차원 변모 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Dimensional Perversion` | 차원 왜곡 | 확정 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Evangelium of the Dead` | 사자의 묵시록 | 확정 |  |

**플롯** (81개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `Murder Plan` | 살인 계획 | 확정 |  |
| `Bloody Rites` | 피로 물든 의식 | 확정 |  |
| `The Key Girl` | 열쇠가 되는 소녀 | 확정 |  |
| `Tricky Twins` | 쌍둥이 트릭 | 확정 |  |
| `A Love Affair` | 연애의 풍경 | 확정 |  |
| `Secret Record` | 비밀 기록 | 확정 |  |
| `Sign with me!` | 나와 계약하자! | 확정 |  |
| `Twisted Truth` | 광기의 진실 | 확정 |  |
| `Witch’s Curse` | 마녀의 저주 | 확정 |  |
| `Dance of Fools` | 어리석은 자의 춤 | 확정 |  |
| `Hysteria Virus` | 공상 확대 바이러스 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Paranoia Virus` | 망상 확대 바이러스 | 확정 |  |
| `People Who Saw` | 목격해 버린 사람들 | 확정 |  |
| `The Final Plan` | 최종 계획 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The Great Race` | 위대한 종족 | 확정 |  |
| `The Resistance` | 저항하는 자들 | 확정 |  |
| `Tightrope Plan` | 외줄 위에서의 계획 | 확정 |  |
| `Unsafe Trigger` | 불확정 인자 χ괴 | 확정 |  |
| `Giant Time Bomb` | 거대 시한폭탄 X의 존재 | 확정 |  |
| `Jekyll and Hyde` | 지킬 박사와 하이드 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Moonlight Beast` | 달밤의 야수 | 확정 |  |
| `The Cursed Land` | 저주받은 땅 | 확정 |  |
| `The Sealed Item` | 봉인된 것 | 확정 |  |
| `Threads of Fate` | 인과율 | 확정 |  |
| `A Hideous Script` | 최악의 시나리오 | 확정 |  |
| `An Absolute Will` | 절대적인 의지 | 확정 |  |
| `Change of Future` | 미래 변경 계획 | 확정 |  |
| `Dice of the Gods` | 신의 주사위 | 확정 |  |
| `Into Nothingness` | 허무히 흘러가는 세계 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Love-Hate Spiral` | 애증의 나선 | 확정 |  |
| `Monster Intrigue` | 괴물의 암약 | 확정 |  |
| `The Black School` | 검은 학교 | 확정 |  |
| `The Devil’s Hand` | 뻗쳐오는 마수 | 확정 |  |
| `The Faceless God` | 얼굴 없는 신 | 확정 |  |
| `The Hidden Freak` | 숨어 있는 살인귀 | 확정 |  |
| `The Real Monster` | 진정한 괴물 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Unanswered Heart` | 통하지 않는 마음 | 확정 |  |
| `Unknown Factor X` | 불확정 인자 χ | 확정 |  |
| `Circle of Friends` | 친목 동아리 | 확정 |  |
| `Fated Connections` | 인과의 인연 | 확정 |  |
| `Showtime of Death` | 죽음의 쇼타임 | 확정 |  |
| `The Plaguebringer` | 악역을 자처하는 자 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Those with Habits` | 성깔 있는 녀석들 | 확정 |  |
| `Witches' Tea Time` | 마녀의 다과회 | 확정 |  |
| `A Place to Protect` | 지켜야 할 장소 | 확정 |  |
| `Dimensional Merger` | 차원 병합 계획 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Male Confrontation` | 사나이의 싸움 | 확정 |  |
| `Smell of Gunpowder` | 화약의 향기 | 확정 |  |
| `The Demon’s Script` | 악마의 시나리오 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The King in Yellow` | 황색의 왕 | 확정 |  |
| `World of Rebellion` | 반역의 세계 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `An Unsettling Rumor` | 불온한 소문 | 확정 |  |
| `Fairy-Tale Murderer` | 옛날 이야기 속 살인귀 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Keeper of Mythology` | 신화 수집가 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Panic and Obsession` | 공황과 망집 | 확정 |  |
| `Puppeteer’s Strings` | 조종용 실 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The Noble Bloodline` | 고귀한 혈족 | 확정 |  |
| `Unspeakable Horrors` | 불러선 안 될 괴물 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `A Drop of Strychnine` | 스트리크닌 한 방울 | 확정 |  |
| `A Quilt of Incidents` | 누벼 엮은 사건 퀼트 | 확정 |  |
| `Crossing World Lines` | 세계선 너머로 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Light of the Avenger` | 복수자의 등불 | 확정 |  |
| `Mother Goose Mystery` | 머더 구스 미스터리 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Night Mist Nightmare` | 밤안개의 악몽 | 확정 |  |
| `Shadow of the Ripper` | 칼부림 살인마의 그림자 | 확정 |  |
| `The Forbidden Future` | 닫혀버린 미래 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Giant Time Bomb Again` | 거대 시한폭탄 Y의 존재 | 확정 |  |
| `Social Media Paranoia` | SNS 편집증 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The Sealed Conclusion` | 봉인된 종말 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Choir to the Outer God` | 이계 신을 향한 합창곡 | 확정 |  |
| `Whispers from the Deep` | 가라앉은 도시의 속삭임 | 확정 |  |
| `I am a Master Detective` | 나는 명탐정 | 확정 |  |
| `People Who Don’t Listen` | 이야기를 듣지 않는 사람들 | 확정 |  |
| `The Ones from the Grave` | 무덤에서 나온 자 | 확정 |  |
| `I Am the True Detective!` | 내가 바로 명탐정 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The Mythomaniac's Secret` | 거짓말쟁이의 비밀 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Giant Time Bomb Yet Again` | 거대 시한폭탄 Z의 존재 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `The Sacred Words of Dagon` | 다곤 님의 말씀 | 확정 |  |
| `Through the Looking-Glass` | 거울 나라의 앨리스 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `Isolated Institution Psycho` | 격리 병동 사이코 | 확정 |  |
| `Worshippers of the Apocalypse` | 멸망을 노래하는 자 | 확정 |  |

**참극 세트** (8개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `Last Liar` | 라스트 라이어 | 자체 | 한국 미정발 세트, Tabletop Simulator 유저 번역 |
| `First Steps` | 입문 | 확정 | 기본판 동봉 입문 세트 — 룰북에서 확인 |
| `Basic Tragedy` | 기본 | 확정 | 일본어판 명칭: Basic Tragedy X → 정발 추정: 기본 세트 |
| `Haunted Stage` | 헌티드 스테이지 | 확정 | Z-Man판 명칭: Prime Evil / 일본어판: Haunted Stage Ａ → 정발 추정: 헌티드 스테이지 |
| `Midnight Zone` | 미드나이트 존 | 확정 | 정발 추정: 미드나이트 존 |
| `Mystery Circle` | 미스터리 서클 | 확정 | 일본어판 명칭: Mystery Circle Χ → 정발 추정: 미스터리 서클 |
| `Cosmic Mythology` | 위어드 미솔로지 | 확정 | 일본어판 명칭: Weird Mythology → 정발 추정: 위어드 미솔로지 |
| `Another Horizon R` | 어나더 호라이즌 | 자체 | 정발 여부 불명 — 실물 확인 필요 |

**캐릭터** (35개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `A.I.` | AI | 확정 |  |
| `Boss` | 거물 | 확정 |  |
| `Alien` | 이세계인 | 확정 |  |
| `Nurse` | 간호사 | 확정 |  |
| `Doctor` | 의사 | 확정 |  |
| `Copycat` | 모방자 | 확정 |  |
| `Patient` | 입원 환자 | 확정 |  |
| `Servant` | 메이드 | 확정 |  |
| `Soldier` | 군인 | 확정 |  |
| `Teacher` | 교사 | 확정 |  |
| `Henchman` | 하수인 | 확정 |  |
| `Illusion` | 환상 | 확정 |  |
| `Informer` | 정보원 | 확정 |  |
| `Pop Idol` | 아이돌 | 확정 |  |
| `Black Cat` | 검은 고양이 | 확정 |  |
| `Class Rep` | 학생 회장 | 확정 |  |
| `Scientist` | 학자 | 확정 |  |
| `Journalist` | 기자 | 확정 |  |
| `Part-Timer` | 아르바이트생 | 확정 |  |
| `Young Girl` | 여자 아이 | 확정 |  |
| `Boy Student` | 남학생 | 확정 |  |
| `Godly Being` | 신 | 확정 |  |
| `Mystery Boy` | 아웃사이더 | 확정 |  |
| `Sacred Tree` | 신수 | 확정 |  |
| `Girl Student` | 여학생 | 확정 |  |
| `Sect Founder` | 교주 | 확정 |  |
| `Little Sister` | 여동생 | 확정 |  |
| `Office Worker` | 회사원 | 확정 |  |
| `Part-Timer(?)` | 아르바이트생? | 확정 |  |
| `Shrine Maiden` | 무녀 | 확정 |  |
| `Police Officer` | 형사 | 확정 |  |
| `Transfer Student` | 전학생 | 확정 |  |
| `Metaworld Denizen` | 상위 존재 | 확정 |  |
| `Forensic Specialist` | 감식관 | 확정 |  |
| `Rich Man’s Daughter` | 재벌가 손녀 | 확정 |  |

**키워드·태그** (9개)

| 영문 키 | 정발 용어 | 등급 | 비고 |
|---|---|---|---|
| `Boy` | 소년 | 확정 |  |
| `Man` | 남성 | 확정 |  |
| `Girl` | 소녀 | 확정 |  |
| `Tree` | 신수 | 확정 |  |
| `Adult` | 성인 | 확정 |  |
| `Woman` | 여성 | 확정 |  |
| `Animal` | 동물 | 확정 |  |
| `Student` | 학생 | 확정 |  |
| `Construct` | 창조물 | 확정 |  |


### 2.6 게임 용어 후보 조사 — 2026-07-23 Claude 조사 (전체 추정)

> ja 원문 + 커뮤니티(나무위키·보드라이프·아카라이브 등) + 저장소 규칙 맥락 기반 후보.
> **전부 추정 등급** — 사용자 승인 후 ko.jsonc 반영, 실물 대조 후 확정 승격.
> 확신도: 상=커뮤니티/정발 근거 발견, 중=ja 직역 확신, 하=유추.

**확신도 상** (23개)

| 영문 키 | 후보 | 근거 | 출처 |
|---|---|---|---|
| `Day` | 날짜 | ja 日付의 직역이며 한국 커뮤니티 규칙 설명에서 '날짜 카운터/날짜 마커'로 통용됨을 확인. | https://namu.wiki/w/%ED%8A%B8%EB%9E%98%EC%A7%80%EB%94%94%20%EB%A3%A8%ED%8D%BC |
| `Day End` | 하루의 끝 | 나무위키 규칙 설명에 '한밤중 하루의 끝 단계' 및 캐릭터 능력 타이밍 '하루의 끝' 표기가 확인됨. | https://namu.wiki/w/%ED%8A%B8%EB%9E%98%EC%A7%80%EB%94%94%20%EB%A3%A8%ED%8D%BC |
| `Last Day` | 마지막 날 | 나무위키/보드라이프 규칙 설명에서 '마지막 날' 표기가 그대로 통용됨을 확인('마지막 날이면 루프 종료'). | https://namu.wiki/w/%ED%8A%B8%EB%9E%98%EC%A7%80%EB%94%94%20%EB%A3%A8%ED%8D%BC |
| `Loop End` | 루프 종료 | ja ループ終了의 직역이며 커뮤니티 규칙 설명에서도 '루프 종료' 표현이 통용됨. | https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486 |
| `Loop ends` | 루프 종료 | ja 원문이 Loop End와 동일(ループ終了)하므로 같은 후보를 사용. | ja 원문 + 커뮤니티 통용(보드라이프/나무위키) |
| `Night: Day End` | 한밤중: 하루의 끝 | 나무위키 규칙 설명의 단계명 '한밤중 하루의 끝 단계'와 일치하며 콜론은 UI 구분용으로만 유지. | https://namu.wiki/w/%ED%8A%B8%EB%9E%98%EC%A7%80%EB%94%94%20%EB%A3%A8%ED%8D%BC |
| `Once per {type}` | {type}당 1회 | 정발판 카드 문구로 인용되는 '1 루프당 1회만 가능'과 직접 대응하는 패턴({type}=루프일 때 '루프당 1회'). | https://namu.wiki/w/%ED%8A%B8%EB%9E%98%EC%A7%80%EB%94%94%20%EB%A3%A8%ED%8D%BC |
| `Main Plot` | 룰Y | 정발 계보인 ja 원문이 ルールY이고, 나무위키·보드라이프 룰 정리 모두 각본 구성 요소를 '룰Y'로 표기한다(설명조로 '메인 플롯(룰Y)' 병기). | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼, 보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486 |
| `Main Plots` | 룰Y | 단·복수 쌍 규칙에 따라 'Main Plot'과 동일 후보를 사용한다(참극 세트 위키의 룰Y 목록 제목). | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `Sub Plot` | 룰X | ja 원문이 ルールX이고 나무위키·보드라이프 룰 정리가 각본의 서브 플롯을 '룰X1/룰X2'로 표기하므로 라벨 단독으로는 '룰X'가 정발 표기 추정에 부합한다. | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼, 보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486 |
| `Sub Plots` | 룰X | 단·복수 쌍 규칙에 따라 'Sub Plot'과 동일 후보를 사용한다. | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `Special Rule` | 특수 규칙 | ja 特殊ルール의 직역이며, 룰X/룰Y 표기를 쓰는 보드라이프 흐름 정리 글에서도 '특수 규칙에 의해 카운터를 놓는다'는 식으로 같은 표기를 사용한다. | 커뮤니티 통용(보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486) |
| `Special Rules` | 특수 규칙 | 단·복수 쌍 규칙에 따라 'Special Rule'과 동일 후보를 사용한다(ja 特殊ルール). | 커뮤니티 통용(보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486) |
| `Description` | 설명 | ja가 이 키를 脚本の特徴로 옮겼으므로 확정 용어 Script=각본을 조합해 직역했으나, 같은 키가 GM 헬퍼 표의 일반 '설명' 머리글로도 재사용되므로 실물 대조 시 주의가 필요하다. / 검증: 이 키가 실제로 렌더링되는 곳은 gm/gmHelper.svelte:145의 GM 헬퍼 능력 표 머리글(Type/Characte | ja 원문 유추 |
| `difficulty` | 난이도 | ja 難易度의 직역이자 나무위키·보드라이프 등 한국 커뮤니티에서 예외 없이 쓰는 표기다. | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼, 보드라이프 https://boardlife.co.kr/game/3961) |
| `Character` | 캐릭터 | ja キャラクター 직역이며 나무위키 등 커뮤니티와 저장소 기존 번역(캐릭터 카드, 캐릭터를 선택하세요)이 모두 캐릭터로 일치. | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) + 저장소 ko.jsonc 기존 표기 |
| `Characters` | 캐릭터 | Character의 복수형으로 같은 후보를 사용(한국어는 수 구분 없음). | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `Incidents` | 사건 | 확정 용어 Incident=사건의 복수형으로 동일 표기를 사용. | 확정 용어표(translations/ko.GLOSSARY.md, 정발 확인 항목) |
| `On Character Death` | 캐릭터 사망 시 | 나무위키 역할 능력 표기 '[강제: 이 캐릭터 사망 시]'와 동일한 타이밍 라벨 패턴이 확인됨. | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `On character death` | 캐릭터 사망 시 | 대소문자만 다른 쌍이므로 On Character Death와 같은 후보를 사용(능력 타이밍 enum). | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `Faked` | 위장 | 저장소 용어집에 Fake Incident=위장 사건, Faked Suicide=위장 자살이 정발 확정으로 기록되어 있어 사건 배지 Faked는 '위장'으로 직결됨. | 저장소 translations/ko.GLOSSARY.md §2.5 (정발 확정 항목) |
| `Turf` | 영역 | ja テリトリー(거물/Boss의 각본 지정 장소)에 해당하며 나무위키가 '거물의 영역'·'보스의 영역'으로 표기하고, MTS가 가타카나 역할명도 의역한 경향과 부합. | 커뮤니티 통용(나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `Goodwill Refusel` | 우호 무시 | ja 원문 友好無視의 직역이며 나무위키 트래지디 루퍼 문서에서 '우호 무시'/'우호 절대 무시' 표기가 실제로 통용됨을 확인했다. | https://namu.wiki/w/%ED%8A%B8%EB%9E%98%EC%A7%80%EB%94%94%20%EB%A3%A8%ED%8D%BC |

**확신도 중** (33개)

| 영문 키 | 후보 | 근거 | 출처 |
|---|---|---|---|
| `Day Start` | 하루의 시작 | 커뮤니티에서 확인된 Day End 표기 '하루의 끝'과 대칭이 되도록 조합한 후보. | 커뮤니티 통용(나무위키 '하루의 끝') 대칭 유추 |
| `Days per Loop` | 루프당 일수 | ja 日数 직역(일수)에 확정 용어 '루프'를 조합했으며 커뮤니티의 '1 루프당' 패턴과도 일치. | ja 원문 유추 |
| `Loop Start` | 루프 시작 | 나무위키는 '루프의 시작' 단계를 쓰며, ja ループ終了→'루프 종료'와 대칭이 되도록 라벨형으로 조정. | 커뮤니티 통용(나무위키 '루프의 시작') + 대칭 유추 |
| `Night: Loop End` | 한밤중: 루프 종료 | 커뮤니티 확인 표기 '한밤중'과 ja 직역 '루프 종료'를 Night: Day End와 같은 형식으로 조합. | 커뮤니티 통용(나무위키) + ja 원문 조합 유추 |
| `Twice per {type}` | {type}당 2회 | 커뮤니티 확인 패턴 '{type}당 1회'를 2회로 확장한 동일 형식 후보. | 커뮤니티 패턴 확장(나무위키/보드라이프) |
| `{days} per {type}` | {type}당 {days}회 | {days}가 숫자임을 코드(oncePer.svelte)에서 확인했고 '{type}당 N회' 패턴에 맞춰 어순만 조정. | 커뮤니티 패턴 확장 + 저장소 코드 확인 |
| `Extra Plot` | 엑스트라 룰Y | ja.json이 ルールX로 옮겼으나 저장소 데이터(data.ts, 광기의 진실 twistedTruth)상 이 요소는 '추가 메인 플롯'을 지정하는 슬롯이라 정발이 룰Y 계열(예: 엑스트라 룰Y)일 가능성이 있어 실물 확인이 필요하다. / 검증: Sub Plot/Sub Plots=룰X와 동일한 '룰X'를 써서 각본 상세에서 | ja 원문 유추(translations/ja.json "Extra Plot": "ルールX") |
| `Script creation` | 각본 작성 시 | ja 脚本作成時의 직역으로, 확정 용어 Script=각본을 그대로 조합했다(플롯 규칙의 적용 시점 라벨). | ja 원문 유추 |
| `Victory Conditions` | 각본가의 승리 조건 | ja 脚本家の勝利条件의 직역으로 확정 용어 Mastermind=각본가를 조합했고, 커뮤니티에서도 '승리 조건' 표현이 그대로 통용된다. | ja 원문 유추(보조: 나무위키 https://namu.wiki/w/트래지디%20루퍼) |
| `Hints for the Mastermind` | 각본가를 위한 지침 | ja 脚本家への指針의 직역(각본가 확정 조합)이며, 아카라이브 각본가 가이드 등 커뮤니티에서도 각본집의 해당 항목을 '지침'이라 부른다. | ja 원문 유추(보조: 아카라이브 https://arca.live/b/boardgame/101301462) |
| `Story` | 스토리 | ja ストーリー를 그대로 음차한 표기로, 각본집 스토리 섹션 제목에 해당한다. | ja 원문 유추 |
| `Cast` | 인물 | ja 人物의 직역으로 각본 상세의 등장인물 표 머리글에 해당하며, 정발이 '등장인물'(zh-TW 登場人物 유사)로 풀어 썼을 가능성도 있어 실물 확인이 필요하다. | ja 원문 유추 |
| `Mob Incidents` | 군상 사건 | ja 群像事件의 직역(群像=군상)으로 확정 용어 사건과 조합했으며 미드나이트 존은 정발 포함이나 커뮤니티 표기는 미발견. | ja 원문 유추 |
| `No Culprit` | 범인 없음 | 각본 상세에서 범인이 지정되지 않은 사건에 표시되는 라벨로, 저장소 기존 번역 'No incident=사건 없음'과 동일한 패턴의 조합. | 저장소 ko.jsonc 선례(No incident=사건 없음) + 유추 |
| `On Role reveal` | 역할 공개 시 | GM 헬퍼에서 역할 공개 시 발동 능력의 섹션 제목으로, 확정 용어 역할과 나무위키의 능력 타이밍 어법 '[강제: ~시]'·'역할을 공개한다'를 조합. | 커뮤니티 어법(나무위키 https://namu.wiki/w/트래지디%20루퍼) + 유추 |
| `Victims` | 희생자 | ja 犠牲者의 직역으로 군상 사건의 희생자 지정에 쓰이는 용어이며 한국어에서 자연스러운 유일 대응. | ja 원문 유추 |
| `Incident step` | 사건 발생 단계 | 하루 진행 중 사건이 발생하는 페이즈를 가리키는 능력 타이밍으로, 나무위키 진행 순서의 해당 페이즈명 '사건 발생'과 페이즈를 '단계'로 옮기는 정발 어법을 조합. | 커뮤니티 어법(나무위키 https://namu.wiki/w/트래지디%20루퍼) + 유추 |
| `Mastermind Ability` | 각본가 능력 | 역할 능력의 발동 시점 라벨로, 확정 용어 '각본가'+능력의 조합이며 독일어 Mastermind-Fähigkeit 직역과 일치한다. | de 원문 유추 + 저장소 roles.schema.json timing enum |
| `Mandatory` | 강제 | ja 원문 強制의 직역이며, 강제 발동 능력 타입과 우호 무시(강제) 태그 양쪽에 자연스럽게 들어맞는다. | ja 원문 유추 (translations/ja.json 強制) |
| `Card resolve` | 카드 해결 | 행동 카드 공개·해결 시점을 뜻하는 발동 시점 라벨로, 커뮤니티 룰 정리에서 카드를 '해결'한다는 표기가 통용되고 de Kartenauflösung 직역과도 일치한다. | 커뮤니티 통용(보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486) |
| `Placing Cards` | 카드 배치 | 각본가 도우미 표의 행동 카드 배치 구간 제목으로, 커뮤니티 룰 정리에서 '카드의 배치' 표기가 확인된다. | 커뮤니티 통용(보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486) |
| `Resolving Cards` | 카드 해결 | 각본가 도우미 표의 카드 해결 구간 제목으로, Card resolve와 같은 개념이라 동일 표기 '카드 해결'을 쓰며 커뮤니티 룰 정리의 '해결' 표기와 일치한다. | 커뮤니티 통용(보드라이프 https://boardlife.co.kr/bbs_detail.php?tb=community_post&bbs_num=20486) |
| `Extra Gauge` | 엑스트라 게이지 | 일본어 공식 조견표가 전 세트에서 'Exゲージ'로 표기함을 확인 — 정발판이 'EX 게이지'로 줄여 썼을 가능성도 있으나 완전형 음차가 안전. | https://bakafire.main.jp/rooper/pdf/summary_008.pdf (Weird Mythology 공식 조견표) |
| `Extra Gauge Effect` | 엑스트라 게이지 효과 | 헌티드 스테이지 세트의 추가 규칙명으로, Extra Gauge 후보 표기에 '효과'를 조합한 직역. | ja 원문 유추 (bakafire 조견표 Exゲージ 계열) |
| `Extra Cads` | 엑스트라 카드 | 'Extra Cards'의 오타이며 일본어 공식 조견표에서 'Exカード' 표기를 확인, Extra Gauge와 같은 방식의 음차. | https://bakafire.main.jp/rooper/pdf/summary_003.pdf (Haunted Stage 공식 조견표, 魔獣の解放 항목) |
| `Curse cards` | 저주 카드 | ja 呪いカード의 직역으로, 확정 용어 계열(마녀의 저주, 저주의 각성)의 '저주' 표기와 일관됨. | ja 원문 유추 (translations/ja.json 呪いカード) |
| `Madness (4)` | 광기 (4) | ja 조견표 원문은 発狂(직역: 발광)이지만 확정 용어 'Night of Madness=광기의 밤'과 일관되게 '광기'를 채택 — 정발이 '발광'일 가능성도 있음. | https://bakafire.main.jp/rooper/pdf/summary_008.pdf (Ancient Magics: Ex4+ 発狂) |
| `Ancient Seal (3)` | 고대의 인장 (3) | ja 조견표 원문 旧き印(러브크래프트 '엘더 사인' 모티프)의 직역으로, 영문 Ancient Seal과도 부합 — 대안: '옛 인장'. | https://bakafire.main.jp/rooper/pdf/summary_008.pdf (Ancient Magics: Ex3+ 旧き印) |
| `Spell of Sympathy (1)` | 감응의 주술 (1) | ja 조견표 원문 感応のまじない의 직역(感応=감응, まじない=주술). | https://bakafire.main.jp/rooper/pdf/summary_008.pdf (Ancient Magics: Ex1+ 感応のまじない) |
| `Reminiscence of the Forefathers (2)` | 선조의 추억 (2) | ja 조견표 원문 祖先の追憶의 직역(祖先=선조, 追憶=추억). | https://bakafire.main.jp/rooper/pdf/summary_008.pdf (Ancient Magics: Ex2+ 祖先の追憶) |
| `World Switch` | 세계 이동 | ja 어나더 호라이즌 조견표 원문 世界移動의 직역 — 어나더 호라이즌은 한국 정발 미수록 추정이라 ja 우선 원칙 적용. | https://bakafire.main.jp/rooper/pdf/summary_006.pdf (Another Horizon 공식 조견표) |
| `Mob` | 군상 | ja.json의 "Mob Incidents": 群像事件(군상 사건)에서 사건 발생 조건 표시 시 범인 대신 표기되는 군중을 가리키는 말이므로 群像의 직역 '군상'을 채택했다 (Mob Incidents는 '군상 사건'으로 일관). | ja 원문 유추 (translations/ja.json "Mob Incidents": "群像事件") |
| `Base` | 기본판 | 확장(미드나이트 존 등)과 대비되는 기본 게임 에디션 라벨(de 'Basis')로, 한국 보드게임 통용 표기이자 글로서리에도 이미 쓰인 '기본판'을 채택했다. | de 원문(Basis) + 한국 보드게임 관용 표기 유추 (translations/ko.GLOSSARY.md '기본판 동봉' 표기) |

**확신도 하** (29개)

| 영문 키 | 후보 | 근거 | 출처 |
|---|---|---|---|
| `First Day` | 첫째 날 | ja 원문이 없어 커뮤니티 확인 표기 '마지막 날'과 대칭이 되도록 유추한 후보. | ja 원문 없음 → 유추(마지막 날 대칭) |
| `enters on day` | 등장 날짜 | ja 日目(~일째)는 접미사형이라 '(라벨: 값)' 렌더링에 부자연스러워 Day=날짜 후보를 조합한 라벨형으로 유추. | ja 원문 유추 |
| `enters on loop` | 등장 루프 | enters on day(등장 날짜)와 대칭으로 확정 용어 '루프'를 조합한 유추 후보. | 유추(enters on day 대칭) |
| `Times per day` | 하루당 횟수 | 정발 카드 문구로 확인된 '루프당 1회' 패턴을 하루 단위에 적용해 유추. | 커뮤니티 패턴 유추(나무위키/보드라이프) |
| `Times per loop` | 루프당 횟수 | 정발 카드 문구 '1 루프당 1회만 가능'의 '루프당' 패턴에 횟수 라벨을 조합한 유추. | 커뮤니티 패턴 유추(나무위키/보드라이프) |
| `Enters Play` | 게임에 등장 | de 'Kommt ins Spiel' 직역이며 GM 헬퍼 표에서 캐릭터의 등장을 표시하는 라벨임을 코드로 확인. | de 원문 유추 |
| `Extra Rules` | 추가 규칙 | ja 원문이 없는 키로, 참극 세트 위키 페이지에서 세트 고유 규칙 목록의 제목이므로 확정 후보 '특수 규칙'(Special Rules)과 구별되는 '추가 규칙'으로 유추했다. | 유추(ja 원문 없음, src/routes/(site)/wiki/tragedy/[id]/+page.svelte 맥락) |
| `Prerequiste` | 조건 | ja 원문이 없는 키로, GM 헬퍼 표에서 능력 발동 전제(예: '도심에 음모 2개 이상')를 표시하는 머리글이라 간결한 '조건'으로 유추했다(대안: 발동 조건, 전제 조건). | 유추(ja 원문 없음, src/routes/(site)/gm/gmHelper.svelte 및 data.ts prerequisite 필드 맥락) |
| `Prerequisite` | 조건 | 철자만 다른 쌍이므로 'Prerequiste'와 동일 후보를 사용한다. | 유추(ja 원문 없음) |
| `Repeated Culprit` | 범인 중복 가능 | 같은 범인이 여러 사건의 범인이 될 수 있음을 표시하는 사건 배지(예: 연속살인)로, 확정 용어 범인을 조합해 유추. | ja 원문 유추 (저장소 src/routes/(site)/wiki/incidents 배지 용법 확인) |
| `Culprit is dead` | 범인 사망 | 미정발 팬 세트 사건의 전제 조건 라벨로, 확정 용어 범인과 나무위키의 '사망' 어법을 조합해 유추(정발 근거 없음). | ja 원문 유추 (de: Täter ist tot 참고) |
| `Dual Roles` | 이중 역할 | 미정발 세트(Another Horizon)의 빛/어둠 세계에서 한 캐릭터가 두 역할을 갖는 특수 규칙으로, de Doppelrollen 직역 + 확정 용어 역할 조합의 자체 번역. | ja 원문 없음, de 직역 유추 (src/data.ts:5324 의미 확인) |
| `Incident trigger` | 사건 발생 판정 | 사건 발생 여부를 판정할 때 적용되는 능력 타이밍으로, 나무위키의 '사건의 발생 여부를 판단한다' 어법에서 유추한 자체 후보. | ja 원문 유추 (de: Vorfallsauslöser, src/roles.schema.json 타이밍 enum 확인) |
| `Mastermind Aid` | 각본가 도우미 | 룰북 용어가 아니라 사이트의 각본가 보조(GM helper) 페이지 제목(src/routes/(site)/gm/+page.svelte)이므로 확정 용어 '각본가'에 도우미를 붙여 유추했다. | 저장소 맥락 유추 (gm 도우미 페이지 제목) |
| `Goodwill Outburst` | 우호 폭주 | 뉴 트래지디스 확장 역할 속성(Twilight·Fanatic 등)으로 정발/커뮤니티 근거가 없어, 확정 용어 '우호'+Outburst(de Gunst-Ausbruch)의 직역으로 유추했다. | de/en 원문 유추 (일본 원판 友好暴走 추정) |
| `Goodwill & Wrarp` | 우호 & 워프 | Another Horizon R 세트의 특수 규칙 제목(Wrarp는 Warp의 오타)으로 한국어판 미발매 확장이라, 확정 용어 '우호'와 외래어 '워프'를 조합해 유추했다. | de 원문(Gunst & Warp) 유추 + 저장소 data.ts Warping 규칙 맥락 |
| `After Death` | 사후 | Haunted Stage 세트의 특수 규칙 제목(시체에 카드 배치·능력 사용 허용)으로 정발 근거가 없어, 일본어판 계보의 死後를 상정한 직역으로 유추했다. | ja 원문 유추 (de Nach dem Tod 일치) |
| `Passive` | 상시 | 우호 능력이 아닌 항상 적용되는 캐릭터 고유 능력을 표시하는 배지(type: passive)로, 한국 보드게임 룰북 관례인 '상시'로 유추했다. | 저장소 맥락 유추 (wiki/character 배지) |
| `Always` | 항상 | 능력 발동 시점 라벨 중 하나로 ja 원문이 없어 en Always/de Immer의 직역으로 유추했으며, Passive의 '상시'와 구분되도록 '항상'을 택했다. | de 원문 유추 (Immer) |
| `Only at` | 한정 장소 | 카드 화면에서 'Only at: 신사'처럼 장소 목록 앞에 붙는 제한 라벨이라 콜론 구조에 맞는 명사형 '한정 장소'로 유추했다. | 저장소 맥락 유추 (cards/card.svelte restrictedToLocation) + de 원문(Nur in) |
| `World Selection` | 세계 선택 | ja 조견표에서 해당 역할(하이드·아니무스) 조문능력은 表裏選択(표리 선택)이지만, 사이트 UI 태그로는 영문 키·독일어(Welt) 문맥에 맞춘 '세계 선택'이 자연스러움. | https://bakafire.main.jp/rooper/pdf/summary_006.pdf + 저장소 src/view/table.svelte 문맥 |
| `Abnormal World` | 이면 세계 | ja 원문은 裏世界(표세계 表世界와 대응)로 자연스러운 한국어는 '이면 세계' — 영어·독일어 직역 대안은 '이상 세계'. | https://bakafire.main.jp/rooper/pdf/summary_006.pdf (裏世界/表世界 표기 확인) |
| `In Normal world` | 표면 세계일 때 | ja 원문 사건 조건 '表世界にいる場合'의 직역으로, Abnormal World=이면 세계 후보와 짝을 이루는 '표면 세계' 표기 — 영어 직역 대안은 '정상 세계일 때'. | https://bakafire.main.jp/rooper/pdf/summary_006.pdf (世界崩壊 사건 조건) |
| `abnormal or normal` | 이면 또는 표면 | 각본 지정 항목 'world'의 값 설명으로, 위 세계 명칭 후보(이면 세계/표면 세계)와 일관되게 조합 — 영어 직역 대안은 '이상 또는 정상'. | ja 원문 유추 (ja 表裏選択 개념, 저장소 data/another-horizon/roles.jsonc 문맥) |
| `The Far Side` | 먼 곳 | 중국어 프로모 캐릭터(업로더·선인)용 보드 밖 특수 지역으로, 같은 저장소 zh-TW판 표기 遠方의 직역. | 저장소 translations/zh-TW.json(遠方) + data/Promo/chinese-promos.jsonc 문맥 |
| `Warping` | 왜곡 | 팬 세트(rei)의 '하루에 Warp가 1회 이상 발생하면 게이지 +1' 규칙명으로, 독일어 Verzerrung·ja 계열 표현 次元歪曲(차원 왜곡)과 일관되게 '왜곡'을 채택 — 대안: '뒤틀림'. | ja 원문 유추 (de Verzerrung, 저장소 data/rei/tragedys.jsonc 문맥) |
| `Change of Heart` | 심경 변화 | 불안↔우호를 맞바꿔 판정하는 팬 세트(rei) 규칙명으로, 독일어 Sinneswandel과 같은 관용 표현 '심경 변화'가 자연스러움 — 대안: '변심'. | ja 원문 유추 (de Sinneswandel, 저장소 data/rei/tragedys.jsonc 문맥) |
| `Fan` | 팬 제작 | 정발 제품 용어가 아니라 이 사이트가 팬 제작 콘텐츠(src/data.ts의 edition: "Fan")를 구분하는 자체 라벨이므로, 저장소 글로서리의 '팬 확장/팬 각본' 표기와 맞춰 '팬 제작'으로 유추했다. | 저장소 맥락 유추 (src/data.ts edition 필드, translations/ko.GLOSSARY.md '팬/기타' 표기) |
| `Rei` | 레이 | 정발에 없는 팬 세트/에디션 명칭(data/rei, 글로서리에서 '정발 없음 → 자체 번역')이며, 세트명은 음차한다는 기존 관례(라스트 라이어, 헌티드 스테이지)와 de판이 'Rei'를 고유명사로 유지한 점에 따라 '레이'로 음차했다. | 저장소 관례 유추 (translations/ko.GLOSSARY.md 세트명 음차 관례, de.json "Rei": "Rei") |


### 2.7 정발 설명서 대조 결과 — 2026-07-23

> 저본: 사용자 제공 정발 설명서 PDF (각본가 설명서 17p / 주인공 설명서 50p). 판독 에이전트 8명 전수 대조.
> 일치 98건(기존 확정 검증 + 후보 승격) · 정정/충돌 판정 후 확정 반영 40건 · 미목격 52건은 §2.6 추정 유지.
> 페이지 인용은 지면 인쇄 번호 기준. Agitator의 설명서 내 '선동가'는 Conspiracy Theorist — 오탐 제외.

**설명서 근거로 확정 반영된 항목** (40건)

| 영문 키 | 정발 표기 | 비고 |
|---|---|---|
| `Day` | 날짜 |  |
| `Loop End` | 루프 종료 |  |
| `Character` | 캐릭터 |  |
| `difficulty` | 난이도 |  |
| `Characters` | 캐릭터 |  |
| `Extra Rules` | 추가 규칙 |  |
| `Goodwill Refusel` | 우호 무시 |  |
| `Incidents` | 사건 |  |
| `Last Day` | 마지막 날 |  |
| `Loop Start` | 루프 시작 |  |
| `Special Rule` | 특수 규칙 |  |
| `Special Rules` | 특수 규칙 |  |
| `Once per {type}` | 1{type}당 1회 | 1루프당 1회 패턴 (각본가 p6, 주인공 p22) |
| `Turf` | 세력권 | 구 후보 영역. 주인공 설명서 p18 세력권 카운터 |
| `Victory Conditions` | 승리 조건 | 주인공 p19 승리 조건 |
| `First Day` | 1일째 | 1일째, 2일째, …, 마지막 날 (주인공 p21) |
| `Cast` | 등장인물 | 주인공 p26 등장인물 |
| `Base` | 본판 | 주인공 p41 본판 |
| `Day Start` | 라운드 시작 | 주인공 p21 라운드 9단계: 1. 라운드 시작 |
| `Main Plot` | 룰 Y | 룰 Y — 띄어쓰기 포함 (지면 다수). 룰Y 표기 혼재 있음 |
| `Sub Plot` | 룰 X | 룰 X — 동일 |
| `Patient` | 입원 환자 |  |
| `Paranoia Limit` | 최대 불안 |  |
| `Main Plots` | 룰 Y |  |
| `Sub Plots` | 룰 X |  |
| `Mandatory` | 강제 |  |
| `Day End` | 라운드 종료 | 9. 라운드 종료 |
| `Loop ends` | 루프 종료 |  |
| `Placing Cards` | 행동 단계 | 각본가 행동+주인공 행동 통칭 라벨 — 각본가 설명서 표기 행동 단계 |
| `Card resolve` | 행동 해결 | 4. 행동 해결 |
| `Resolving Cards` | 행동 해결 | 행동 해결과 동일 |
| `Extra Gauge` | 특수 게이지 | 구 후보 엑스트라 게이지. p18 특수 게이지 카운터 (p25·41 동일) |
| `Days per Loop` | 1루프당 날짜 |  |
| `Mastermind Ability` | 각본가 능력 |  |
| `Mastermind Action step` | 각본가 행동 | 2. 각본가 행동 |
| `Goodwill ablility step` | 주인공 능력 사용 | 6. 주인공 능력 사용 |
| `Extra Cads` | 특수 카드 | p18 특수 카드 (4장) |
| `Extra Gauge Effect` | 특수 게이지 효과 |  |
| `Twice per {type}` | 1{type}당 2회 |  |
| `{days} per {type}` | 1{type}당 {days}회 |  |

**설명서로 검증된 기존 확정 용어** (일치 86건): 각본가·주인공·루프·음모·불안·우호·사건·범인·역할·참극 세트·최후의 싸움·핵심 인물·흑막·연쇄 살인마 등 — §2.5 기록 유효 확인.


### 2.8 능력 텍스트 임시 표기 — 2026-07-23 초안 작업 중 발생

> 능력·효과 텍스트 초안(485건) 중 용어집에 없는 확장 고유 개념에 쓴 임시 표기.
> 확장 룰시트 대조 시 이 목록부터 확정할 것. 총 68개 키에서 49종.

| 임시 표기 | 사용 횟수 |
|---|---|
| 워프 | 6 |
| 저주 | 4 |
| 일반 세계 | 3 |
| 신체 부위 | 2 |
| 이상 세계 | 2 |
| 빛의 세계 | 2 |
| 패배 조건 | 2 |
| 인접한 장소 | 2 |
| 세계 전환 | 2 |
| 어둠의 세계 | 2 |
| EX 카드 | 2 |
| 사후 활동 | 2 |
| 조종형 우호 무시 | 1 |
| 참극 | 1 |
| 선조의 회상 | 1 |
| 절망 카운터 | 1 |
| 지연 패배 조건 | 1 |
| 폴터가이스트 | 1 |
| 세계 수렴 | 1 |
| 사망 토큰 | 1 |
| 장소 저주 | 1 |
| 면식 토큰 | 1 |
| 모독 | 1 |
| 스펠캐스터 | 1 |
| 우호 능력 | 1 |
| 희망 카운터 | 1 |
| "특수" 룰 Y | 1 |
| 절망) | 1 |
| 희망 +1 | 1 |
| ':goodwill: 폭주' | 1 |
| 빛의 세계 / 어둠의 세계 | 1 |
| 공황 상태 | 1 |
| 광기 | 1 |
| 오버로드 | 1 |
| 배신자 | 1 |
| 폭파 협박 | 1 |
| :afterDeath: 활동 | 1 |
| 마수 | 1 |
| 괴뢰 우호 무시 | 1 |
| "카운터 제거 및 배치" 단계 명칭 | 1 |
| 미믹 | 1 |
| 사건 단계 | 1 |
| 카운터 제거 및 배치 | 1 |
| 이중 역할, 빛의 세계, 어둠의 세계 | 1 |
| 주문 | 1 |
| EX 게이지 | 1 |
| 절망 | 1 |
| 꼭두각시 우호 무시 | 1 |
| 저주 카드 | 1 |

### 2.9 확장 추리 참조표 대조 결과 — 2026-07-28

> 저본: 사용자 제공 공식 확장 추리 참조표 4종 (헌티드 스테이지 HS / 미드나이트 존 MZ / 위어드 미솔로지 WM / 미스터리 서클 MC).
> 판독 에이전트 4명 + MC 매핑 보강. 판정 152건 · 매핑 142건 · 수확 245건.

**신규 확정 반영** (17건)

| 영문 키 | 정발 표기 | 비고 |
|---|---|---|
| `Evil Contamination` | 사악한 기운의 오염 | HS 시트. 효과 일치로 대응 확인 (Foul Evil과 동일 사건의 판본 차 명칭) |
| `Mob Incidents` | 군중 사건 | 군중 사건 — 구 후보 군상 사건 정정 |
| `Mob` | 군중 | 군중 |
| `On Character Death` | 이 캐릭터 사망 시 | [이 캐릭터 사망 시] |
| `On character death` | 이 캐릭터 사망 시 | 동일 |
| `Passive` | 특성 | [특성] 태그 |
| `Only at` | 제한 | (제한: 장소) 형식 |
| `Incident step` | 사건 단계 | [사건 단계] |
| `Night: Day End` | 라운드 종료 단계 | 시트는 한밤중 구분 없이 [라운드 종료 단계]로 인쇄 |
| `Night: Loop End` | 루프 종료 시 | [루프 종료 시] |
| `Madness (4)` | 발광 (4) | 발광 — 구 후보 광기 정정 (특수 게이지 4+ 주문) |
| `Ancient Seal (3)` | 오래된 표식 (3) | 오래된 표식 — 구 후보 고대의 인장 정정 |
| `Spell of Sympathy (1)` | 감응의 주술 (1) | 감응의 주술 |
| `Victims` | 희생자 | 시트 대조 |
| `Curse cards` | 저주 카드 | 시트 대조 |
| `Always` | 항상 | 시트 대조 |
| `Loss condition: Tragedy` | 패배 조건 | 시트 대조 |

**기존 값 정정** (7건): Werewolf 늑대 인간→늑대인간(HS 시트 인쇄), 타이밍 태그 단계형 통일 — Day End→라운드 종료 단계,
Loop End·Loop ends→루프 종료 시, Loop Start→루프 시작 시, Mastermind Ability→각본가 능력 단계 (시트 능력 태그 표기 기준),
Reminiscence of the Forefathers (2)→선조의 추억 (2) (구: 선조의 회상).

**임시 표기 판정**: 저주 카드·인접한 장소·사건 단계·우호 능력·패배 조건 = 그대로 확정 / EX 게이지→특수 게이지 ·
EX 카드→특수 카드 · 선조의 회상→선조의 추억 · 광기→발광 · 고대의 인장→오래된 표식 (값 반영 완료).

**미스터리 서클(MC) 대조**: 세트 전체(룰Y 5·룰X 7·사건 11·역할)가 기존 입력값과 **전량 일치** —
사용자 1차 입력분 공식 검증 완료. 특기: `Poisoner`=바리스타 공식 확인, `The Silver Bullet`=은 총탄(띄어쓰기),
`Paranoiac` 능력 문면은 판본 간 차이 있음(영문 키 의미 우선 원칙 유지).

**해소 (2026-07-28)**: `Prime Evil`=헌티드 스테이지 / `Haunted Stage`(구판)=헌티드 스테이지 (구판) — §3.3 결정 기록 참조.
`Unsafe Trigger`=불확정 인자 χ괴 — 사용자 실물 확인으로 확정 (χ 뒤 글자 존재 확인).

**보류**: Incident trigger (명사형 공식 표기 없음), Extra Plot (공식 고유 명칭 없음 — 풀어쓰기).


---

## 3. 판본 불일치 결정 로그

영어판과 일본어(=정발 계보)의 이름이 어긋나는 항목. **여기가 이 문서의 핵심이다.**

### 3.1 이미 확인된 참극 세트 명칭 불일치

기존 `translations/ja.json`에서 일본어 번역자가 라틴 문자로 남겨둔 항목들 —
번역이 아니라 **이름 자체가 다르다는 표시**다.

| 영문 키 (사이트 원문) | 일본어판 실제 명칭 | 정발 용어 | 등급 | 결정 |
|---|---|---|---|---|
| `Haunted Stage` (Z-Man: Prime Evil) | Haunted Stage Ａ | 헌티드 스테이지 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Cosmic Mythology` | Weird Mythology | 위어드 미솔로지 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Mystery Circle` | Mystery Circle Χ | 미스터리 서클 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Basic Tragedy` | Basic Tragedy X | 기본 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `Midnight Zone` | | 미드나이트 존 | 확정 | 정발 확인 (사용자, 2026-07-23) |
| `First Steps` | | 입문 | 확정 | 정발 확인 (사용자, 2026-07-23) |

> 정발명 우선 원칙 채택 (2026-07-23). `Supernatural` / `Visual Novel` / `Another Horizon` 은 정보 없음 → 미정(영어 폴백).
> `Last Liar`=라스트 라이어, `Another Horizon R`=어나더 호라이즌 은 자체(TTS 유저 번역 참고).

### 3.2 Z-Man ↔ WizKids 명칭 차이

저장소에 이미 `translationOverrides` 구조가 있다 (`data/base-game/overrides.jsonc`).
같은 대상의 대체 명칭을 등록하면 카드 페이지의 *Alternate Card Names*에 병기된다.

| 대상 | Z-Man | WizKids | 정발 | 처리 |
|---|---|---|---|---|
| `richStudent` | Rich Man's Daughter | Rich Student | | 주 번역 = 정발, 나머지는 override |

**활용법:** 정발명과 커뮤니티 통용명이 다를 때
(예: 정발 "트래지디 루퍼" vs 통용 "트레지디 루퍼")
주 번역은 정발로 두고 통용명을 `data/<세트>/overrides.jsonc`에 `ko`로 등록하면
검색성과 정확성을 둘 다 잡을 수 있다.

```jsonc
{
  "$schema": "./translationOverrides.schema.json",
  "translationOverrides": {
    "ko": {
      "richStudent.name": ["통용 표기 A", "통용 표기 B"]
    }
  }
}
```

### 3.3 개별 결정 기록

#### 사용자 표기 결정 3건 (2026-07-28)
- `Jekyll and Hyde` (플롯): 지킬과 하이드 → **지킬 박사와 하이드** — 국내 통용 표기 (사용자 결정, 확정 유지)
- `Uploader` (캐릭터, 팬 세트): **유튜버** — 자체 (사용자 결정)
- `Extra Plot`: **엑스트라 룰 Y** — 자체 (공식 고유 명칭 없음 확인 후 사용자 승인 표기. 룰 Y/룰 X와 띄어쓰기 통일)

#### Prime Evil / Haunted Stage 동명 세트 구분 (2026-07-28)
- 배경: 일본 원판 Haunted Stage(트레일세트2, 2012)가 대폭 개정되어 신판(트레일세트2 개정 — ja 표기
  Haunted Stage Ａ/Again 계열, atwiki·bakafire 공식 세트 목록에서 신·구판 별도 확인)으로 재발매.
  Z-Man 영문판은 신판을 **Prime Evil**로 개명해 Cosmic Evil 확장(= Prime Evil + Cosmic Mythology)에 수록.
  한국 정발은 **신판(Cosmic Evil 수록본)**을 "헌티드 스테이지"로 번역 (사용자 히스토리 + BGG/판매처/bakafire 교차 확인).
  참고: ko.jsonc 스켈레톤에서 `Prime Evil` 키는 참극 세트 섹션이 아닌 플롯 섹션에 잘못 분류되어 있음 (키 자체는 정상).
- 결정: `Prime Evil`(cosmic-evil 폴더) = **헌티드 스테이지** (정발명, 공식 추리 참조표 표제) /
  `Haunted Stage`(haunted-stage 폴더, 구판) = **헌티드 스테이지 (구판)** (자체 구분 표기)
- 근거: HS 추리 참조표의 역할 능력이 cosmic-evil 데이터와 일치하고 haunted-stage 구판 변종과 불일치.
  boardgamegeek.com/boardgame/205324 (Cosmic Evil 구성), 사용자 증언
- 등급: Prime Evil 확정 / Haunted Stage (구판) 자체
- 날짜 / 결정자: 2026-07-28 / 사용자

#### Script → 시나리오 정정 (2026-07-23)
- 결정: Script=시나리오 (기존 확정 '각본'을 정정, UI 문구 7곳 연쇄 치환)
- 근거: 정발 설명서 전 구간 일관 표기 — '시나리오 모음'·'시나리오 작성 가이드'(각본가 설명서),
  '시나리오란?'·'시나리오명'(주인공 설명서). '각본'은 '각본가(Mastermind)'에만 사용됨
- 파생: `Script creation`=시나리오 작성 시. 플롯명 '악마의 시나리오'·'최악의 시나리오'와 일관
- 날짜 / 결정자: 2026-07-23 / 사용자 승인

#### 참극 세트 이름 표기 (2026-07-23)
- 결정: 축약 표기 유지 — `Basic Tragedy`=기본, `First Steps`=입문
- 근거: 설명서 본문 정식 명칭은 '참극<기본>편'·'참극<입문>편'이나, 표지·표에서는 축약형 사용.
  UI 공간과 가독성을 위해 축약형 채택 (사용자 결정)
- 대안: 정식 명칭 참극<기본>편 계열 — 필요 시 일괄 전환 가능
- 날짜 / 결정자: 2026-07-23 / 사용자

#### Agitator (역할, Another Horizon)
- 결정: 사회 운동가
- 근거: TTS 유저 번역 '선동가'가 정발 확정 `Conspiracy Theorist`=선동가와 충돌.
  정발명 우선 원칙에 따라 자체 등급인 Agitator 쪽을 개명.
  ja 원문 アジテーター의 agitate 어감(시위·주장·운동)을 살린 표현으로 사용자가 선정
- 대안: 아지테이터(음차), 활동가, 운동가, 주동자
- 등급: 자체
- 날짜 / 결정자: 2026-07-23 / 사용자

#### Tragedy Looper (게임 타이틀, UI 문구 내)
- 결정: **트래지디 루퍼** (UI 문자열 5곳 치환 완료) — ⚠️ 실물 박스 표기 확인 대기
- 근거: MTS 공식 스토어(mtsgames.kr/product/트래지디-루퍼/46) 상품명·본문·URL이 '트래지디'로 일관.
  나무위키·보드라이프 문서명 동일.
- **표기 이력:** 텀블벅 펀딩 페이지(2022)는 일관되게 '트레지디 루퍼', 현행 공식 스토어는 '트래지디 루퍼'
  (잔재 1곳 제외). 펀딩 이후 퍼블리셔가 표기를 변경한 것으로 판단 — 사용자 확인(2026-07-23).
  구 표기 '트레지디 루퍼'는 검색·커뮤니티 대응용 참고 표기로 여기 남긴다.
- 이력: 2026-07-22 라틴 유지(잠정, Claude) → 2026-07-23 스토어 표기로 치환 → 사용자 판단으로 확정
- 등급: 확정 (현행 판매처 표기 기준. 박스 실물 표기는 별도 대조하지 않음)
- 날짜 / 결정자: 2026-07-23 / 사용자

#### Extra Plot — ja.json 원본 오역 발견 (2026-07-23, Claude 조사)
- 발견: 기존 `translations/ja.json`이 `Extra Plot`을 `ルールX`(=Sub Plot과 동일)로 옮겼으나,
  코드·데이터 검증 결과 이 슬롯은 **추가 메인 플롯(룰Y 계열)** 이다.
  근거: `src/data.ts` twistedTruth 규칙 원문 "chooses one \"extra\" main plot" /
  "the original main plot is replaced by the \"extra\" main plot", 지정 값(bloodyRites 등)이 전부 mainPlots 목록 소속.
- 조치: ko 후보는 "엑스트라 룰Y"(추정). ja.json 오역은 upstream 이슈 후보.
- 날짜 / 결정자: 2026-07-23 / Claude (용어 조사 패스, 검증 2인 교차)

#### Hero A / Hero B / Hero C
- 결정: 주인공 A / 주인공 B / 주인공 C
- 근거: Protagonists=주인공 확정에서 파생. 홈 화면 카드 라벨
- 등급: 추정 (정발 주인공 카드 표기 확인 필요)
- 날짜 / 결정자: 2026-07-22 / Claude (UI 번역 패스)

새 항목은 아래 형식으로 계속 추가한다.

```
#### <영문 키>
- 결정: 
- 근거: 
- 대안: 
- 등급: 
- 날짜 / 결정자: 
```

---

## 4. 문체 규칙

2026-07-23 정발 설명서(주인공 설명서 p30~32 역할·사건·룰 카드 설명) 문체 대조로 확정.

| 항목 | 규칙 | 예시 |
|---|---|---|
| 능력·효과 텍스트 어미 | **합니다체** (정발 설명서 문체) | "같은 장소에 있는 캐릭터 1명에 불안 카운터 1개를 놓을 수 있습니다." |
| 서술어 대응 | kill=사망시킵니다, dies=사망합니다, lose=패배합니다, place=놓습니다, add=추가합니다, remove=제거합니다, move=이동시킵니다 | 정발 설명서 p30~31 |
| Optional / Mandatory 접두 | `[선택]` / `[강제]` | "[강제] 이 캐릭터가 사망할 때, 주인공은 패배합니다." |
| 횟수 표기 | "1루프당 1회." (문장 끝 별도 표기) | 정발 p30 불온한 소문 |
| 카운터 표기 | 음모/불안/우호 카운터, 「음모 금지」 카드 | |
| 카드·플롯·사건명 인용 | 「낫표」 | "「나비의 날갯짓」이 발생한 적이 있다면" (p32) |
| 숫자 표기 | 아라비아 숫자 + 단위 | "음모 카운터가 2개 이상인 경우" |
| 조사 처리 | 받침에 따른 이형태 수동 처리 (엔진에 조사 로직 없음) | |
| 카드 문구 길이 | 카드 공간이 좁다 — 같은 뜻이면 짧은 쪽 | |
| `:token:` | 절대 번역/삭제 금지 | `:paranoia:` 그대로 |
| `{placeholder}` | 절대 번역/삭제 금지, 어순만 조정 | `{days} per {type}` |
| 마크다운 링크 | **원문에 없던 링크 추가 금지** (번역 전체가 폐기됨) | |
| 기본판 능력 텍스트 | 번역하지 않고 **정발 설명서 문구를 저본으로 이식** (키 구조·토큰 유지 범위 내) | 역할 p30~31, 사건 p31·36, 룰 p32~33 |

---

## 5. 각본 저본 기록

각본 텍스트는 정발 참고 대상이 아니다. 어느 언어에서 번역했는지만 남긴다.

| 각본 키 | 저본 | 번역자 | 날짜 |
|---|---|---|---|
| `A Little Friend.BakaFire+R.*` | ja | | |
| | | | |

---

## 6. 알려진 함정 (실측 확인됨)

1. **아포스트로피가 두 종류다.**
   데이터 원문은 `Rich Man’s Daughter` (U+2019 곡선따옴표)를 쓴다.
   기존 `zh-TW.json`은 `Rich Man's Daughter` (U+0027 직선따옴표)로 적혀 있어
   **이 항목은 실제로 매칭되지 않는다.** 키는 반드시 복사해서 넣을 것.
   `scripts/check-ko-translations.mjs`로 일괄 검증할 수 있다.

2. **중복 키는 먼저 읽힌 파일이 이긴다.** 콘솔 경고만 뜨고 조용히 무시된다.
   전역(`translations/ko.jsonc`)과 세트별 파일에 같은 키를 넣지 말 것.

3. **`data/base-game/translation.de.jsonc`에 트레일링 콤마가 있어 파싱 실패 중이다.**
   빌드가 예외를 잡아 조용히 건너뛴다. 값이 전부 빈 문자열이라 실害는 없지만,
   한 줄 고치는 PR을 따로 올리면 좋다.

4. **`translationExists`는 값의 길이로 판정한다.** 빈 문자열 = 미번역. 안전하다.

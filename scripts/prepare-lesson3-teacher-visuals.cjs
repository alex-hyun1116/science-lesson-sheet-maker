const fs = require('fs');
const path = require('path');

const inputPath = 'C:/Users/meck9/.codex/attachments/3c03dd8e-4c7c-47f0-813a-a35fd4f571c9/pasted-text.txt';
const outputPath = path.resolve(__dirname, '../data/lesson3-gyeonggibuk-import-ready.json');

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

function visual(name, svg) {
  return {
    id: `teacher-visual-${name}`,
    name,
    type: 'image/svg+xml',
    dataUrl: svgDataUrl(svg),
  };
}

const commonStyle = `
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#25352f"/>
    </marker>
    <marker id="blueArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#3568a9"/>
    </marker>
    <marker id="redArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#b74b3f"/>
    </marker>
    <style>
      .title{font:800 30px Arial,'Malgun Gothic',sans-serif;fill:#1f2a27}
      .sub{font:600 17px Arial,'Malgun Gothic',sans-serif;fill:#40564b}
      .label{font:800 20px Arial,'Malgun Gothic',sans-serif;fill:#1f2a27}
      .small{font:700 15px Arial,'Malgun Gothic',sans-serif;fill:#40564b}
      .tiny{font:600 13px Arial,'Malgun Gothic',sans-serif;fill:#52645c}
      .box{fill:#fbfdfb;stroke:#25352f;stroke-width:2.2}
      .soft{fill:#f4f8f5;stroke:#cfdcd2;stroke-width:1.7}
      .green{fill:#eaf6ef;stroke:#2d8d6a;stroke-width:2.2}
      .blue{fill:#e7f0ff;stroke:#3568a9;stroke-width:2.2}
      .red{fill:#ffe8e2;stroke:#b74b3f;stroke-width:2.2}
      .amber{fill:#fff4db;stroke:#9a6a1f;stroke-width:2.2}
      .purple{fill:#f0e9ff;stroke:#6d55b8;stroke-width:2.2}
      .line{stroke:#25352f;stroke-width:3;fill:none;marker-end:url(#arrow)}
      .blueLine{stroke:#3568a9;stroke-width:3;fill:none;marker-end:url(#blueArrow)}
      .redLine{stroke:#b74b3f;stroke-width:3;fill:none;marker-end:url(#redArrow)}
      .dash{stroke:#718078;stroke-width:2;stroke-dasharray:7 7;fill:none}
    </style>
  </defs>`;

function textLines(lines, x, y, className = 'small', gap = 24, anchor = 'middle') {
  return lines.map((line, index) => `<text x="${x}" y="${y + index * gap}" text-anchor="${anchor}" class="${className}">${line}</text>`).join('\n');
}

function problem1Svg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="860" viewBox="0 0 1280 860">
  ${commonStyle}
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="48" y="58" class="title">인공 이자와 밀도 장치 대응 흐름</text>
  <text x="48" y="90" class="sub">핵심은 측정 → 기준 비교 → 필요한 작용 → 다시 측정으로 이어지는 음성 피드백이다.</text>

  <rect x="60" y="135" width="520" height="210" rx="22" class="green"/>
  <text x="320" y="175" text-anchor="middle" class="label">몸속 혈당 조절</text>
  ${textLines(['혈당 측정', '기준값 126과 비교', '혈당 높음 → 인슐린 주입', '혈당 감소 → 다시 측정'], 320, 215, 'small', 30)}

  <rect x="700" y="135" width="520" height="210" rx="22" class="blue"/>
  <text x="960" y="175" text-anchor="middle" class="label">실험 장치 조절</text>
  ${textLines(['B 높이 측정', '기준선 h와 비교', 'B가 낮음 → 펌프 ON', 'A 유입 → 용액 밀도 증가 → B 상승'], 960, 215, 'small', 30)}
  <path d="M580 240 C620 240,660 240,700 240" class="line"/>
  <text x="640" y="222" text-anchor="middle" class="tiny">대응시키기</text>

  <rect x="90" y="420" width="300" height="120" rx="18" class="amber"/>
  <text x="240" y="462" text-anchor="middle" class="label">인슐린</text>
  <text x="240" y="497" text-anchor="middle" class="small">필요할 때 투입되는 조절 물질</text>
  <path d="M390 480 L505 480" class="line"/>
  <rect x="505" y="420" width="300" height="120" rx="18" class="amber"/>
  <text x="655" y="462" text-anchor="middle" class="label">액체 A</text>
  <text x="655" y="497" text-anchor="middle" class="small">필요할 때 펌프로 들어가는 물질</text>

  <rect x="90" y="590" width="300" height="120" rx="18" class="purple"/>
  <text x="240" y="632" text-anchor="middle" class="label">이자</text>
  <text x="240" y="667" text-anchor="middle" class="small">분비 여부를 조절하는 기관</text>
  <path d="M390 650 L505 650" class="line"/>
  <rect x="505" y="590" width="360" height="120" rx="18" class="purple"/>
  <text x="685" y="632" text-anchor="middle" class="label">제어기 + 펌프</text>
  <text x="685" y="667" text-anchor="middle" class="small">측정값에 따라 A 투입 여부 결정</text>

  <rect x="920" y="430" width="260" height="250" rx="18" class="soft"/>
  <text x="1050" y="468" text-anchor="middle" class="label">판서 핵심</text>
  ${textLines(['B 높이 &lt; h → 펌프 ON', 'A 밀도 &gt; 물', '용액 밀도 ↑ → B 상승', 'B 높이 ≥ h → 펌프 OFF'], 1050, 512, 'small', 31)}
  </svg>`;
}

function problem2Svg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="820" viewBox="0 0 1280 820">
  ${commonStyle}
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="48" y="58" class="title">포도당 산화 반응과 인슐린 주사 기준</text>
  <text x="48" y="90" class="sub">㉠은 외워서 맞히는 것이 아니라 원자 수 보존과 질량 보존으로 도출한다.</text>

  <rect x="70" y="140" width="1140" height="135" rx="20" class="green"/>
  <text x="640" y="185" text-anchor="middle" class="label">C₆H₁₂O₆ + O₂ → C₆H₁₀O₆ + ㉠</text>
  <text x="640" y="225" text-anchor="middle" class="small">왼쪽 H 12, O 8 / 오른쪽 글루코노락톤 H 10, O 6 → 남는 원자 H 2, O 2</text>
  <text x="640" y="255" text-anchor="middle" class="label">따라서 ㉠ = H₂O₂</text>

  <rect x="95" y="360" width="260" height="110" rx="18" class="blue"/>
  <text x="225" y="402" text-anchor="middle" class="label">질량비</text>
  <text x="225" y="435" text-anchor="middle" class="small">90 : 16 : 89 : x</text>
  <path d="M355 415 L475 415" class="line"/>
  <rect x="475" y="360" width="300" height="110" rx="18" class="amber"/>
  <text x="625" y="402" text-anchor="middle" class="label">질량 보존</text>
  <text x="625" y="435" text-anchor="middle" class="small">90 + 16 = 89 + x → x = 17</text>
  <path d="M775 415 L895 415" class="line"/>
  <rect x="895" y="360" width="290" height="110" rx="18" class="red"/>
  <text x="1040" y="402" text-anchor="middle" class="label">포도당 : H₂O₂</text>
  <text x="1040" y="435" text-anchor="middle" class="small">90 : 17</text>

  <rect x="160" y="560" width="960" height="150" rx="22" class="soft"/>
  <text x="640" y="603" text-anchor="middle" class="label">혈당 126 mg/mL, 혈액 1 mL → 포도당 126 mg</text>
  <text x="640" y="645" text-anchor="middle" class="title">126 × 17 / 90 = 23.8 mg</text>
  <text x="640" y="688" text-anchor="middle" class="small">23.8 mg은 경계량이다. 실제 주사 조건은 ㉠의 양이 23.8 mg보다 클 때이다.</text>
  </svg>`;
}

function problem3Svg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="880" viewBox="0 0 1280 880">
  ${commonStyle}
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="48" y="58" class="title">영양소 검출 반응으로 C·E·F 판별하기</text>
  <text x="48" y="90" class="sub">먼저 두 검출 반응의 의미를 고정하고, 표의 O/X/-를 차례로 해석한다.</text>

  <rect x="70" y="140" width="500" height="150" rx="22" class="blue"/>
  <text x="320" y="185" text-anchor="middle" class="label">아이오딘-아이오딘화 칼륨</text>
  <text x="320" y="225" text-anchor="middle" class="title">녹말 검출</text>
  <text x="320" y="260" text-anchor="middle" class="small">O이면 녹말이 남아 있다고 본다.</text>

  <rect x="710" y="140" width="500" height="150" rx="22" class="red"/>
  <text x="960" y="185" text-anchor="middle" class="label">베네딕트 + 가열</text>
  <text x="960" y="225" text-anchor="middle" class="title">포도당·엿당 검출</text>
  <text x="960" y="260" text-anchor="middle" class="small">O이면 환원당이 있다고 본다.</text>

  <rect x="80" y="390" width="330" height="150" rx="18" class="soft"/>
  <text x="245" y="432" text-anchor="middle" class="label">C</text>
  <text x="245" y="470" text-anchor="middle" class="small">베네딕트 X</text>
  <text x="245" y="505" text-anchor="middle" class="title">정상 혈당인 사람의 오줌</text>

  <rect x="475" y="390" width="330" height="150" rx="18" class="green"/>
  <text x="640" y="432" text-anchor="middle" class="label">E</text>
  <text x="640" y="470" text-anchor="middle" class="small">아이오딘 X + 베네딕트 O</text>
  <text x="640" y="505" text-anchor="middle" class="title">당뇨병 환자의 오줌</text>

  <rect x="870" y="390" width="330" height="150" rx="18" class="amber"/>
  <text x="1035" y="432" text-anchor="middle" class="label">F</text>
  <text x="1035" y="470" text-anchor="middle" class="small">아이오딘 O + 베네딕트 O</text>
  <text x="1035" y="505" text-anchor="middle" class="title">녹말 + 소화제 용액</text>

  <path d="M320 290 C300 340,270 360,245 390" class="blueLine"/>
  <path d="M960 290 C850 345,730 360,640 390" class="redLine"/>
  <path d="M320 290 C540 345,840 350,1035 390" class="line"/>
  <path d="M960 290 C1005 330,1025 360,1035 390" class="redLine"/>

  <rect x="150" y="640" width="980" height="120" rx="22" class="purple"/>
  <text x="640" y="682" text-anchor="middle" class="label">수업 중 강조</text>
  <text x="640" y="720" text-anchor="middle" class="small">소화가 일어났다는 말은 녹말이 완전히 사라졌다는 뜻이 아니다.</text>
  <text x="640" y="750" text-anchor="middle" class="small">그래서 F는 녹말도 남고, 엿당도 생겨 두 반응이 모두 O가 될 수 있다.</text>
  </svg>`;
}

const updates = {
  '1': {
    visuals: [visual('인공 이자와 밀도 장치 대응 흐름.svg', problem1Svg())],
    visualNotes: [
      '왼쪽은 실제 혈당 조절, 오른쪽은 실험 장치 조절로 나누어 대응 관계를 보여준다.',
      '칠판에는 B 높이<h → 펌프 ON → A 유입 → 용액 밀도 증가 → B 상승만 크게 적는다.',
    ],
    teachingOrder: [
      '그림 1의 인공 이자를 측정 → 기준 비교 → 인슐린 주입 여부 결정 → 다시 측정의 구조로 정리한다.',
      '그림 2에서 인슐린에 해당하는 것은 실제로 투입되는 액체 A임을 대응시킨다.',
      '이자에 해당하는 것은 A 자체가 아니라 B 높이를 측정하고 펌프를 조절하는 제어기·펌프 시스템임을 잡아준다.',
      'B가 떠 있는 높이는 B의 질량 변화가 아니라 주변 혼합 용액의 밀도 변화로 달라진다는 점을 설명한다.',
      'B 높이<h이면 A를 넣어 용액 밀도를 키우고, B가 기준 이상이면 펌프를 멈추는 피드백으로 마무리한다.',
      '마지막 풍선 문항은 기체가 액체보다 온도에 따른 부피 변화가 크다는 비교로 냉각을 선택하게 한다.',
    ],
    questionsToAsk: [
      'Q. 인슐린은 혈당이 높을 때 어떤 방향으로 작용할까? / A. 혈당을 낮추는 방향으로 작용한다.',
      'Q. 장치에서 인슐린처럼 필요할 때 투입되는 것은 무엇일까? / A. 액체 A이다.',
      'Q. 이자는 A일까, A를 조절하는 장치일까? / A. A를 조절하는 제어기·펌프 시스템이다.',
      'Q. 용액의 밀도가 커지면 같은 B는 더 뜰까, 더 가라앉을까? / A. 더 위로 뜬다.',
      'Q. 풍선을 가라앉히려면 가열과 냉각 중 무엇이 유리할까? / A. 냉각이다. 기체가 수축해 풍선 평균 밀도가 커진다.',
    ],
    boardPoints: [
      '혈당↑ → 인슐린 → 혈당↓',
      '인슐린 ↔ 액체 A',
      '이자 ↔ 제어기 + 펌프',
      'B 높이<h → 펌프 ON → A 유입 → 용액 밀도↑ → B 상승',
      'A 밀도 > 물, B 밀도 < 물',
      '냉각 → 기체 수축 → 풍선 평균 밀도↑ → 하강',
    ],
  },
  '2': {
    visuals: [visual('포도당 산화 반응과 주사 기준.svg', problem2Svg())],
    visualNotes: [
      '반응식에서 남는 원자를 세어 H2O2를 찾는 과정을 크게 보여준다.',
      '23.8mg은 바로 주사량이 아니라 주사 여부를 나누는 경계량임을 표시한다.',
    ],
    teachingOrder: [
      '화학식을 외워서 풀지 말고 반응 전후 원자 수를 세는 문제라고 안내한다.',
      '반응물 전체와 C6H10O6의 H, O 개수를 비교해 ㉠=H2O2를 도출한다.',
      '질량비 90:16:89:x는 질량 보존으로 x=17이 된다는 점을 계산한다.',
      '포도당과 ㉠의 질량비 90:17을 혈당 126mg/mL, 혈액 1mL 조건에 연결한다.',
      '126×17/90=23.8mg을 구한 뒤, 이 값은 경계량이고 실제 주사 조건은 23.8mg보다 클 때라고 구분한다.',
    ],
    questionsToAsk: [
      'Q. 반응 전후에 원자 자체가 사라질 수 있을까? / A. 없다. 원자의 종류와 수는 보존된다.',
      'Q. C6H12O6+O2에서 산소 원자는 모두 몇 개일까? / A. 8개이다.',
      'Q. C6H10O6를 만들고 남는 H와 O는 각각 몇 개일까? / A. H 2개, O 2개이다.',
      'Q. 90+16=89+x에서 x는 얼마일까? / A. 17이다.',
      'Q. 23.8mg에서 바로 주사한다고 말해도 될까? / A. 아니다. 23.8mg은 경계량이고, 초과할 때 주사한다.',
    ],
    boardPoints: [
      'C6H12O6 + O2 → C6H10O6 + H2O2',
      'H: 12 → 10 + 2',
      'O: 8 → 6 + 2',
      '90 + 16 = 89 + x → x=17',
      '126×17/90 = 23.8mg',
      '주사 조건: ㉠ > 23.8mg',
    ],
  },
  '3': {
    visuals: [visual('영양소 검출 반응 판별 도식.svg', problem3Svg())],
    visualNotes: [
      '아이오딘 반응과 베네딕트 반응을 먼저 고정한 뒤 C, E, F를 역추론한다.',
      'F는 소화가 일부 진행된 상태라 녹말과 엿당이 함께 있을 수 있음을 그림으로 보여준다.',
    ],
    teachingOrder: [
      '표를 바로 풀지 말고 아이오딘은 녹말, 베네딕트는 포도당·엿당을 찾는 검사라고 먼저 적는다.',
      '정상 소변과 당뇨병 소변의 차이는 베네딕트 반응으로 드러난다는 점을 잡아준다.',
      'C는 베네딕트 X이므로 정상 혈당인 사람의 오줌으로 판별한다.',
      'E는 아이오딘 X, 베네딕트 O이므로 녹말은 없고 포도당이 있는 당뇨병 환자의 오줌으로 판별한다.',
      'F는 아이오딘 O, 베네딕트 O이므로 녹말 일부가 남아 있고 소화로 엿당도 생긴 녹말+소화제 용액으로 설명한다.',
      '마지막에 -는 음성이 아니라 기록 못 함이라는 점을 강조해 표 해석 실수를 막는다.',
    ],
    questionsToAsk: [
      'Q. 아이오딘 반응으로 찾는 영양소는 무엇일까? / A. 녹말이다.',
      'Q. 베네딕트 반응으로 이 실험에서 찾을 수 있는 것은 무엇일까? / A. 포도당과 엿당이다.',
      'Q. 당뇨병 환자의 소변은 어떤 반응이 양성일까? / A. 포도당 때문에 베네딕트 반응이 양성이다.',
      'Q. 소화제를 넣으면 녹말이 5분 안에 반드시 전부 사라질까? / A. 아니다. 일부 녹말이 남을 수 있다.',
      'Q. 표의 -는 X와 같은 뜻일까? / A. 아니다. 기록하지 못했다는 뜻이다.',
    ],
    boardPoints: [
      '아이오딘 → 녹말',
      '베네딕트+가열 → 포도당·엿당',
      'C: 베네딕트 X → 정상 소변',
      'E: 아이오딘 X, 베네딕트 O → 당뇨병 소변',
      'F: 아이오딘 O, 베네딕트 O → 녹말+소화제',
      '- = 기록 못 함, X = 변화 없음',
    ],
  },
};

for (const problem of data.problems) {
  const update = updates[String(problem.problemNumber)];
  if (!update) continue;
  problem.teacherGuide = {
    ...(problem.teacherGuide || {}),
    opening: problem.teacherGuide?.opening || '',
    teachingOrder: update.teachingOrder,
    questionsToAsk: update.questionsToAsk,
    boardPoints: update.boardPoints,
    visualNotes: update.visualNotes,
    visuals: update.visuals,
    emphasis: problem.teacherGuide?.emphasis || [],
  };
}

fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log(outputPath);
for (const problem of data.problems) {
  console.log(`${problem.problemNumber}. visuals=${problem.teacherGuide.visuals.length}, order=${problem.teacherGuide.teachingOrder.length}, qa=${problem.teacherGuide.questionsToAsk.length}`);
}

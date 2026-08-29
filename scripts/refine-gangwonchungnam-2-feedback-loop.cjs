const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const statePath = path.join(root, 'data', 'app-state.json');
const backupPath = path.join(root, 'data', 'app-state.before-gangwonchungnam-2-loop-refine-20260828.json');

const payload = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const state = payload.state || payload;

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(statePath, backupPath);
}

const problem = state.problems.find((item) => item.problemNumber === '강원충남-2');
if (!problem) throw new Error('강원충남-2 문제를 찾지 못했습니다.');

problem.questionSummary = '온실기체 증가, 해수 온도 상승, 기체 용해도 감소, 바다의 이산화탄소 방출이 서로를 강화해 바다 온도가 다시 올라가는 순환 고리를 설명하고, 에너지제로하우스 요소를 생산과 절약 기준으로 분류하며, 남중고도로 처마와 창문 크기를 설계하는 문제이다.';

const q1 = problem.subQuestions.find((item) => item.label === '1');
if (!q1) throw new Error('1번 소문항을 찾지 못했습니다.');

q1.solutionSteps = [
  '바다 온도가 높아지면 기체의 용해도가 낮아진다.',
  '기체의 용해도가 낮아지면 바다에 녹아 있던 이산화탄소가 대기 중으로 방출된다.',
  '대기 중 이산화탄소가 증가하면 온실효과가 강해진다.',
  '온실효과가 강해지면 지표와 해수의 온도가 더 올라간다.',
  '그 결과 바다 온도가 다시 올라가고, 다시 이산화탄소 방출이 늘어나는 순환 고리가 형성된다.',
  '이 과정에서 따뜻한 바다가 밤에도 열을 방출하고 기온 하강이 억제되어 열대야도 증가할 수 있다.',
];
q1.shortAnswer = '바다 온도 상승 → CO2 용해도 감소 → CO2 대기 방출 → 온실효과 증가 → 지표·해수 온도 상승 → 바다 온도 재상승의 순환 고리 형성.';
q1.finalAnswer = '바다의 온도가 높아지면 기체의 용해도가 낮아져 바다에 녹아 있던 이산화탄소가 대기 중으로 방출된다. 대기 중 이산화탄소가 많아지면 온실효과가 강해지고, 그 결과 지표와 해수의 온도가 더 올라간다. 이로 인해 바다 온도가 다시 올라가면서 이산화탄소 방출과 온실효과가 반복적으로 강화되는 순환 고리가 형성된다. 또한 따뜻해진 바다는 밤에도 열을 대기로 방출하므로 기온이 충분히 낮아지지 않아 열대야가 증가할 수 있다.';

problem.conceptFlows = [
  {
    title: '온실효과와 바다 온도 상승의 순환 고리',
    steps: [
      '바다 온도 상승',
      '기체 용해도 감소',
      '녹아 있던 CO2가 대기 중으로 방출',
      '대기 중 온실기체 증가',
      '온실효과 증가',
      '지표와 해수 온도 상승',
      '바다 온도 다시 상승',
      'CO2 방출이 다시 증가',
    ],
  },
  ...(problem.conceptFlows || []).filter((flow) => !String(flow.title || '').includes('온실') && !String(flow.title || '').includes('해수')),
];

problem.clues = [
  { clue: '바다 온도 상승', concept: '기체 용해도 감소', reason: '물의 온도가 높아질수록 CO2 같은 기체는 물에 덜 녹는다.' },
  { clue: '바다에 녹아 있던 이산화탄소', concept: '대기 중 CO2 방출', reason: '용해도가 낮아지면 녹아 있던 기체 일부가 물 밖으로 나온다.' },
  { clue: '대기 중 이산화탄소 증가', concept: '온실효과 증가', reason: 'CO2는 대표적인 온실기체라 지구 복사 에너지 흡수를 늘린다.' },
  { clue: '온실효과 증가', concept: '바다 온도 상승 순환 고리', reason: '온도가 올라간 결과가 다시 CO2 방출을 늘려 원인을 강화한다.' },
  { clue: '열대야 증가', concept: '밤 기온 하강 억제', reason: '따뜻한 바다와 강해진 온실효과 때문에 밤에도 기온이 충분히 떨어지지 않는다.' },
  { clue: '에너지 생산', concept: '㉠ 풍력, ㉣ 지열, ㉥ 태양열', reason: '자연에너지로 새 에너지를 얻는 요소이다.' },
  { clue: '에너지 절약', concept: '㉡ 고단열 벽체, ㉢ 폐열 회수, ㉤ 3중창', reason: '열 손실을 줄이거나 버려지는 열을 다시 이용하는 요소이다.' },
  { clue: '남중고도 76°와 29°', concept: '처마와 창문 길이 계산', reason: '여름 차단 조건과 겨울 유입 조건을 각각 삼각비로 계산한다.' },
];

problem.commonMistakes = [
  '열대야만 결론으로 쓰고 순환 고리를 빼먹는 것. 이 문제의 핵심은 바다 온도 상승 → CO2 방출 → 온실효과 증가 → 바다 온도 재상승의 되먹임 구조이다.',
  '바다 온도가 올라가면 이산화탄소가 더 잘 녹는다고 생각하는 것. 기체는 일반적으로 온도가 높아질수록 물에 덜 녹는다.',
  '폐열 회수를 에너지 생산으로 분류하는 것. 폐열 회수는 버려지는 열을 다시 이용해 에너지 손실을 줄이는 절약 요소이다.',
  '지열 발전을 절약 요소로 분류하는 것. 지열 발전은 지구 내부의 열을 이용해 에너지를 생산하는 요소이다.',
  '남중고도를 수직선과 이루는 각으로 사용하는 것. 남중고도는 지평선과 태양 방향이 이루는 각이다.',
  '76°와 29°의 탄젠트 값을 반대로 사용하는 것. 여름철 높은 남중고도 76°는 직사광 차단 조건, 겨울철 낮은 남중고도 29°는 직사광 유입 조건에 쓴다.',
];

if (problem.teacherGuide) {
  problem.teacherGuide.boardPoints = [
    '바다 온도 상승 → 기체 용해도 감소 → CO2 방출 → 온실효과 증가 → 지표·해수 온도 상승 → 바다 온도 재상승',
    '순환 고리: 바다 온도 상승이 다시 CO2 방출을 늘리는 되먹임',
    '열대야: 따뜻한 바다의 열 방출 + 온실효과로 밤 기온 하강 억제',
    '생산: ㉠ 풍력, ㉣ 지열, ㉥ 태양열',
    '절약: ㉡ 고단열 벽체, ㉢ 폐열 회수, ㉤ 3중창',
  ];
}

problem.updatedAt = new Date().toISOString();
payload.exportedAt = new Date().toISOString();

fs.writeFileSync(statePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(q1.shortAnswer);
console.log(q1.finalAnswer);
console.log(`backup ${backupPath}`);

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const statePath = path.join(root, 'data', 'app-state.json');
const enrichedPath = path.join(root, 'data', 'lesson3-gyeonggibuk-import-ready.json');
const backupPath = path.join(root, 'data', 'app-state.before-lesson3-teacher-visuals-20260829.json');

const payload = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const state = payload.state || payload;
const enriched = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(statePath, backupPath);
}

const workbook = state.workbooks.find((item) => item.title === enriched.workbookTitle || item.title.includes('경기북'));
if (!workbook) {
  throw new Error('앱 안에서 3강 경기북과학고 문제집을 찾지 못했습니다.');
}

const enrichedByNumber = new Map(enriched.problems.map((problem) => [String(problem.problemNumber), problem]));
const problems = state.problems.filter((problem) => problem.workbookId === workbook.id);

for (const problem of problems) {
  const source = enrichedByNumber.get(String(problem.problemNumber));
  if (!source?.teacherGuide) continue;

  problem.teacherGuide = {
    ...(problem.teacherGuide || {}),
    opening: source.teacherGuide.opening || problem.teacherGuide?.opening || '',
    teachingOrder: source.teacherGuide.teachingOrder || [],
    questionsToAsk: source.teacherGuide.questionsToAsk || [],
    boardPoints: source.teacherGuide.boardPoints || [],
    visualNotes: source.teacherGuide.visualNotes || [],
    visuals: source.teacherGuide.visuals || [],
    emphasis: source.teacherGuide.emphasis || problem.teacherGuide?.emphasis || [],
  };
  problem.updatedAt = new Date().toISOString();
}

payload.exportedAt = new Date().toISOString();
fs.writeFileSync(statePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`updated workbook: ${workbook.title}`);
for (const problem of problems) {
  console.log(`${problem.problemNumber}. ${problem.title} | visuals=${problem.teacherGuide?.visuals?.length || 0} | order=${problem.teacherGuide?.teachingOrder?.length || 0}`);
}
console.log(`backup: ${backupPath}`);

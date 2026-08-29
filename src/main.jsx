import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardPaste,
  Eye,
  FilePlus2,
  FileText,
  FlaskConical,
  Globe2,
  ImagePlus,
  Layers3,
  Microscope,
  Pencil,
  Plus,
  Printer,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import './styles.css';

const DB_NAME = 'mathfarm-science-lessons';
const DB_VERSION = 1;
const GROUPS = ['생명/화학', '물리/지구'];
const SUBJECT_CONFIG = {
  생명: { group: '생명/화학', className: 'bio', Icon: Microscope },
  화학: { group: '생명/화학', className: 'chem', Icon: FlaskConical },
  물리: { group: '물리/지구', className: 'physics', Icon: Atom },
  지구: { group: '물리/지구', className: 'earth', Icon: Globe2 },
};
const SUBJECTS = Object.keys(SUBJECT_CONFIG);
const DEFAULT_SUBJECT = '화학';
const DEFAULT_GROUP = SUBJECT_CONFIG[DEFAULT_SUBJECT].group;
const WORKBOOK_SCHEMA = `{
  "workbookTitle": "2026 서울과학고 화학 기출",
  "school": "서울과학고",
  "year": "2026",
  "group": "생명/화학",
  "subjects": ["화학"],
  "problems": [
    {
      "problemNumber": "1",
      "title": "이산화 탄소의 용해도와 용액의 밀도 변화",
      "subject": "화학",
      "unit": "용해도 · 밀도 · 부력",
      "sourcePages": [3, 4],
      "questionSummary": "이 문제는 기체의 용해도, 질량 보존, 밀도 변화를 연결해 공의 위치 변화를 판단하는 문제이다.",
      "keywords": ["기체의 용해도", "질량 보존", "밀도", "부력"],
      "concepts": [
        {
          "name": "기체의 용해도",
          "definition": "특정 온도와 압력에서 일정량의 용매에 최대로 녹을 수 있는 기체의 양이다.",
          "easyExplanation": "물 100 g당 녹는 양을 기준으로 읽고, 물의 양이 달라지면 비례해서 계산한다.",
          "why": "용액 속에 남는 기체의 질량을 구해야 전체 질량과 기체 상태의 양을 판단할 수 있다.",
          "application": "물 1000 g이므로 그래프 값을 10배 하여 녹아 있는 CO2 질량을 구한다.",
          "caution": "그래프 단위가 물 100 g 기준인지 반드시 확인한다."
        }
      ],
      "clues": [
        {
          "clue": "t1℃, 1기압에서 이산화 탄소 포화 수용액",
          "concept": "용해도 그래프와 포화 용액",
          "reason": "포화 상태이므로 그래프의 최대 용해량을 그대로 적용한다."
        }
      ],
      "conceptFlows": [
        {
          "title": "CO2 질량 계산 흐름",
          "steps": ["처음 용액 속 CO2", "A 부분 기체 CO2", "전체 CO2", "실험 조건에서 녹은 CO2", "남은 기체 CO2"]
        }
      ],
      "subQuestions": [
        {
          "label": "1-1",
          "question": "그림 4의 A 부분에 CO2 입자를 몇 개 그려야 하는가?",
          "solutionSteps": ["처음 전체 CO2 질량을 구한다.", "실험 조건에서 용액에 녹은 CO2 질량을 뺀다.", "그림 3의 입자 수 비례 관계를 이용한다."],
          "shortAnswer": "A 부분에 CO2 입자 9개",
          "finalAnswer": "그림 3에서 0.5 g이 입자 5개이므로 0.9 g은 입자 9개로 나타낸다."
        }
      ],
      "commonMistakes": ["물 100 g 기준 용해도 값을 물 1000 g에도 그대로 적용하는 것"],
      "teacherGuide": {
        "opening": "이 문제는 앞부분은 용해도와 질량 보존, 뒷부분은 밀도 비교 문제라고 먼저 구조를 잡아준다.",
        "teachingOrder": ["용해도 단위 확인", "전체 CO2 질량 계산", "용액 밀도 변화 비교", "공의 위치 판단"],
        "questionsToAsk": ["그래프의 0.25 g은 물 몇 g 기준일까?", "처음 A 부분의 CO2도 전체 질량에 포함될까?"],
        "boardPoints": ["물 100 g 기준 → 물 1000 g이면 10배", "공 정지 → 공의 밀도 = 처음 용액의 밀도"],
        "emphasis": ["조건을 하나씩 계산에 반영해야 한다."]
      }
    }
  ]
}`;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('state')) db.createObjectStore('state');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadState() {
  try {
    const response = await fetch('/api/state');
    if (response.ok) {
      const payload = await response.json();
      if (payload) return restoreBackupPayload(payload);
    }
  } catch (error) {
    console.warn('파일 저장소를 읽지 못해 브라우저 저장소를 확인합니다.', error);
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readonly');
    const request = tx.objectStore('state').get('app');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function saveState(state) {
  try {
    const payload = await buildBackupPayload(state);
    const response = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = new Error(await response.text());
      error.status = response.status;
      throw error;
    }
  } catch (error) {
    console.warn('파일 저장소에 저장하지 못해 브라우저 저장소에만 저장합니다.', error);
    if (error.status === 409) return;
  }

  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readwrite');
    tx.objectStore('state').put(state, 'app');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function fileToStored(file) {
  if (!file) return null;
  return { id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, blob: file };
}

function filesToStored(fileList) {
  return Array.from(fileList || []).map(fileToStored).filter(Boolean);
}

function fileUrl(file) {
  if (!file) return '';
  if (file.blob) return URL.createObjectURL(file.blob);
  return file.dataUrl || '';
}

function blobToDataUrl(blob) {
  if (!blob) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function storedFileToBackup(file) {
  if (!file) return null;
  return {
    id: file.id || crypto.randomUUID(),
    name: file.name || '첨부파일',
    type: file.type || 'application/octet-stream',
    size: file.size || file.blob?.size || 0,
    dataUrl: await blobToDataUrl(file.blob),
  };
}

async function backupFileToStored(file) {
  if (!file?.dataUrl) return null;
  const response = await fetch(file.dataUrl);
  const blob = await response.blob();
  return {
    id: file.id || crypto.randomUUID(),
    name: file.name || '첨부파일',
    type: file.type || blob.type,
    size: file.size || blob.size,
    blob,
  };
}

async function buildBackupPayload(state) {
  const workbooks = await Promise.all(state.workbooks.map(async (workbook) => ({
    ...workbook,
    sourceFiles: await Promise.all(getSourceFiles(workbook).map(storedFileToBackup)),
    pdf: null,
  })));
  const problems = await Promise.all(state.problems.map(async (problem) => ({
    ...problem,
    problemImage: await storedFileToBackup(problem.problemImage),
    attachments: await Promise.all(toArray(problem.attachments).map(storedFileToBackup)),
  })));
  return {
    app: 'mathfarm-science-lessons',
    version: 1,
    exportedAt: new Date().toISOString(),
    state: { workbooks, problems },
  };
}

async function restoreBackupPayload(payload) {
  const source = payload.state || payload;
  const workbooks = await Promise.all(toArray(source.workbooks).map(async (workbook) => {
    const sourceFiles = (await Promise.all(toArray(workbook.sourceFiles).map(backupFileToStored))).filter(Boolean);
    return normalizeWorkbook({ ...workbook, sourceFiles, pdf: sourceFiles[0] || null });
  }));
  const problems = await Promise.all(toArray(source.problems).map(async (problem) => normalizeProblem({
    ...problem,
    problemImage: await backupFileToStored(problem.problemImage),
    attachments: (await Promise.all(toArray(problem.attachments).map(backupFileToStored))).filter(Boolean),
  }, problem.workbookId)));
  return { workbooks, problems };
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function cloneImportedStateForAppend(imported) {
  const workbookIds = new Map();
  const workbooks = imported.workbooks.map((workbook) => {
    const nextId = crypto.randomUUID();
    workbookIds.set(workbook.id, nextId);
    return { ...workbook, id: nextId, createdAt: workbook.createdAt || new Date().toISOString() };
  });
  const problems = imported.problems.map((problem) => ({
    ...problem,
    id: crypto.randomUUID(),
    workbookId: workbookIds.get(problem.workbookId) || problem.workbookId,
    updatedAt: new Date().toISOString(),
  }));
  return { workbooks, problems };
}

function getSourceFiles(workbook) {
  return workbook.sourceFiles?.length ? workbook.sourceFiles : [workbook.pdf].filter(Boolean);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function normalizeSubject(subject) {
  if (SUBJECTS.includes(subject)) return subject;
  if (subject === '융합과학') return DEFAULT_SUBJECT;
  return DEFAULT_SUBJECT;
}

function normalizeSubjects(subjects) {
  const values = toArray(subjects).map(normalizeSubject);
  return values.length ? [...new Set(values)] : [DEFAULT_SUBJECT];
}

function normalizeGroup(group, subjects = []) {
  if (GROUPS.includes(group)) return group;
  const firstSubject = normalizeSubjects(subjects)[0];
  return SUBJECT_CONFIG[firstSubject]?.group || DEFAULT_GROUP;
}

function subjectsForGroup(group) {
  return SUBJECTS.filter((subject) => SUBJECT_CONFIG[subject].group === group);
}

function getSubjectMeta(subjectsOrSubject) {
  const subjects = toArray(subjectsOrSubject);
  const primary = normalizeSubject(subjects.includes('화학') ? '화학' : subjects[0] || DEFAULT_SUBJECT);
  return SUBJECT_CONFIG[primary] || SUBJECT_CONFIG[DEFAULT_SUBJECT];
}

function getGroupMeta(group) {
  const normalized = normalizeGroup(group);
  return normalized === '물리/지구'
    ? { className: 'earth', Icon: Globe2 }
    : { className: 'bio', Icon: Layers3 };
}

function normalizeConcept(concept = {}) {
  return {
    name: concept.name || '',
    definition: concept.definition || '',
    easyExplanation: concept.easyExplanation || concept.simple || '',
    why: concept.why || concept.importance || '',
    application: concept.application || concept.usage || '',
    caution: concept.caution || '',
  };
}

function normalizeTeacherGuide(guide) {
  if (!guide) return { opening: '', teachingOrder: [], questionsToAsk: [], boardPoints: [], visualNotes: [], visuals: [], emphasis: [] };
  if (typeof guide === 'string') return { opening: guide, teachingOrder: [], questionsToAsk: [], boardPoints: [], visualNotes: [], visuals: [], emphasis: [] };
  return {
    opening: guide.opening || guide.summary || '',
    teachingOrder: toArray(guide.teachingOrder),
    questionsToAsk: toArray(guide.questionsToAsk),
    boardPoints: toArray(guide.boardPoints),
    visualNotes: toArray(guide.visualNotes || guide.diagramIdeas || guide.visualSources),
    visuals: toArray(guide.visuals),
    emphasis: toArray(guide.emphasis),
  };
}

function normalizeProblem(problem = {}, workbookId = '') {
  const problemNumber = String(problem.problemNumber || problem.number || '1');
  const oldAnswer = problem.answer || '';
  const oldSteps = problem.reasoningSteps || problem.reasoning || [];
  const subQuestions = toArray(problem.subQuestions).map((item, index) => ({
    label: item.label || `${problemNumber}-${index + 1}`,
    question: item.question || '',
    solutionSteps: toArray(item.solutionSteps?.length ? item.solutionSteps : oldSteps),
    shortAnswer: item.shortAnswer || oldAnswer || '',
    finalAnswer: item.finalAnswer || oldAnswer || '',
  }));

  const fallbackSubQuestions = subQuestions.length ? subQuestions : oldAnswer || oldSteps.length ? [{
    label: `${problemNumber}-1`,
    question: problem.question || '',
    solutionSteps: toArray(oldSteps),
    shortAnswer: oldAnswer,
    finalAnswer: oldAnswer,
  }] : [];

  const conceptFlows = toArray(problem.conceptFlows?.length ? problem.conceptFlows : problem.conceptFlow || problem.connectionSteps).map((flow, index) => {
    if (typeof flow === 'string') return { title: index === 0 ? '개념 흐름' : `흐름 ${index + 1}`, steps: [flow] };
    if (Array.isArray(flow)) return { title: index === 0 ? '개념 흐름' : `흐름 ${index + 1}`, steps: flow };
    return { title: flow.title || `흐름 ${index + 1}`, steps: toArray(flow.steps) };
  });

  return {
    id: problem.id || crypto.randomUUID(),
    workbookId: problem.workbookId || workbookId,
    problemNumber,
    title: problem.title || '',
    subject: normalizeSubject(problem.subject),
    group: normalizeGroup(problem.group, [normalizeSubject(problem.subject)]),
    unit: problem.unit || '',
    sourcePages: toArray(problem.sourcePages).map(String),
    questionSummary: problem.questionSummary || '',
    keywords: toArray(problem.keywords || problem.tags),
    concepts: toArray(problem.concepts).map(normalizeConcept),
    clues: toArray(problem.clues).map((clue) => ({
      clue: clue.clue || clue.phrase || '',
      concept: clue.concept || '',
      reason: clue.reason || '',
    })),
    conceptFlows,
    subQuestions: fallbackSubQuestions,
    commonMistakes: toArray(problem.commonMistakes || problem.confusions),
    teacherGuide: normalizeTeacherGuide(problem.teacherGuide || problem.teacherNotes),
    problemImage: problem.problemImage || null,
    attachments: toArray(problem.attachments),
    updatedAt: new Date().toISOString(),
  };
}

function emptyWorkbook() {
  return {
    id: crypto.randomUUID(),
    title: '새 문제집',
    school: '',
    year: '',
    group: DEFAULT_GROUP,
    subjects: [DEFAULT_SUBJECT],
    sourceFiles: [],
    pdf: null,
    createdAt: new Date().toISOString(),
  };
}

function normalizeWorkbook(workbook = {}) {
  const subjects = normalizeSubjects(workbook.subjects?.length ? workbook.subjects : workbook.subject || DEFAULT_SUBJECT);
  const group = normalizeGroup(workbook.group, subjects);
  const groupSubjects = subjects.filter((subject) => SUBJECT_CONFIG[subject].group === group);
  return {
    id: workbook.id || crypto.randomUUID(),
    title: workbook.title || workbook.workbookTitle || '새 문제집',
    school: workbook.school || '',
    year: workbook.year || '',
    group,
    subjects: groupSubjects.length ? groupSubjects : subjectsForGroup(group),
    sourceFiles: toArray(workbook.sourceFiles),
    pdf: workbook.pdf || null,
    createdAt: workbook.createdAt || new Date().toISOString(),
  };
}

function parseJsonLikeText(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('가져올 내용이 없습니다.');
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || trimmed.slice(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);
  if (!candidate || !candidate.trim().startsWith('{')) throw new Error('중괄호로 시작하는 JSON 형식을 찾지 못했습니다.');
  return JSON.parse(candidate);
}

function validateImportData(data) {
  const errors = [];
  if (!data || typeof data !== 'object') errors.push('전체 데이터가 객체가 아닙니다.');
  if (!Array.isArray(data.problems)) errors.push('problems가 배열이어야 합니다.');
  if (data.group && !GROUPS.includes(data.group)) errors.push(`문제집 group 값 '${data.group}'은 사용할 수 없습니다. 사용 가능: ${GROUPS.join(' / ')}`);
  toArray(data.subjects).forEach((subject) => {
    if (!SUBJECTS.includes(subject)) errors.push(`문제집 subjects의 '${subject}'은 사용할 수 없습니다. 사용 가능: ${SUBJECTS.join(' / ')}`);
  });
  toArray(data.problems).forEach((problem, index) => {
    const label = problem.problemNumber || problem.number || index + 1;
    if (!problem.problemNumber && !problem.number) errors.push(`문제 ${label}: problemNumber가 없습니다.`);
    if (problem.subject && !SUBJECTS.includes(problem.subject)) errors.push(`문제 ${label}: 과목 값 '${problem.subject}'은 사용할 수 없습니다. 사용 가능: ${SUBJECTS.join(' / ')}`);
    if (problem.group && !GROUPS.includes(problem.group)) errors.push(`문제 ${label}: group 값 '${problem.group}'은 사용할 수 없습니다. 사용 가능: ${GROUPS.join(' / ')}`);
    if (problem.concepts && !Array.isArray(problem.concepts)) errors.push(`problems[${index}]의 concepts는 배열이어야 합니다.`);
  });
  return errors;
}

function buildWorkbookImport(raw, currentWorkbook, sourceFiles) {
  const asWorkbook = raw.problems ? raw : {
    workbookTitle: raw.workbookTitle || raw.title || currentWorkbook.title,
    school: raw.school || currentWorkbook.school,
    year: raw.year || currentWorkbook.year,
    group: raw.group || currentWorkbook.group,
    subjects: raw.subjects || [raw.subject || currentWorkbook.subjects?.[0] || DEFAULT_SUBJECT],
    problems: [raw],
  };

  const validationErrors = validateImportData(asWorkbook);
  if (validationErrors.length) throw new Error(validationErrors.join('\n'));

  const workbook = normalizeWorkbook({
    ...currentWorkbook,
    title: asWorkbook.workbookTitle || currentWorkbook.title,
    school: asWorkbook.school || currentWorkbook.school,
    year: asWorkbook.year || currentWorkbook.year,
    group: asWorkbook.group || currentWorkbook.group,
    subjects: asWorkbook.subjects || currentWorkbook.subjects,
    sourceFiles,
  });
  const problems = asWorkbook.problems.map((problem) => normalizeProblem({
    ...problem,
    group: problem.group || workbook.group,
    subject: problem.subject || workbook.subjects[0],
  }, workbook.id));
  return { workbook, problems };
}

function App() {
  const [state, setState] = useState({ workbooks: [], problems: [] });
  const [view, setView] = useState({ name: 'home' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    loadState()
      .then((saved) => {
        if (ignore) return;
        if (saved) {
          setState({
            workbooks: toArray(saved.workbooks).map(normalizeWorkbook),
            problems: toArray(saved.problems).map((problem) => normalizeProblem(problem, problem.workbookId)),
          });
        }
      })
      .catch((error) => {
        console.error('저장된 수업자료를 불러오지 못했습니다.', error);
        window.alert(`저장된 수업자료를 불러오지 못했습니다.\n${error.message}`);
      })
      .finally(() => {
        if (!ignore) setIsLoaded(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setIsSaving(true);
    const timer = setTimeout(() => saveState(state).finally(() => setIsSaving(false)), 350);
    return () => clearTimeout(timer);
  }, [state, isLoaded]);

  const activeWorkbook = state.workbooks.find((item) => item.id === view.workbookId);
  const activeProblem = state.problems.find((item) => item.id === view.problemId);

  const createWorkbook = (draft) => {
    const group = normalizeGroup(draft.group);
    const workbook = normalizeWorkbook({
      ...emptyWorkbook(),
      title: draft.title?.trim() || '새 문제집',
      school: draft.school,
      year: draft.year,
      group,
      subjects: subjectsForGroup(group),
      sourceFiles: draft.sourceFiles,
      pdf: draft.sourceFiles?.[0] || null,
    });
    setState((prev) => ({ ...prev, workbooks: [workbook, ...prev.workbooks] }));
    setView({ name: 'workbook', workbookId: workbook.id });
  };

  const importWorkbookData = (workbookId, text) => {
    const currentWorkbook = state.workbooks.find((item) => item.id === workbookId);
    const raw = parseJsonLikeText(text);
    const { workbook, problems } = buildWorkbookImport(raw, currentWorkbook, getSourceFiles(currentWorkbook));
    setState((prev) => ({
      workbooks: prev.workbooks.map((item) => item.id === workbookId ? workbook : item),
      problems: [...problems, ...prev.problems.filter((problem) => problem.workbookId !== workbookId)],
    }));
    setView({ name: 'workbook', workbookId });
    return problems.length;
  };

  const updateWorkbook = (workbookId, patch) => {
    setState((prev) => ({
      ...prev,
      workbooks: prev.workbooks.map((workbook) => workbook.id === workbookId ? normalizeWorkbook({ ...workbook, ...patch }) : workbook),
    }));
  };

  const updateProblem = (problemId, patch) => {
    setState((prev) => ({
      ...prev,
      problems: prev.problems.map((problem) => problem.id === problemId ? normalizeProblem({ ...problem, ...patch }, problem.workbookId) : problem),
    }));
  };

  const exportBackup = async () => {
    const payload = await buildBackupPayload(state);
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`매쓰팜-과학자료-백업-${date}.json`, payload);
  };

  const importBackup = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const restored = cloneImportedStateForAppend(await restoreBackupPayload(JSON.parse(text)));
      setState((prev) => ({
        workbooks: [...restored.workbooks, ...prev.workbooks],
        problems: [...restored.problems, ...prev.problems],
      }));
      setView({ name: 'home' });
      window.alert(`${restored.workbooks.length}개 문제집을 기존 자료에 추가했습니다.`);
    } catch (error) {
      window.alert(`백업 파일을 불러오지 못했습니다.\n${error.message}`);
    }
  };

  const deleteWorkbook = (workbookId) => {
    const workbook = state.workbooks.find((item) => item.id === workbookId);
    if (!window.confirm(`${workbook?.title || '이 문제집'}을 삭제할까요? 연결된 문제 설명지도 함께 삭제됩니다.`)) return;
    setState((prev) => ({
      workbooks: prev.workbooks.filter((item) => item.id !== workbookId),
      problems: prev.problems.filter((problem) => problem.workbookId !== workbookId),
    }));
    setView({ name: 'home' });
  };

  const deleteProblem = (problemId) => {
    const problem = state.problems.find((item) => item.id === problemId);
    if (!window.confirm(`문제 ${problem?.problemNumber || ''} 설명지를 삭제할까요?`)) return;
    setState((prev) => ({ ...prev, problems: prev.problems.filter((item) => item.id !== problemId) }));
    setView({ name: 'workbook', workbookId: problem?.workbookId || view.workbookId });
  };

  if (!isLoaded) return <div className="loading">수업자료를 불러오는 중...</div>;

  return (
    <div className="app">
      <header className="topbar no-print">
        <button className="ghost icon-text" onClick={() => setView({ name: 'home' })}>
          <BookOpen size={18} />
          매쓰팜 과학 자료
        </button>
        <div className="top-actions">
          <button className="secondary icon-text" onClick={exportBackup} disabled={state.workbooks.length === 0}><Save size={15} />백업 저장</button>
          <label className="secondary icon-text backup-button"><Upload size={15} />백업 불러오기<input type="file" accept="application/json" onChange={(event) => {
            importBackup(event.target.files?.[0]);
            event.target.value = '';
          }} /></label>
          <span className="save-state"><Save size={15} />{isSaving ? '저장 중' : '자동 저장됨'}</span>
        </div>
      </header>
      <main>
        {view.name === 'home' && (
          <Home
            workbooks={state.workbooks}
            problems={state.problems}
            onCreate={createWorkbook}
            onOpen={(id) => setView({ name: 'workbook', workbookId: id })}
            onDelete={deleteWorkbook}
          />
        )}
        {view.name === 'workbook' && activeWorkbook && (
          <WorkbookDetail
            workbook={activeWorkbook}
            problems={state.problems.filter((problem) => problem.workbookId === activeWorkbook.id)}
            onBack={() => setView({ name: 'home' })}
            onDelete={() => deleteWorkbook(activeWorkbook.id)}
            onImport={(text) => importWorkbookData(activeWorkbook.id, text)}
            updateWorkbook={(patch) => updateWorkbook(activeWorkbook.id, patch)}
            onOpenProblem={(id) => setView({ name: 'problem', workbookId: activeWorkbook.id, problemId: id })}
          />
        )}
        {view.name === 'problem' && activeWorkbook && activeProblem && (
          <ProblemSheet
            workbook={activeWorkbook}
            problem={activeProblem}
            update={(patch) => updateProblem(activeProblem.id, patch)}
            updateWorkbook={(patch) => updateWorkbook(activeWorkbook.id, patch)}
            onBack={() => setView({ name: 'workbook', workbookId: activeWorkbook.id })}
            onDelete={() => deleteProblem(activeProblem.id)}
          />
        )}
      </main>
    </div>
  );
}

function Home({ workbooks, problems, onCreate, onOpen, onDelete }) {
  const [form, setForm] = useState({ title: '', school: '', year: '', group: DEFAULT_GROUP, sourceFiles: [] });
  const [filters, setFilters] = useState({ group: '전체', query: '', subject: '전체' });
  const filteredWorkbooks = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return workbooks.filter((workbook) => {
      const count = problems.filter((problem) => problem.workbookId === workbook.id).length;
      const matchesGroup = filters.group === '전체' || workbook.group === filters.group;
      const matchesSubject = filters.subject === '전체' || workbook.subjects.includes(filters.subject);
      const text = [workbook.title, workbook.school, workbook.year, workbook.group, workbook.subjects.join(' '), `${count}문제`].join(' ').toLowerCase();
      return matchesGroup && matchesSubject && (!query || text.includes(query));
    });
  }, [filters, problems, workbooks]);

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">Science Lesson Sheet Maker</p>
          <h1>과학고 기출 설명지를 수업자료로 정리하는 앱</h1>
          <p>사용법: 원본 문제를 보관하고, ChatGPT로 만든 설명지를 한 번 가져와 수업자료로 확인하고 출력합니다.</p>
        </div>
      </div>
      <form className="register-panel no-print" onSubmit={(event) => {
        event.preventDefault();
        onCreate(form);
        setForm({ title: '', school: '', year: '', group: DEFAULT_GROUP, sourceFiles: [] });
        event.currentTarget.reset();
      }}>
        <div className="panel-head"><FilePlus2 size={21} /><strong>새 문제집 등록</strong></div>
        <label>문제집 제목<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="예: 2026 서울과학고 화학 기출" /></label>
        <label>학교<input value={form.school} onChange={(event) => setForm({ ...form, school: event.target.value })} placeholder="예: 서울과학고" /></label>
        <label>연도<input value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} placeholder="예: 2026" /></label>
        <label>대분류<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}>{GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label>
        <label>원본 PDF/사진<input type="file" multiple accept="application/pdf,image/*" onChange={(event) => setForm({ ...form, sourceFiles: filesToStored(event.target.files) })} /></label>
        <button className="primary icon-text"><Plus size={17} />문제집 만들기</button>
      </form>
      <div className="flow-help no-print">
        <strong>사용법</strong>
        <span>1. 문제집 등록</span>
        <ArrowRight size={16} />
        <span>2. ChatGPT 설명지 가져오기</span>
        <ArrowRight size={16} />
        <span>3. 문제별 설명지 확인</span>
        <ArrowRight size={16} />
        <span>4. A4/PDF 출력</span>
      </div>
      <div className="library-tools no-print">
        <div className="segment">
          {['전체', ...GROUPS].map((group) => <button key={group} className={filters.group === group ? 'active' : ''} onClick={() => setFilters({ ...filters, group })}>{group}</button>)}
        </div>
        <div className="library-filters">
          <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="강의명, 학교, 연도로 검색" />
          <select value={filters.subject} onChange={(event) => setFilters({ ...filters, subject: event.target.value })}>
            <option>전체</option>
            {SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
        </div>
      </div>
      <div className="workbook-grid">
        {filteredWorkbooks.length === 0 && <div className="empty"><Sparkles size={24} /><strong>표시할 문제집이 없습니다.</strong><span>문제집을 등록하거나 필터를 조정해 보세요.</span></div>}
        {filteredWorkbooks.map((workbook) => {
          const count = problems.filter((problem) => problem.workbookId === workbook.id).length;
          const subjectMeta = getSubjectMeta(workbook.subjects);
          const SubjectIcon = subjectMeta.Icon;
          const groupMeta = getGroupMeta(workbook.group);
          const GroupIcon = groupMeta.Icon;
          return (
            <div className="workbook-card" key={workbook.id}>
              <button className="workbook-open" onClick={() => onOpen(workbook.id)}>
                <span className={`subject-mark ${groupMeta.className}`}><GroupIcon size={18} />{workbook.group}</span>
                <h2>{workbook.title}</h2>
                <div className="card-meta"><span>{workbook.school || '학교 미입력'}</span><span>{workbook.year || '연도 미입력'}</span><span>{workbook.subjects.join(' · ')}</span><span>{count}문제</span></div>
                <div className="pdf-row"><FileText size={16} />{getSourceFiles(workbook).length ? `원본 ${getSourceFiles(workbook).length}개` : '원본 파일 없음'}<ChevronRight size={17} /></div>
              </button>
              <button className="card-delete no-print" onClick={() => onDelete(workbook.id)} aria-label="문제집 삭제"><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WorkbookDetail({ workbook, problems, onBack, onDelete, onImport, updateWorkbook, onOpenProblem }) {
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const [importOpen, setImportOpen] = useState(problems.length === 0);
  const [printAll, setPrintAll] = useState(false);
  const [printMode, setPrintMode] = useState('student');
  const [printShowAnswer, setPrintShowAnswer] = useState(true);
  const sourceFiles = getSourceFiles(workbook);
  const sortedProblems = [...problems].sort((a, b) => String(a.problemNumber).localeCompare(String(b.problemNumber), 'ko', { numeric: true }));
  const groupMeta = getGroupMeta(workbook.group);
  const GroupIcon = groupMeta.Icon;

  const handleImport = () => {
    try {
      const count = onImport(importText);
      setMessage(`가져오기 완료: ${count}개 문제 설명지를 만들었습니다.`);
      setImportText('');
      setImportOpen(false);
    } catch (error) {
      setMessage(`⚠ 가져올 수 없는 문제가 있습니다.\n${error.message || '입력 형식을 확인해 주세요.'}`);
    }
  };

  const printAllProblems = (mode) => {
    setPrintMode(mode);
    setPrintAll(true);
    window.setTimeout(() => window.print(), 0);
  };

  useEffect(() => {
    const resetPrintAll = () => setPrintAll(false);
    window.addEventListener('afterprint', resetPrintAll);
    return () => window.removeEventListener('afterprint', resetPrintAll);
  }, []);

  return (
    <section className={`page ${printAll ? 'workbook-printing' : ''}`}>
      <button className="ghost icon-text no-print" onClick={onBack}><ArrowLeft size={17} />보관함</button>
      <div className="detail-head compact-head">
        <div>
          <span className={`subject-mark ${groupMeta.className}`}><GroupIcon size={18} />{workbook.group}</span>
          <h1>{workbook.title}</h1>
          <p>{workbook.school || '학교 미입력'} · {workbook.year || '연도 미입력'} · {workbook.subjects.join(' · ')} · {problems.length}문제</p>
        </div>
        <div className="head-actions no-print">
          {sourceFiles[0] && <a className="secondary icon-text" href={fileUrl(sourceFiles[0])} target="_blank" rel="noreferrer"><FileText size={17} />원본 {sourceFiles.length}개</a>}
          <label className="toggle print-answer-toggle"><input type="checkbox" checked={printShowAnswer} onChange={(event) => setPrintShowAnswer(event.target.checked)} />정답 포함</label>
          <button className="primary icon-text" onClick={() => printAllProblems('student')} disabled={sortedProblems.length === 0}><Printer size={17} />학생용 전체 PDF</button>
          <button className="secondary icon-text" onClick={() => printAllProblems('teacher')} disabled={sortedProblems.length === 0}><Printer size={17} />강사용 전체 PDF</button>
          <button className="danger icon-text" onClick={onDelete}><Trash2 size={17} />삭제</button>
        </div>
      </div>

      <div className={`editor-card import-card no-print workbook-import ${importOpen ? 'open' : ''}`}>
        <div className="editor-title">
          <div>
            <h2><ClipboardPaste size={18} />ChatGPT 설명지 가져오기</h2>
            <p className="hint">설명지 데이터를 한 번에 넣으면 문제별 수업자료가 자동 생성됩니다.</p>
          </div>
          <div className="import-title-actions">
            <button className="secondary icon-text" onClick={() => setImportText(WORKBOOK_SCHEMA)}>예시 불러오기</button>
            <button className="primary icon-text" onClick={() => setImportOpen((value) => !value)}>{importOpen ? '접기' : '새 설명지 가져오기'}</button>
          </div>
        </div>
        {importOpen && (
          <>
            <textarea className="import-area" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="ChatGPT가 만든 설명지 데이터를 여기에 넣으세요." />
            <div className="import-actions">
              <button className="primary icon-text" onClick={handleImport}><ClipboardPaste size={17} />설명지 만들기</button>
            </div>
            <details className="schema-box">
              <summary>ChatGPT 요청 형식 보기</summary>
              <pre>{WORKBOOK_SCHEMA}</pre>
            </details>
          </>
        )}
        {message && <div className={`import-message ${message.startsWith('⚠') ? 'error' : 'success'}`}>{message}</div>}
      </div>

      <SourceFilesEditor workbook={workbook} updateWorkbook={updateWorkbook} />

      <div className="problem-list">
        {sortedProblems.length === 0 && <div className="empty"><Sparkles size={22} /><strong>아직 생성된 문제 설명지가 없습니다.</strong><span>위 영역에 ChatGPT 설명지 데이터를 가져오면 문제별 수업자료가 만들어집니다.</span></div>}
        {sortedProblems.map((problem) => (
          <button className="problem-row" key={problem.id} onClick={() => onOpenProblem(problem.id)}>
            <div className="problem-main"><strong>문제 {problem.problemNumber}</strong><b>{problem.title || '제목 미입력'}</b></div>
            <span>{problem.subject} · {problem.unit || '단원 미입력'}</span>
            <div className="tags">{(problem.keywords.length ? problem.keywords : ['키워드 없음']).map((tag) => <em key={tag}>{tag}</em>)}</div>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>

      <div className="workbook-print-bundle">
        <div className="print-only full-print-label">{workbook.title} · {printMode === 'teacher' ? '강사용' : '학생용'} 전체 문제 설명지</div>
        {sortedProblems.map((problem) => (
          <div className="print-problem-page" key={problem.id}>
            <Worksheet workbook={workbook} problem={problem} viewMode={printMode} showAnswer={printMode === 'teacher' ? true : printShowAnswer} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSheet({ workbook, problem, update, updateWorkbook, onBack, onDelete }) {
  const [mode, setMode] = useState('student');
  const [showAnswer, setShowAnswer] = useState(true);
  const sourceFiles = getSourceFiles(workbook);

  const printCurrentView = () => {
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <section className={`sheet-page ${mode !== 'edit' ? 'material-mode' : ''}`}>
      <div className="sheet-toolbar no-print">
        <button className="ghost icon-text" onClick={onBack}><ArrowLeft size={17} />문제 목록</button>
        <div className="toolbar-group">
          {sourceFiles[0] && <a className="secondary icon-text" href={fileUrl(sourceFiles[0])} target="_blank" rel="noreferrer"><FileText size={16} />원본 문제</a>}
          <button className={mode === 'edit' ? 'primary icon-text' : 'secondary icon-text'} onClick={() => setMode('edit')}><Pencil size={16} />편집</button>
          <button className={mode === 'student' ? 'primary icon-text' : 'secondary icon-text'} onClick={() => setMode('student')}><Eye size={16} />학생용</button>
          <button className={mode === 'teacher' ? 'primary icon-text' : 'secondary icon-text'} onClick={() => setMode('teacher')}><BookOpen size={16} />강사용</button>
          <label className="toggle"><input type="checkbox" checked={showAnswer} onChange={(event) => setShowAnswer(event.target.checked)} />정답 표시</label>
          <button className="danger icon-text" onClick={onDelete}><Trash2 size={16} />문제 삭제</button>
          <button className="primary icon-text" onClick={printCurrentView}><Printer size={17} />현재 화면 인쇄</button>
        </div>
      </div>

      {mode === 'edit' && (
        <div className="editor no-print">
          <SourceFilesEditor workbook={workbook} updateWorkbook={updateWorkbook} />
          <ProblemEditor problem={problem} update={update} />
        </div>
      )}

      <Worksheet workbook={workbook} problem={problem} viewMode={mode} showAnswer={showAnswer} />
    </section>
  );
}

function SourceFilesEditor({ workbook, updateWorkbook }) {
  const sourceFiles = getSourceFiles(workbook);
  const setSourceFiles = (nextFiles) => updateWorkbook({ sourceFiles: nextFiles, pdf: nextFiles[0] || null });

  return (
    <div className="editor-card no-print">
      <div className="editor-title">
        <h2>원본 문제</h2>
        <label className="secondary icon-text file-button">
          <ImagePlus size={16} />
          파일 추가
          <input type="file" multiple accept="application/pdf,image/*" onChange={(event) => setSourceFiles([...sourceFiles, ...filesToStored(event.target.files)])} />
        </label>
      </div>
      <p className="hint">원본 PDF, 문제 사진, 보기 확대 사진 등을 여러 개 넣을 수 있습니다.</p>
      <div className="mini-files">
        {sourceFiles.length === 0 && <span>원본 파일 없음</span>}
        {sourceFiles.map((file) => (
          <span key={file.id}>
            <a href={fileUrl(file)} target="_blank" rel="noreferrer">{file.name}</a>
            <button onClick={() => setSourceFiles(sourceFiles.filter((item) => item.id !== file.id))}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ProblemEditor({ problem, update }) {
  return (
    <>
      <div className="editor-card">
        <h2>문제 정보</h2>
        <div className="editor-grid">
          <label>제목<input value={problem.title} onChange={(event) => update({ title: event.target.value })} /></label>
          <label>문제 번호<input value={problem.problemNumber} onChange={(event) => update({ problemNumber: event.target.value })} /></label>
          <label>과목<select value={problem.subject} onChange={(event) => update({ subject: event.target.value })}>{SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
          <label>단원<input value={problem.unit} onChange={(event) => update({ unit: event.target.value })} /></label>
          <label>원본 페이지<input value={problem.sourcePages.join(', ')} onChange={(event) => update({ sourcePages: event.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></label>
          <label className="wide">핵심 키워드<input value={problem.keywords.join(', ')} onChange={(event) => update({ keywords: event.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></label>
        </div>
        <label className="editor-block"><strong>이 문제는 무엇을 묻는가?</strong><textarea value={problem.questionSummary} onChange={(event) => update({ questionSummary: event.target.value })} /></label>
      </div>
      <ConceptEditor concepts={problem.concepts} update={(concepts) => update({ concepts })} />
      <PairEditor title="문제 속 단서" items={problem.clues} update={(clues) => update({ clues })} />
      <FlowEditor flows={problem.conceptFlows} update={(conceptFlows) => update({ conceptFlows })} />
      <SubQuestionEditor items={problem.subQuestions} update={(subQuestions) => update({ subQuestions })} />
      <TextArrayEditor title="헷갈리기 쉬운 부분" items={problem.commonMistakes} update={(commonMistakes) => update({ commonMistakes })} placeholder="학생이 자주 하는 실수" />
      <TeacherGuideEditor guide={problem.teacherGuide} update={(teacherGuide) => update({ teacherGuide })} />
      <AttachmentEditor problem={problem} update={update} />
    </>
  );
}

function ConceptEditor({ concepts, update }) {
  return (
    <div className="editor-card">
      <div className="editor-title"><h2>필수 개념</h2><button className="secondary icon-text" onClick={() => update([...concepts, normalizeConcept({})])}><Plus size={16} />개념 추가</button></div>
      {concepts.map((concept, index) => (
        <div className="nested-editor" key={index}>
          <input placeholder="개념명" value={concept.name} onChange={(event) => update(concepts.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} />
          <textarea placeholder="정의" value={concept.definition} onChange={(event) => update(concepts.map((item, i) => i === index ? { ...item, definition: event.target.value } : item))} />
          <textarea placeholder="쉽게 이해하기" value={concept.easyExplanation} onChange={(event) => update(concepts.map((item, i) => i === index ? { ...item, easyExplanation: event.target.value } : item))} />
          <textarea placeholder="왜 그런가" value={concept.why} onChange={(event) => update(concepts.map((item, i) => i === index ? { ...item, why: event.target.value } : item))} />
          <textarea placeholder="이 문제에서는" value={concept.application} onChange={(event) => update(concepts.map((item, i) => i === index ? { ...item, application: event.target.value } : item))} />
          <textarea placeholder="주의" value={concept.caution} onChange={(event) => update(concepts.map((item, i) => i === index ? { ...item, caution: event.target.value } : item))} />
          <button className="ghost danger-text" onClick={() => update(concepts.filter((_, i) => i !== index))}>삭제</button>
        </div>
      ))}
    </div>
  );
}

function PairEditor({ title, items, update }) {
  return (
    <div className="editor-card">
      <div className="editor-title"><h2>{title}</h2><button className="secondary icon-text" onClick={() => update([...items, { clue: '', concept: '', reason: '' }])}><Plus size={16} />추가</button></div>
      {items.map((item, index) => (
        <div className="nested-editor" key={index}>
          <input placeholder="문제 속 표현" value={item.clue} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, clue: event.target.value } : current))} />
          <input placeholder="떠올릴 개념" value={item.concept} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, concept: event.target.value } : current))} />
          <textarea placeholder="이유" value={item.reason} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, reason: event.target.value } : current))} />
          <button className="ghost danger-text" onClick={() => update(items.filter((_, i) => i !== index))}>삭제</button>
        </div>
      ))}
    </div>
  );
}

function FlowEditor({ flows, update }) {
  return (
    <div className="editor-card">
      <div className="editor-title"><h2>개념/사고 흐름</h2><button className="secondary icon-text" onClick={() => update([...flows, { title: '', steps: [] }])}><Plus size={16} />흐름 추가</button></div>
      {flows.map((flow, index) => (
        <div className="nested-editor" key={index}>
          <input placeholder="흐름 제목" value={flow.title} onChange={(event) => update(flows.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} />
          <textarea placeholder="단계는 줄바꿈으로 구분" value={flow.steps.join('\n')} onChange={(event) => update(flows.map((item, i) => i === index ? { ...item, steps: event.target.value.split('\n').map((x) => x.trim()).filter(Boolean) } : item))} />
          <button className="ghost danger-text" onClick={() => update(flows.filter((_, i) => i !== index))}>삭제</button>
        </div>
      ))}
    </div>
  );
}

function SubQuestionEditor({ items, update }) {
  return (
    <div className="editor-card">
      <div className="editor-title"><h2>소문항 / 답안</h2><button className="secondary icon-text" onClick={() => update([...items, { label: '', question: '', solutionSteps: [], shortAnswer: '', finalAnswer: '' }])}><Plus size={16} />소문항 추가</button></div>
      {items.map((item, index) => (
        <div className="nested-editor" key={index}>
          <input placeholder="라벨 예: 1-1" value={item.label} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, label: event.target.value } : current))} />
          <textarea placeholder="문항" value={item.question} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, question: event.target.value } : current))} />
          <textarea placeholder="풀이 단계는 줄바꿈으로 구분" value={item.solutionSteps.join('\n')} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, solutionSteps: event.target.value.split('\n').map((x) => x.trim()).filter(Boolean) } : current))} />
          <input placeholder="짧은 답" value={item.shortAnswer} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, shortAnswer: event.target.value } : current))} />
          <textarea placeholder="최종 답안" value={item.finalAnswer} onChange={(event) => update(items.map((current, i) => i === index ? { ...current, finalAnswer: event.target.value } : current))} />
          <button className="ghost danger-text" onClick={() => update(items.filter((_, i) => i !== index))}>삭제</button>
        </div>
      ))}
    </div>
  );
}

function TextArrayEditor({ title, items, update, placeholder }) {
  return (
    <div className="editor-card">
      <div className="editor-title"><h2>{title}</h2><button className="secondary icon-text" onClick={() => update([...items, ''])}><Plus size={16} />추가</button></div>
      {items.map((item, index) => (
        <div className="line-editor" key={index}>
          <input placeholder={placeholder} value={item} onChange={(event) => update(items.map((current, i) => i === index ? event.target.value : current))} />
          <button className="icon-only ghost" onClick={() => update(items.filter((_, i) => i !== index))}><Trash2 size={15} /></button>
        </div>
      ))}
    </div>
  );
}

function TeacherGuideEditor({ guide, update }) {
  return (
    <div className="editor-card">
      <h2>강사용 설명</h2>
      <label className="editor-block"><strong>수업 시작</strong><textarea value={guide.opening} onChange={(event) => update({ ...guide, opening: event.target.value })} /></label>
      <ArrayTextArea label="수업 순서" items={guide.teachingOrder} update={(teachingOrder) => update({ ...guide, teachingOrder })} />
      <ArrayTextArea label="학생에게 물어볼 질문" items={guide.questionsToAsk} update={(questionsToAsk) => update({ ...guide, questionsToAsk })} />
      <ArrayTextArea label="판서 포인트" items={guide.boardPoints} update={(boardPoints) => update({ ...guide, boardPoints })} />
      <ArrayTextArea label="그림/도식 아이디어" items={guide.visualNotes} update={(visualNotes) => update({ ...guide, visualNotes })} />
      <ArrayTextArea label="강조할 부분" items={guide.emphasis} update={(emphasis) => update({ ...guide, emphasis })} />
    </div>
  );
}

function ArrayTextArea({ label, items, update }) {
  return <label className="editor-block"><strong>{label}</strong><textarea value={items.join('\n')} onChange={(event) => update(event.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} /></label>;
}

function AttachmentEditor({ problem, update }) {
  return (
    <div className="editor-card">
      <div className="editor-title">
        <h2>추가 이미지</h2>
        <label className="secondary icon-text file-button"><ImagePlus size={16} />이미지 추가<input type="file" multiple accept="image/*" onChange={(event) => update({ attachments: [...problem.attachments, ...filesToStored(event.target.files)] })} /></label>
      </div>
      <div className="mini-files">{problem.attachments.map((file) => <span key={file.id}>{file.name}<button onClick={() => update({ attachments: problem.attachments.filter((item) => item.id !== file.id) })}>×</button></span>)}</div>
    </div>
  );
}

function Worksheet({ workbook, problem, viewMode, showAnswer }) {
  const sourceFiles = getSourceFiles(workbook);
  const sourceImages = sourceFiles.filter((file) => file.type?.startsWith('image/'));
  const sourceDocuments = sourceFiles.filter((file) => !file.type?.startsWith('image/'));
  const images = [problem.problemImage, ...problem.attachments].filter(Boolean);
  const isTeacher = viewMode === 'teacher';
  const subjectMeta = getSubjectMeta(problem.subject);
  const SubjectIcon = subjectMeta.Icon;
  return (
    <article className="worksheet">
      <header className="sheet-header">
        <div>
          <p>{workbook.title}{workbook.school ? ` · ${workbook.school}` : ''}{workbook.year ? ` · ${workbook.year}` : ''}</p>
          <h1>문제 {problem.problemNumber} 설명지</h1>
          {problem.title && <strong className="sheet-title">{problem.title}</strong>}
          <div className="sheet-keywords">{problem.keywords.map((keyword) => <em key={keyword}>{keyword}</em>)}</div>
        </div>
        <div className="sheet-side">
          <div className={`sheet-badge ${subjectMeta.className}`}><span><SubjectIcon size={15} />{problem.subject}</span><strong>{problem.unit || '단원 미입력'}</strong></div>
        </div>
      </header>

      <section className="overview-band">
        <div><span>문제 번호</span><strong>{problem.problemNumber}</strong></div>
        <div><span>과목</span><strong>{problem.subject}</strong></div>
        <div><span>원본</span><strong>{problem.sourcePages.length ? `${problem.sourcePages.join(', ')}쪽` : '-'}</strong></div>
        <div><span>핵심 키워드</span><strong>{problem.keywords.length ? problem.keywords.join(' · ') : '-'}</strong></div>
      </section>

      {problem.questionSummary && <SheetSection title="이 문제는 무엇을 묻는가?"><div className="summary-card">{problem.questionSummary}</div></SheetSection>}

      {(sourceImages.length > 0 || sourceDocuments.length > 0) && (
        <SheetSection title="원본 문제">
          {sourceImages.length > 0 && <ImageGrid images={sourceImages} />}
          {sourceDocuments.length > 0 && <div className="source-links no-print">{sourceDocuments.map((file) => <a className="secondary icon-text" key={file.id} href={fileUrl(file)} target="_blank" rel="noreferrer"><FileText size={16} />{file.name}</a>)}</div>}
        </SheetSection>
      )}

      {images.length > 0 && <SheetSection title="추가 시각 자료"><ImageGrid images={images} /></SheetSection>}

      {problem.concepts.length > 0 && (
        <SheetSection title="반드시 알아야 하는 개념">
          <div className="concept-cards">{problem.concepts.map((concept, index) => <ConceptCard concept={concept} index={index} key={index} />)}</div>
        </SheetSection>
      )}

      {problem.clues.length > 0 && (
        <SheetSection title="문제 속 단서">
          <div className="clue-grid">
            {problem.clues.map((clue, index) => <div className="clue-card" key={index}><span>[{clue.clue}]</span><ArrowRight size={18} /><strong>{clue.concept}</strong>{clue.reason && <p>{clue.reason}</p>}</div>)}
          </div>
        </SheetSection>
      )}

      {problem.conceptFlows.length > 0 && (
        <SheetSection title="개념/사고 흐름">
          <div className="flow-stack">{problem.conceptFlows.map((flow, index) => <Flow flow={flow} key={index} />)}</div>
        </SheetSection>
      )}

      {problem.subQuestions.length > 0 && (
        <SheetSection title="소문항별 풀이">
          <div className="subquestion-list">{problem.subQuestions.map((item, index) => <SubQuestion item={item} index={index} showAnswer={showAnswer} key={index} />)}</div>
        </SheetSection>
      )}

      {problem.commonMistakes.length > 0 && <SheetSection title="헷갈리기 쉬운 부분"><ul className="check-list">{problem.commonMistakes.map((item, index) => <li key={index}><Check size={16} />{item}</li>)}</ul></SheetSection>}

      {isTeacher && <TeacherGuideView guide={problem.teacherGuide} />}
    </article>
  );
}

function ImageGrid({ images, className = '' }) {
  return <div className={`attachment-grid source-grid ${className}`.trim()}>{images.map((file) => <figure key={file.id}><img src={fileUrl(file)} alt={file.name} /><figcaption>{file.name}</figcaption></figure>)}</div>;
}

function ConceptCard({ concept, index }) {
  return (
    <div className="concept-card">
      <div className="concept-number">{index + 1}</div>
      <h3>{concept.name}</h3>
      {concept.definition && <p className="concept-definition"><b>정의</b>{concept.definition}</p>}
      {concept.easyExplanation && <p className="concept-easy"><b>쉽게 이해하기</b>{concept.easyExplanation}</p>}
      {concept.why && <p><b>왜 그런가</b>{concept.why}</p>}
      {concept.application && <p className="concept-application"><b>이 문제에서는</b>{concept.application}</p>}
      {concept.caution && <p className="concept-caution"><b>주의</b>{concept.caution}</p>}
    </div>
  );
}

function Flow({ flow }) {
  return (
    <div className="flow-panel">
      {flow.title && <h3>{flow.title}</h3>}
      <div className="flow">
        {flow.steps.map((step, index) => (
          <React.Fragment key={`${step}-${index}`}>
            <div className="flow-box">{step}</div>
            {index < flow.steps.length - 1 && <ArrowRight className="flow-arrow" size={22} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function SubQuestion({ item, index, showAnswer }) {
  return (
    <div className="subquestion-card">
      <h3>{item.label || `소문항 ${index + 1}`}</h3>
      {item.question && <p className="question-text">{item.question}</p>}
      {item.solutionSteps.length > 0 && <div className="reasoning">{item.solutionSteps.map((step, stepIndex) => <div className="reason-step" key={stepIndex}><span>{stepIndex + 1}</span><p>{step}</p></div>)}</div>}
      {showAnswer && (item.shortAnswer || item.finalAnswer) && (
        <div className="answer-pair">
          {item.shortAnswer && <div><b>핵심 답</b><p>{item.shortAnswer}</p></div>}
          {item.finalAnswer && <div><b>모범답안</b><p>{item.finalAnswer}</p></div>}
        </div>
      )}
    </div>
  );
}

function TeacherGuideView({ guide }) {
  const sections = [
    ['수업 흐름', guide.teachingOrder, 'ordered'],
    ['판서 포인트', guide.boardPoints, 'plain'],
    ['그림/도식 소스', guide.visualNotes, 'plain'],
    ['학생에게 던질 질문', guide.questionsToAsk, 'plain'],
    ['강조할 부분', guide.emphasis, 'plain'],
  ].filter(([, items]) => items.length > 0);
  if (!sections.length) return null;
  return (
    <SheetSection title="강사용 설명">
      <div className="teacher-guide">
        {guide.opening && <div className="teacher-opening"><b>수업 시작</b><p>{guide.opening}</p></div>}
        {guide.visuals.length > 0 && <ImageGrid images={guide.visuals} className="teacher-visual-grid" />}
        <div className="teacher-guide-grid">
          {sections.map(([title, items, type]) => (
            <div className={`teacher-guide-card ${type === 'ordered' ? 'wide' : ''}`} key={title}>
              <h3>{title}</h3>
              {type === 'ordered'
                ? <ol>{items.map((item, index) => <li key={index}>{item}</li>)}</ol>
                : <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>}
            </div>
          ))}
        </div>
      </div>
    </SheetSection>
  );
}

function SheetSection({ title, children }) {
  return <section className="sheet-section"><h2>{title}</h2>{children}</section>;
}

const rootElement = document.getElementById('root');
const root = window.__mathfarmRoot || createRoot(rootElement);
window.__mathfarmRoot = root;
root.render(<App />);

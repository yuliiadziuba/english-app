import { useEffect, useMemo, useReducer, useState, type Dispatch } from "react";
import sampleSprint from "../../content/examples/sample-sprint.v1.json";
import { matchAnswer } from "../domain/content/answers.js";
import { prepareSprintImport, type ImportPreview } from "../domain/content/import.js";
import { calculateProgress, hasSubstantiveAttempt } from "../domain/content/progress.js";
import type { ActivityPlan, ActivityStep, Sprint } from "../domain/content/schema.js";
import { createActivityWork, emptyLocalState, findActivity, loadLocalState, localReducer, saveLocalState, type LocalLearningState } from "../app/state.js";

const sample = sampleSprint as Sprint;

export function App() {
  const [state, dispatch] = useReducer(localReducer, undefined, () => loadLocalState(window.localStorage));
  useEffect(() => saveLocalState(state, window.localStorage), [state]);

  const activeSprint = state.activeSprintKey ? state.sprints[state.activeSprintKey] : undefined;
  const activity = findActivity(state);
  const work = activity ? state.activityWork[activity.key] ?? createActivityWork() : undefined;

  const accept = (sprint: Sprint) => dispatch({ type: "accept_sprint", sprint });
  const go = (screen: "home" | "sprint" | "activity" | "reflection" | "import" | "review") => dispatch({ type: "go", screen });

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => go("home")}>in context</button>
      <nav aria-label="Main navigation">
        <button onClick={() => go("review")}>Мой словарь</button>
        <button onClick={() => go("import")}>Импорт JSON</button>
      </nav>
    </header>
    {state.screen === "home" && <Home state={state} activeSprint={activeSprint} onSample={() => accept(sample)} onRestart={() => activeSprint && dispatch({ type: "restart_sprint", sprintKey: activeSprint.sprint_key })} onGo={go} />}
    {state.screen === "sprint" && <SprintView sprint={activeSprint} state={state} onOpen={(activityKey) => dispatch({ type: "open_activity", activityKey })} onRestart={(activityKey) => dispatch({ type: "restart_activity", activityKey })} onGo={go} />}
    {state.screen === "activity" && activity && work && <ActivityPlayer activity={activity} work={work} dispatch={dispatch} onGo={go} />}
    {state.screen === "reflection" && activity && work && <Reflection activity={activity} work={work} dispatch={dispatch} onGo={go} />}
    {state.screen === "import" && <ImportView onAccept={accept} onGo={go} />}
    {state.screen === "review" && <Review state={state} onGo={go} />}
  </main>;
}

function Home({ state, activeSprint, onSample, onRestart, onGo }: { state: LocalLearningState; activeSprint?: Sprint | undefined; onSample: () => void; onRestart: () => void; onGo: (screen: "sprint" | "import") => void }) {
  const resume = findActivity(state);
  const resumeWork = resume ? state.activityWork[resume.key] : undefined;
  const hasPractice = activeSprint?.slots.some((slot) => {
    const work = state.activityWork[slot.default_activity.key];
    return work?.finished || work?.completedStepKeys.length;
  });
  return <section className="hero card">
    <p className="eyebrow">Английский через реальные ситуации</p>
    <h1>Учись формулировать мысли, а не просто запоминать слова.</h1>
    <p>В каждом задании ты читаешь короткую ситуацию, замечаешь полезные конструкции, восстанавливаешь их и используешь своими словами.</p>
    <p className="quiet">Импорт JSON нужен для нового спринта, который можно сгенерировать во внешнем ИИ по формату проекта. Данные этого MVP сохраняются только в этом браузере.</p>
    {activeSprint ? <>
      <button className="primary" onClick={() => onGo("sprint")}>{resume ? `Продолжить: ${resume.title}` : `Открыть: ${activeSprint.title}`}</button>
      <button className="secondary" onClick={() => onGo("import")}>Импортировать новый спринт JSON</button>
      {hasPractice && <button className="secondary" onClick={onRestart}>Начать этот спринт заново</button>}
      {resumeWork && <p className="quiet">Твой прогресс сохранён в этом браузере.</p>}
    </> : <>
      <button className="primary" onClick={onSample}>Начать пример спринта</button>
      <button className="secondary" onClick={() => onGo("import")}>Импортировать спринт JSON</button>
    </>}
  </section>;
}

function SprintView({ sprint, state, onOpen, onRestart, onGo }: { sprint?: Sprint | undefined; state: LocalLearningState; onOpen: (key: string) => void; onRestart: (key: string) => void; onGo: (screen: "home" | "import") => void }) {
  if (!sprint) return <EmptyState onGo={onGo} />;
  return <section>
    <div className="page-heading"><div><p className="eyebrow">Seven practice slots</p><h1>{sprint.title}</h1><p>{sprint.learning_goal}</p></div><button className="secondary" onClick={() => onGo("import")}>Import another sprint</button></div>
    <div className="slot-list">{sprint.slots.map((slot) => {
      const activity = slot.default_activity;
      const work = state.activityWork[activity.key];
      const progress = calculateProgress(activity.steps, new Set(work?.completedStepKeys ?? []));
      return <article className="slot card" key={slot.key}><span className="slot-number">{slot.position}</span><div><p className="eyebrow">{activity.level} · {activity.topic}</p><h2>{activity.title}</h2><p>{activity.learning_objective}</p><div className="progress" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div><p className="quiet">{progress}% of planned steps completed</p></div><button className="primary" onClick={() => work?.finished ? onRestart(activity.key) : onOpen(activity.key)}>{work?.finished ? "Пройти снова" : work ? "Продолжить" : "Начать"}</button></article>;
    })}</div>
  </section>;
}

function EmptyState({ onGo }: { onGo: (screen: "home" | "import") => void }) {
  return <section className="card"><h1>No sprint is active yet.</h1><button className="primary" onClick={() => onGo("home")}>Go home</button><button className="secondary" onClick={() => onGo("import")}>Import a sprint</button></section>;
}

function ActivityPlayer({ activity, work, dispatch, onGo }: { activity: ActivityPlan; work: ReturnType<typeof createActivityWork>; dispatch: Dispatch<any>; onGo: (screen: "sprint" | "reflection") => void }) {
  const step = activity.steps[Math.min(work.currentStepIndex, activity.steps.length - 1)]!;
  const progress = calculateProgress(activity.steps, new Set(work.completedStepKeys));
  const [glossaryKey, setGlossaryKey] = useState<string>();
  const complete = (answer: unknown) => {
    dispatch({ type: "set_answer", activityKey: activity.key, stepKey: step.key, answer });
    dispatch({ type: "complete_step", activityKey: activity.key, stepKey: step.key, nextStepIndex: Math.min(work.currentStepIndex + 1, activity.steps.length - 1) });
    if (work.currentStepIndex >= activity.steps.length - 1) onGo("reflection");
  };
  return <section className="activity-layout">
    <div className="activity-header"><button className="back" onClick={() => onGo("sprint")}>← Sprint</button><p className="eyebrow">{activity.level} · {step.phase}</p><h1>{activity.title}</h1><p>{activity.learning_objective}</p><div className="progress" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div><p className="quiet">{progress}% complete</p></div>
    <article className="step-card card"><h2>{step.title}</h2><StepView step={step} savedAnswer={work.answers[step.key]} onSave={(answer) => dispatch({ type: "set_answer", activityKey: activity.key, stepKey: step.key, answer })} onComplete={complete} onGlossary={setGlossaryKey} /></article>
    <div className="activity-actions">{work.currentStepIndex > 0 && <button className="secondary" onClick={() => dispatch({ type: "previous_step", activityKey: activity.key })}>← Предыдущее задание</button>}<button className="secondary" onClick={() => dispatch({ type: "finish", activityKey: activity.key })}>Finish for now</button></div>
    {glossaryKey && <GlossaryCard activity={activity} glossaryKey={glossaryKey} saved={work.savedGlossaryKeys.includes(glossaryKey)} onToggle={() => dispatch({ type: "toggle_glossary", activityKey: activity.key, glossaryKey })} onClose={() => setGlossaryKey(undefined)} />}
  </section>;
}

function StepView({ step, savedAnswer, onSave, onComplete, onGlossary }: { step: ActivityStep; savedAnswer: unknown; onSave: (answer: unknown) => void; onComplete: (answer: unknown) => void; onGlossary: (key: string) => void }) {
  const [value, setValue] = useState(typeof savedAnswer === "string" ? savedAnswer : "");
  const [answers, setAnswers] = useState<Record<string, string>>((savedAnswer && typeof savedAnswer === "object" ? savedAnswer as Record<string, string> : {}));
  const [showCompare, setShowCompare] = useState(false);
  const russianInstruction = russianStepInstruction(step.key);
  if (step.type === "content_acknowledgement") return <><p className="instruction-ru">{russianInstruction}</p><StructuredText content={step.instruction} onGlossary={onGlossary} /><div className="reading"><StructuredText content={step.content} onGlossary={onGlossary} /></div><button className="primary" onClick={() => onComplete("acknowledged")}>{step.continue_label}</button></>;
  if (step.type === "language_noticing") return <><p className="instruction-ru">{russianInstruction}</p><StructuredText content={step.prompt} onGlossary={onGlossary} /><div className="reading"><StructuredText content={step.source} onGlossary={onGlossary} /></div>{step.jobs.map((job) => <label className="field" key={job.key}>{job.label}<select value={answers[job.key] ?? ""} onChange={(event) => setAnswers({ ...answers, [job.key]: event.target.value })}><option value="">Choose a phrase</option>{job.accepted_glossary_keys.map((key) => <option key={key} value={key}>{key.replaceAll("-", " ")}</option>)}</select></label>)}<button className="primary" disabled={step.jobs.some((job) => !answers[job.key])} onClick={() => onComplete(answers)}>Continue</button></>;
  if (step.type === "inline_text" || step.type === "reconstruction") return <><p className="instruction-ru">{russianInstruction}</p><StructuredText content={step.prompt} onGlossary={onGlossary} />{step.items.map((item) => { const result = answers[item.key] === undefined ? undefined : matchAnswer(answers[item.key] ?? "", item.accepted_answers.map((answer) => answer.value), step.normalisation); return <label className="field" key={item.key}>{item.prompt}<input value={answers[item.key] ?? ""} onChange={(event) => setAnswers({ ...answers, [item.key]: event.target.value })} />{result && <span className={result.status === "matched" ? "feedback good" : "feedback"}>{result.status === "matched" ? "Matched the supplied answer." : "Not matched to the supplied answers."} Target: {item.accepted_answers[0]!.value}</span>}</label>; })}<button className="primary" disabled={step.items.some((item) => !answers[item.key]?.trim())} onClick={() => onComplete(answers)}>Check and continue</button></>;
  if (step.type === "free_text") return <><p className="instruction-ru">{russianInstruction}</p>{step.scenario && <div className="reading"><StructuredText content={step.scenario} onGlossary={onGlossary} /></div>}<StructuredText content={step.prompt} onGlossary={onGlossary} /><label className="field">Your answer<textarea rows={6} value={value} onChange={(event) => setValue(event.target.value)} /></label><div className="button-row"><button className="primary" disabled={!value.trim()} onClick={() => { onSave(value); setShowCompare(true); }}>Save and compare</button>{value && <button className="secondary" onClick={() => { onSave(value); setShowCompare(true); }}>Compare answers</button>}</div>{showCompare && <><Comparison step={step} /><button className="primary" onClick={() => onComplete(value)}>Continue</button></>}</>;
  return <p>This reflection appears after you finish the activity.</p>;
}

function Comparison({ step }: { step: Extract<ActivityStep, { type: "free_text" }> }) { return <div className="comparison"><h3>Compare, don’t grade</h3>{step.natural_examples.map((example) => <div key={example.label}><strong>{example.label}</strong><p>{example.text}</p></div>)}<strong>Questions to ask yourself</strong><ul>{step.comparison_checklist.map((item) => <li key={item}>{item}</li>)}</ul></div>; }

function russianStepInstruction(stepKey: string): string {
  const translations: Record<string, string> = {
    "understand-update": "Прочитай обновление. Нажимай на подчёркнутые фразы, если хочешь увидеть перевод и пояснение.",
    "notice-jobs": "Выбери подходящую фразу для каждой коммуникативной задачи.",
    "rebuild-update": "Восстанови пропущенные части предложения по смыслу.",
    "retrieve-update": "Исходный текст скрыт. Своими словами объясни проблему и рекомендацию в 2–4 предложениях.",
    "transfer-release-decision": "Ответь на новую ситуацию в 2–4 предложениях: объясни риск и дай рекомендацию.",
    "clarify-response": "Сформулируй уточняющий вопрос по ситуации.",
    "delay-rewrite": "Перепиши обновление: добавь причину задержки и следующий шаг.",
    "tradeoff-response": "Сравни два варианта и объясни их последствия.",
    "disagree-response": "Вежливо не согласись и объясни, почему дополнительная проверка важна.",
    "result-gap": "Заполни пропуск подходящим словом.",
    "change-plan-response": "Вежливо попроси изменить план и предложи другое время.",
  };
  return translations[stepKey] ?? "Выполни задание. Подчёркнутые фразы можно открыть, чтобы увидеть перевод и пояснение.";
}

function StructuredText({ content, onGlossary }: { content: readonly { type: "text"; value: string }[] | readonly { type: "glossary_ref"; key: string; display: string }[] | any; onGlossary: (key: string) => void }) { return <p className="structured-text">{content.map((segment: any, index: number) => segment.type === "glossary_ref" ? <button className="phrase" key={`${segment.key}-${index}`} onClick={() => onGlossary(segment.key)}>{segment.display}</button> : <span key={index}>{segment.value}</span>)}</p>; }

function GlossaryCard({ activity, glossaryKey, saved, onToggle, onClose }: { activity: ActivityPlan; glossaryKey: string; saved: boolean; onToggle: () => void; onClose: () => void }) { const item = activity.glossary.find((entry) => entry.key === glossaryKey); if (!item) return null; return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-label={`Help for ${item.canonical_form}`}><button className="icon-button" aria-label="Close help" onClick={onClose}>×</button><p className="eyebrow">{item.kind.replaceAll("_", " ")}</p><h2>{item.canonical_form}</h2><p className="translation">{item.meaning_ru}</p><p>{item.example_en}</p>{item.pattern_note && <p className="quiet">{item.pattern_note}</p>}<button className="primary" onClick={onToggle}>{saved ? "Saved for practice" : "Save for practice"}</button></section></div>; }

function Reflection({ activity, work, dispatch, onGo }: { activity: ActivityPlan; work: ReturnType<typeof createActivityWork>; dispatch: Dispatch<any>; onGo: (screen: "sprint") => void }) {
  const saved = new Set(work.savedGlossaryKeys);
  const attempts = Object.entries(work.answers).map(([stepKey, answer]) => ({ stepKey, answer, submitted: true, supportUsed: false }));
  const progress = calculateProgress(activity.steps, new Set(work.completedStepKeys));
  return <section className="reflection card"><p className="eyebrow">Reflection</p><h1>Useful language from this activity</h1><p>You completed {progress}% of the planned steps. {hasSubstantiveAttempt(attempts) ? "Your practice has been saved." : "You can return whenever you want."}</p><div className="glossary-list">{activity.glossary.map((item) => <label key={item.key} className="glossary-row"><input type="checkbox" checked={saved.has(item.key)} onChange={() => dispatch({ type: "toggle_glossary", activityKey: activity.key, glossaryKey: item.key })} /><span><strong>{item.canonical_form}</strong><small>{item.meaning_ru}</small></span></label>)}</div><fieldset><legend>How did this activity feel?</legend>{[["clear", "I expressed it clearly"], ["try_again", "Almost — I want to try again"], ["need_support", "I need more support"]].map(([value, label]) => <label key={value}><input type="radio" name="assessment" checked={work.selfAssessment === value} onChange={() => dispatch({ type: "set_assessment", activityKey: activity.key, assessment: value })} /> {label}</label>)}</fieldset><label className="field">Anything else you want to practise?<textarea placeholder="A phrase, pattern, or situation…" value={work.learnerNote} onChange={(event) => dispatch({ type: "set_note", activityKey: activity.key, note: event.target.value })} /></label><button className="primary" onClick={() => onGo("sprint")}>Back to my sprint</button></section>;
}

function ImportView({ onAccept, onGo }: { onAccept: (sprint: Sprint) => void; onGo: (screen: "home" | "sprint") => void }) {
  const [text, setText] = useState(""); const [result, setResult] = useState<ReturnType<typeof prepareSprintImport>>();
  const validate = () => setResult(prepareSprintImport(text, "local-browser"));
  const preview = result?.ok ? result.preview : undefined;
  return <section className="import-view card"><button className="back" onClick={() => onGo("home")}>← Home</button><p className="eyebrow">Manual AI workflow</p><h1>Import a sprint</h1><p>Paste one JSON object. This MVP keeps it in this browser only.</p><label className="field">Sprint JSON<textarea aria-label="Sprint JSON" rows={14} value={text} onChange={(event) => { setText(event.target.value); setResult(undefined); }} placeholder="Paste JSON here" /></label><button className="primary" onClick={validate}>Validate sprint</button>{result && !result.ok && <div className="validation"><h2>Needs a small repair</h2><ul>{result.problems.map((problem) => <li key={`${problem.path}-${problem.message}`}><code>{problem.path}</code> — {problem.message}</li>)}</ul><label className="field">Repair prompt<textarea readOnly rows={7} value={result.repairPrompt} /></label></div>}{preview && <Preview preview={preview} onAccept={() => { onAccept(preview.sprint as Sprint); onGo("sprint"); }} />}</section>;
}

function Preview({ preview, onAccept }: { preview: ImportPreview; onAccept: () => void }) { return <div className="preview"><h2>Preview: {preview.sprint.title}</h2><p>{preview.sprint.learning_goal}</p>{preview.sprint.slots.map((slot) => <article key={slot.key} className="preview-slot"><strong>{slot.position}. {slot.default_activity.title}</strong><span>{slot.default_activity.level} · {slot.default_activity.topic}</span><p>{slot.default_activity.learning_objective}</p><small>{slot.default_activity.steps.length} steps · {slot.default_activity.glossary.length} contextual translations</small></article>)}<button className="primary" onClick={onAccept}>Import this sprint</button></div>; }

function Review({ state, onGo }: { state: LocalLearningState; onGo: (screen: "home" | "sprint") => void }) {
  const entries = useMemo(() => Object.values(state.sprints).flatMap((sprint) => sprint.slots.map((slot) => slot.default_activity)).flatMap((activity) => (state.activityWork[activity.key]?.savedGlossaryKeys ?? []).map((key) => activity.glossary.find((item) => item.key === key)).filter(Boolean).map((item) => ({ ...item!, activity: activity.title }))), [state]);
  const notes = Object.values(state.sprints).flatMap((sprint) => sprint.slots.map((slot) => slot.default_activity)).map((activity) => ({ activity: activity.title, note: state.activityWork[activity.key]?.learnerNote ?? "" })).filter((item) => item.note.trim());
  return <section className="review card"><button className="back" onClick={() => onGo(state.activeSprintKey ? "sprint" : "home")}>← Back</button><p className="eyebrow">Your local learning context</p><h1>My language</h1><p>These are phrases you chose to revisit and notes you wrote. They are not AI-diagnosed errors.</p><h2>Saved for practice</h2>{entries.length ? <ul>{entries.map((item) => <li key={`${item.activity}-${item.key}`}><strong>{item.canonical_form}</strong> — {item.meaning_ru}<small>{item.activity}</small></li>)}</ul> : <p className="quiet">Save a phrase from an activity to see it here.</p>}<h2>Your notes</h2>{notes.length ? <ul>{notes.map((item) => <li key={item.activity}><strong>{item.activity}</strong>: {item.note}</li>)}</ul> : <p className="quiet">You can add a note in an activity reflection.</p>}<p className="notice">This MVP stores learning data only in this browser. Clearing this site’s browser data removes it.</p></section>;
}

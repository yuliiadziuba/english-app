import { SprintSchema, type ActivityPlan, type Sprint } from "../domain/content/schema.js";

export const LOCAL_STATE_VERSION = 1;
export const LOCAL_STORAGE_KEY = "english-learning-app:state";

export type Screen = "home" | "sprint" | "activity" | "reflection" | "import" | "review";

export interface ActivityWork {
  currentStepIndex: number;
  completedStepKeys: string[];
  answers: Record<string, unknown>;
  savedGlossaryKeys: string[];
  selfAssessment?: "clear" | "try_again" | "need_support" | undefined;
  learnerNote: string;
  finished: boolean;
}

export interface LocalLearningState {
  version: number;
  sprints: Record<string, Sprint>;
  activeSprintKey?: string;
  activeActivityKey?: string;
  activityWork: Record<string, ActivityWork>;
  screen: Screen;
}

export type LocalAction =
  | { type: "accept_sprint"; sprint: Sprint }
  | { type: "open_activity"; activityKey: string }
  | { type: "go"; screen: Screen }
  | { type: "set_answer"; activityKey: string; stepKey: string; answer: unknown }
  | { type: "complete_step"; activityKey: string; stepKey: string; nextStepIndex?: number }
  | { type: "toggle_glossary"; activityKey: string; glossaryKey: string }
  | { type: "set_note"; activityKey: string; note: string }
  | { type: "set_assessment"; activityKey: string; assessment: ActivityWork["selfAssessment"] }
  | { type: "finish"; activityKey: string };

export function emptyLocalState(): LocalLearningState {
  return { version: LOCAL_STATE_VERSION, sprints: {}, activityWork: {}, screen: "home" };
}

export function createActivityWork(): ActivityWork {
  return { currentStepIndex: 0, completedStepKeys: [], answers: {}, savedGlossaryKeys: [], learnerNote: "", finished: false };
}

export function localReducer(state: LocalLearningState, action: LocalAction): LocalLearningState {
  if (action.type === "accept_sprint") {
    const sprint = structuredClone(action.sprint);
    if (state.sprints[sprint.sprint_key]) return { ...state, activeSprintKey: sprint.sprint_key, screen: "sprint" };
    return { ...state, sprints: { ...state.sprints, [sprint.sprint_key]: sprint }, activeSprintKey: sprint.sprint_key, screen: "sprint" };
  }
  if (action.type === "go") return { ...state, screen: action.screen };
  if (action.type === "open_activity") {
    return { ...state, activeActivityKey: action.activityKey, activityWork: ensureWork(state, action.activityKey), screen: "activity" };
  }
  const current = state.activityWork[action.activityKey];
  if (!current) return state;
  const update = (work: ActivityWork, screen = state.screen): LocalLearningState => ({
    ...state,
    screen,
    activityWork: { ...state.activityWork, [action.activityKey]: work },
  });
  if (action.type === "set_answer") return update({ ...current, answers: { ...current.answers, [action.stepKey]: structuredClone(action.answer) } });
  if (action.type === "complete_step") {
    const completedStepKeys = current.completedStepKeys.includes(action.stepKey) ? current.completedStepKeys : [...current.completedStepKeys, action.stepKey];
    return update({ ...current, completedStepKeys, currentStepIndex: action.nextStepIndex ?? current.currentStepIndex });
  }
  if (action.type === "toggle_glossary") {
    const savedGlossaryKeys = current.savedGlossaryKeys.includes(action.glossaryKey)
      ? current.savedGlossaryKeys.filter((key) => key !== action.glossaryKey)
      : [...current.savedGlossaryKeys, action.glossaryKey];
    return update({ ...current, savedGlossaryKeys });
  }
  if (action.type === "set_note") return update({ ...current, learnerNote: action.note });
  if (action.type === "set_assessment") return update({ ...current, selfAssessment: action.assessment });
  if (action.type === "finish") return update({ ...current, finished: true }, "reflection");
  return state;
}

function ensureWork(state: LocalLearningState, activityKey: string): Record<string, ActivityWork> {
  return state.activityWork[activityKey] ? state.activityWork : { ...state.activityWork, [activityKey]: createActivityWork() };
}

export function findActivity(state: LocalLearningState, activityKey = state.activeActivityKey): ActivityPlan | undefined {
  if (!activityKey) return undefined;
  return Object.values(state.sprints).flatMap((sprint) => sprint.slots).flatMap((slot) => [slot.default_activity, ...slot.alternatives]).find((activity) => activity.key === activityKey);
}

export function loadLocalState(storage: Pick<Storage, "getItem"> | undefined): LocalLearningState {
  if (!storage) return emptyLocalState();
  const raw = storage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return emptyLocalState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return isLocalState(parsed) ? parsed : emptyLocalState();
  } catch {
    return emptyLocalState();
  }
}

export function saveLocalState(state: LocalLearningState, storage: Pick<Storage, "setItem"> | undefined): void {
  storage?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function isLocalState(value: unknown): value is LocalLearningState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LocalLearningState>;
  if (candidate.version !== LOCAL_STATE_VERSION || !candidate.sprints || !candidate.activityWork || !isScreen(candidate.screen)) return false;
  return Object.values(candidate.sprints).every((sprint) => SprintSchema.safeParse(sprint).success)
    && Object.values(candidate.activityWork).every(isActivityWork);
}

function isScreen(value: unknown): value is Screen {
  return typeof value === "string" && ["home", "sprint", "activity", "reflection", "import", "review"].includes(value);
}

function isActivityWork(value: unknown): value is ActivityWork {
  if (!value || typeof value !== "object") return false;
  const work = value as Partial<ActivityWork>;
  return typeof work.currentStepIndex === "number" && Array.isArray(work.completedStepKeys) && typeof work.answers === "object"
    && Array.isArray(work.savedGlossaryKeys) && typeof work.learnerNote === "string" && typeof work.finished === "boolean";
}

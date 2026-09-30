import type { ImportPreview } from "./import.js";
import type { Sprint } from "./schema.js";

export interface ImportedSprintRecord {
  id: string;
  ownerScope: string;
  requestKey: string;
  fingerprint: string;
  sprint: Sprint;
}

export type CommitImportResult =
  | { status: "created"; record: ImportedSprintRecord }
  | { status: "duplicate"; record: ImportedSprintRecord };

export interface SprintImportRepository {
  commit(preview: ImportPreview, requestKey: string): Promise<CommitImportResult>;
  listByOwner(ownerScope: string): Promise<readonly ImportedSprintRecord[]>;
}

export class InMemorySprintImportRepository implements SprintImportRepository {
  readonly #records: ImportedSprintRecord[] = [];
  readonly #failAtSlot: number | undefined;

  constructor(options: { failAtSlot?: number } = {}) {
    this.#failAtSlot = options.failAtSlot;
  }

  async commit(preview: ImportPreview, requestKey: string): Promise<CommitImportResult> {
    const duplicate = this.#records.find(
      (record) =>
        record.ownerScope === preview.ownerScope &&
        (record.requestKey === requestKey || record.fingerprint === preview.fingerprint),
    );
    if (duplicate) return { status: "duplicate", record: structuredClone(duplicate) };

    const transactionCopy = structuredClone(this.#records);
    const slotSnapshots: Sprint["slots"] = [];
    try {
      preview.sprint.slots.forEach((slot, index) => {
        if (this.#failAtSlot === index + 1) throw new Error(`Simulated nested write failure at slot ${index + 1}`);
        slotSnapshots.push(structuredClone(slot));
      });
      const record: ImportedSprintRecord = {
        id: `import-${this.#records.length + 1}`,
        ownerScope: preview.ownerScope,
        requestKey,
        fingerprint: preview.fingerprint,
        sprint: structuredClone({ ...preview.sprint, slots: slotSnapshots }),
      };
      this.#records.push(record);
      return { status: "created", record: structuredClone(record) };
    } catch (error) {
      this.#records.splice(0, this.#records.length, ...transactionCopy);
      throw error;
    }
  }

  async listByOwner(ownerScope: string): Promise<readonly ImportedSprintRecord[]> {
    return structuredClone(this.#records.filter((record) => record.ownerScope === ownerScope));
  }
}

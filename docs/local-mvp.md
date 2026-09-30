# Local MVP

This MVP is a private, browser-local English practice application. It has no account, cloud sync, runtime AI request, or AI API key.

## Run locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Use it

1. Select **Start the sample sprint** to load the bundled seven-slot example.
2. Open any activity. Your responses, completed steps, selected language, and note are saved in this browser.
3. Select underlined language for contextual Russian help, then choose **Save for practice** if you want to revisit it.
4. Use **Import** to paste one sprint JSON object. Validate it, review all seven slots, then explicitly import it.

The app evaluates only authored closed-answer variants. Free-text responses are saved beside examples and a comparison checklist; they are not automatically graded.

## Data boundary

Learning data is stored only in this browser's local storage. Clearing site data, changing browser profiles, or using another device removes access to this MVP's saved local state. A future account and cloud-storage change can add cross-device persistence without changing the content contract.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run schema:check
npm.cmd run content:validate
```

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import sampleSprint from "../content/examples/sample-sprint.v1.json";
import { App } from "../src/ui/App.js";

describe("MVP learner interface", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts the sample sprint and opens the first activity", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Начать пример спринта" }));
    expect(screen.getByRole("heading", { name: "Active English Contract Sample" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Начать" })[0]!);
    expect(screen.getByRole("heading", { name: "A critical bug before release" })).toBeInTheDocument();
    expect(screen.getByText(/Прочитай обновление/)).toBeInTheDocument();
  });

  it("keeps invalid import text and displays its validation error", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Импорт JSON" }));
    const input = screen.getByLabelText("Sprint JSON");
    await user.type(input, "not json");
    await user.click(screen.getByRole("button", { name: "Validate sprint" }));
    expect(screen.getByText("Needs a small repair")).toBeInTheDocument();
    expect(input).toHaveValue("not json");
  });

  it("shows all seven validated slots before explicit import", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Импорт JSON" }));
    await user.click(screen.getByLabelText("Sprint JSON"));
    await user.paste(JSON.stringify(sampleSprint));
    await user.click(screen.getByRole("button", { name: "Validate sprint" }));
    expect(screen.getByRole("heading", { name: "Preview: Active English Contract Sample" })).toBeInTheDocument();
    expect(screen.getAllByText(/contextual translations/)).toHaveLength(7);
    await user.click(screen.getByRole("button", { name: "Import this sprint" }));
    expect(screen.getByRole("heading", { name: "Active English Contract Sample" })).toBeInTheDocument();
  });

  it("restores an activity after the interface is remounted", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: "Начать пример спринта" }));
    await user.click(screen.getAllByRole("button", { name: "Начать" })[0]!);
    first.unmount();
    render(<App />);
    expect(screen.getByRole("heading", { name: "A critical bug before release" })).toBeInTheDocument();
  });
});

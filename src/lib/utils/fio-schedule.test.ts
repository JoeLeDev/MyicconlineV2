import { describe, expect, it } from "vitest";
import {
  formatFioSchedule,
  sortWeekdays,
  translateWeekday,
} from "./fio-schedule";

describe("translateWeekday", () => {
  it("traduit Monday en français", () => {
    expect(translateWeekday("Monday", "fr")).toBe("Lundi");
  });

  it("conserve une valeur inconnue", () => {
    expect(translateWeekday("Non défini", "fr")).toBe("Non défini");
  });
});

describe("formatFioSchedule", () => {
  it("combine jour traduit et horaire", () => {
    expect(formatFioSchedule("Wednesday", "17:00", "fr")).toBe(
      "Mercredi · 17:00",
    );
  });
});

describe("sortWeekdays", () => {
  it("ordonne les jours de la semaine", () => {
    expect(sortWeekdays(["Friday", "Monday", "Wednesday"])).toEqual([
      "Monday",
      "Wednesday",
      "Friday",
    ]);
  });
});

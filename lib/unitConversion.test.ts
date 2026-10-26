import { describe, it, expect } from "vitest";
import { formatQuantity, normalizeUnit, roundForShopping } from "./unitConversion";

describe("roundForShopping", () => {
  it("rounds small ml/g amounts to whole units, at least 1", () => {
    expect(roundForShopping(1.25, "ml")).toEqual({ quantity: 1, unit: "ml" });
    expect(roundForShopping(0.4, "g")).toEqual({ quantity: 1, unit: "g" });
    expect(roundForShopping(0, "g")).toEqual({ quantity: 0, unit: "g" });
  });

  it("scales up past 1000", () => {
    expect(roundForShopping(1500, "g")).toEqual({ quantity: 1.5, unit: "kg" });
  });

  it("rounds count units up, ignoring float noise from rescaling", () => {
    expect(roundForShopping(1.2, "piece")).toEqual({ quantity: 2, unit: "piece" });
    expect(roundForShopping(1.0000001, "piece")).toEqual({ quantity: 1, unit: "piece" });
    expect(roundForShopping(0.999999, "piece")).toEqual({ quantity: 1, unit: "piece" });
  });
});

describe("normalizeUnit", () => {
  it("folds aliases and plurals of count units", () => {
    expect(normalizeUnit("whole")).toBe("piece");
    expect(normalizeUnit("Cloves")).toBe("clove");
    expect(normalizeUnit("g")).toBe("g");
  });
});

describe("formatQuantity", () => {
  it("rounds to 2 decimals for display", () => {
    expect(formatQuantity(0.333333)).toBe(0.33);
    expect(formatQuantity(0.999999)).toBe(1);
  });
});

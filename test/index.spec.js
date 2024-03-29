const fs = require("fs");
const { findMeetingTime } = require("../src/index");

const parseFileToTable = (filename) => {
  const content = fs.readFileSync(filename, "utf8");
  const lines = content.trim().split("\n");
  return lines;
};

// J'ai pas utilisé de Mock pour les tests unitaires mais j'aurais pu.

describe("../src/index", () => {
  describe("Test unitaires pour la fonction findMeetingTime", () => {
    // Trois (voir plus) manière de tester la fonction avec les fichier fournis

    // Proposition 1: Classique
    it("Test de base avec des horaires disponibles", () => {
      const schedules = parseFileToTable("./data/input1.txt");
      expect(findMeetingTime({ dataInput: schedules })).toBe("1 13:00-13:59");
    });

    // Proposition 2: it.each (ma pref)
    it.each([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ])("Test each avec input%s.txt et output%d.txt", (input, output) => {
      expect(
        findMeetingTime({
          dataInput: parseFileToTable(`./data/input${input}.txt`),
        }),
      ).toBe(parseFileToTable(`./data/output${output}.txt`).toString());
    });

    // Proposition 3: En utilisant un forEach (pas ma pref du tout ^^)
    const testCases = [1, 2, 3, 4, 5];
    testCases.forEach((nb) => {
      test(`Test forEach avec input${nb}.text`, () => {
        const dataInput = parseFileToTable(`./data/input${nb}.txt`);
        const expectedOutput = parseFileToTable(
          `./data/output${nb}.txt`,
        ).toString();
        expect(findMeetingTime({ dataInput })).toBe(expectedOutput);
      });
    });

    it("Test avec tous les horaires indisponibles", () => {
      const schedules = [
        "1 08:00-17:59",
        "2 08:00-17:59",
        "3 08:00-17:59",
        "4 08:00-17:59",
        "5 08:00-17:59",
      ];
      expect(findMeetingTime({ dataInput: schedules })).toBe(
        "Aucun horaire de réunion disponible.",
      );
    });

    it("Test avec reunion 'surprise' intercalés", () => {
      const schedules = [
        "1 15:00-15:09",
        "1 14:00-15:29",
        "1 08:00-09:00",
        "1 08:00-13:29",
        "2 08:00-08:59",
        "2 08:00-08:30",
      ];
      expect(findMeetingTime({ dataInput: schedules, hoursEnd: "16:00" })).toBe(
        "2 09:00-09:59",
      );
    });

    it("Test avec reunion qui se chevauche (verif 1)", () => {
      const schedules = ["1 08:30-09:29", "1 09:00-09:59", "1 09:40-10:09"];
      expect(findMeetingTime({ dataInput: schedules, hoursEnd: "16:00" })).toBe(
        "1 10:10-11:09",
      );
    });

    it("Test avec reunion qui se chevauche (verif 2)", () => {
      const schedules = ["1 10:00-10:59", "1 08:00-09:59"];
      expect(findMeetingTime({ dataInput: schedules, hoursEnd: "16:00" })).toBe(
        "1 11:00-11:59",
      );
    });

    it("Test avec reunion qui se chevauche (verif 3)", () => {
      const schedules = [
        "1 15:00-15:09",
        "1 14:00-15:29",
        "1 08:00-09:00",
        "1 08:00-13:29",
        "2 08:00-08:59",
        "2 08:00-08:30",
        "2 08:00-15:59",
      ];
      expect(findMeetingTime({ dataInput: schedules, hoursEnd: "16:00" })).toBe(
        "Aucun horaire de réunion disponible.",
      );
    });

    it("Test avec tableau vide", () => {
      expect(findMeetingTime({ hoursEnd: "16:00" })).toBe(
        "Aucun horaire de réunion disponible.",
      );
    });
  });

  describe("Test d'intégration pour la fonction findMeetingTime", () => {
    test("Test d'intégration avec des données réelles", () => {
      const schedules = [
        "1 08:45-12:59",
        "3 11:09-11:28",
        "5 09:26-09:56",
        "5 16:15-16:34",
        "3 08:40-10:12",
      ];
      expect(findMeetingTime({ dataInput: schedules })).toMatch(
        /^\d+ \d\d:\d\d-\d\d:\d\d$/,
      );
    });
  });
});

const {
  toMinutes,
  toTime,
  getFirstSlot,
  filterAndSortResult,
  getIfReportMeeting,
} = require("../src/utils");

describe("../src/utils.js", () => {
  describe("Test unitaires pour toMinutes", () => {
    it("Convertir 12:00 en minutes", () => {
      expect(toMinutes({ time: "12:00" })).toBe(720);
    });

    it("Convertir 00:00 en minutes", () => {
      expect(toMinutes({ time: "00:00" })).toBe(0);
    });

    it("Convertir 23:59 en minutes", () => {
      expect(toMinutes({ time: "23:59" })).toBe(1439);
    });
  });

  describe("Test unitaires pour toTime", () => {
    test('Convertir 720 minutes en heure au format "hh:mm"', () => {
      expect(toTime({ minutes: 720 })).toBe("12:00");
    });

    test('Convertir 0 minute en heure au format "hh:mm"', () => {
      expect(toTime({ minutes: 0 })).toBe("00:00");
    });

    test('Convertir 1439 minutes en heure au format "hh:mm"', () => {
      expect(toTime({ minutes: 1439 })).toBe("23:59");
    });
  });

  describe("Test unitaires pour getFirstSlot", () => {
    it("Devrait retourner 0", () => {
      expect(
        getFirstSlot({
          startDay: 0,
          endDay: 1439,
          meetingDuration: 60,
          startMeeting: 720,
          endMeeting: 1000,
        })
      ).toBe(0);
    });

    it("Devrait retourner null", () => {
      expect(
        getFirstSlot({
          startDay: 300,
          endDay: 500,
          meetingDuration: 60,
          startMeeting: 200,
          endMeeting: 800,
        })
      ).toBe(null);
    });

    it("Devrait retourner 750", () => {
      expect(
        getFirstSlot({
          startDay: 700,
          endDay: 800,
          meetingDuration: 10,
          startMeeting: 702,
          endMeeting: 749,
        })
      ).toBe(750);
    });
  });

  describe("Test unitaires pour filterAndSortResult", () => {
    it("Devrait retourner un tableau trie", () => {
      const days = [
        { dayOfWeek: 1, firstSlot: 3 },
        { dayOfWeek: 2, firstSlot: null },
        { dayOfWeek: 3, firstSlot: 1 },
        { dayOfWeek: 4, firstSlot: 5 },
        { dayOfWeek: 5, firstSlot: 2 },
      ];
      const daysOverBooking = [2, 4];
      const expectedResult = [
        { dayOfWeek: 1, firstSlot: 3 },
        { dayOfWeek: 3, firstSlot: 1 },
        { dayOfWeek: 5, firstSlot: 2 },
      ];
      expect(filterAndSortResult({ days, daysOverBooking })).toEqual(
        expectedResult
      );
    });

    it("Devrait retourner un tableau trie plus complexe", () => {
      const days = [
        { dayOfWeek: 1, firstSlot: 3 },
        { dayOfWeek: 1, firstSlot: 1 },
        { dayOfWeek: 1, firstSlot: 1 },
        { dayOfWeek: 1, firstSlot: 2 },
        { dayOfWeek: 2, firstSlot: null },
        { dayOfWeek: 3, firstSlot: 1 },
        { dayOfWeek: 4, firstSlot: 5 },
        { dayOfWeek: 5, firstSlot: 2 },
      ];
      const daysOverBooking = [2, 3, 4];
      const expectedResult = [
        { dayOfWeek: 1, firstSlot: 3 },
        { dayOfWeek: 1, firstSlot: 2 },
        { dayOfWeek: 1, firstSlot: 1 },
        { dayOfWeek: 1, firstSlot: 1 },
        { dayOfWeek: 5, firstSlot: 2 },
      ];
      expect(filterAndSortResult({ days, daysOverBooking })).toEqual(
        expectedResult
      );
    });

    it("Devrait retourner un tableau vide", () => {
      expect(filterAndSortResult({})).toEqual([]);
    });
  });

  describe("Test unitaires pour getIfReportMeeting", () => {
    it("Devrait retourner null", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 1079,
        })
      ).toBe(null);
    });

    it("Cas (verif 1) Devrait retourner la ligne qui se chevauche", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 540,
            endMeeting: 599,
            firstSlot: 600,
          },
          days: [
            {
              dayOfWeek: 1,
              startMeeting: 570,
              endMeeting: 569,
              firstSlot: 570,
            },
            {
              dayOfWeek: 1,
              startMeeting: 580,
              endMeeting: 609,
              firstSlot: 540,
            },
          ],
          meetingDuration: 60,
          workingHoursEnd: 1079,
        })
      ).toEqual({
        dayOfWeek: 1,
        startMeeting: 580,
        endMeeting: 609,
        firstSlot: 610,
      });
    });

    it("Cas (verif 1) Devrait retourner la ligne qui se chevauche avec acc deja remplis", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 540,
            endMeeting: 599,
            firstSlot: 600,
          },
          days: [
            {
              dayOfWeek: 1,
              startMeeting: 570,
              endMeeting: 569,
              firstSlot: 570,
            },
            {
              dayOfWeek: 1,
              startMeeting: 580,
              endMeeting: 609,
              firstSlot: 540,
            },
            {
              dayOfWeek: 1,
              startMeeting: 581,
              endMeeting: 610,
              firstSlot: 540,
            },
          ],
          meetingDuration: 60,
          workingHoursEnd: 1079,
        })
      ).toEqual({
        dayOfWeek: 1,
        startMeeting: 581,
        endMeeting: 610,
        firstSlot: 611,
      });
    });

    it("Cas (verif 1) Devrait retourner la ligne qui se chevauche avec acc deja remplis mais ne rentre pas dans la condition du else if", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 540,
            endMeeting: 599,
            firstSlot: 600,
          },
          days: [
            {
              dayOfWeek: 1,
              startMeeting: 570,
              endMeeting: 569,
              firstSlot: 570,
            },
            {
              dayOfWeek: 1,
              startMeeting: 580,
              endMeeting: 609,
              firstSlot: 540,
            },
            {
              dayOfWeek: 1,
              startMeeting: 579,
              endMeeting: 608,
              firstSlot: 540,
            },
          ],
          meetingDuration: 60,
          workingHoursEnd: 1079,
        })
      ).toEqual({
        dayOfWeek: 1,
        startMeeting: 580,
        endMeeting: 609,
        firstSlot: 610,
      });
    });

    it("Cas (verif 1) Devrait retourner la ligne qui se chevauche mais rentre dans la condition error", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 540,
            endMeeting: 599,
            firstSlot: 600,
          },
          days: [
            {
              dayOfWeek: 1,
              startMeeting: 570,
              endMeeting: 569,
              firstSlot: 570,
            },
            {
              dayOfWeek: 1,
              startMeeting: 580,
              endMeeting: 609,
              firstSlot: 540,
            },
          ],
          meetingDuration: 60,
          workingHoursEnd: 630,
        })
      ).toEqual("error");
    });

    it("Cas (verif 3) Devrait retourner la ligne qui se chevauche", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 28, endMeeting: 37, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 1079,
        })
      ).toEqual({
        dayOfWeek: 1,
        startMeeting: 28,
        endMeeting: 37,
        firstSlot: 38,
      });
    });

    it("Cas (verif 2) Devrait retourner la ligne qui est englobé et actualise le Fs", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 22, endMeeting: 28, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 1000,
        })
      ).toEqual({
        dayOfWeek: 1,
        endMeeting: 28,
        startMeeting: 22,
        firstSlot: 29,
      });
    });

    it("Cas (verif 2) Devrait retourner la ligne qui est englobé et actualise le Fs mais tombe en error", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 22, endMeeting: 28, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 35,
        })
      ).toEqual("error");
    });

    it("Cas (verif 3) Devrait retourner la ligne qui se chevauche avec acc deja rempli et ne rentre pas dans la condition du else if", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 28, endMeeting: 37, firstSlot: 1 },
            { dayOfWeek: 1, startMeeting: 27, endMeeting: 36, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 1079,
        })
      ).toEqual({
        dayOfWeek: 1,
        startMeeting: 28,
        endMeeting: 37,
        firstSlot: 38,
      });
    });

    it("Cas (verif 3) Devrait retourner la ligne qui se chevauche avec acc deja rempli et rentre dans la condition du else if", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 28, endMeeting: 37, firstSlot: 1 },
            { dayOfWeek: 1, startMeeting: 29, endMeeting: 38, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 1079,
        })
      ).toEqual({
        dayOfWeek: 1,
        startMeeting: 29,
        endMeeting: 38,
        firstSlot: 39,
      });
    });

    it("Devrait retourner une error car la reunion n'a pas pu etre placé", () => {
      expect(
        getIfReportMeeting({
          dayD: {
            dayOfWeek: 1,
            startMeeting: 10,
            endMeeting: 19,
            firstSlot: 20,
          },
          days: [
            { dayOfWeek: 1, startMeeting: 28, endMeeting: 37, firstSlot: 1 },
            { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
            { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
          ],
          meetingDuration: 10,
          workingHoursEnd: 38,
        })
      ).toEqual("error");
    });
  });
});

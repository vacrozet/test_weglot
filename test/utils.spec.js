const {
  toMinutes,
  toTime,
  getFirstSlot,
  filterAndSortResult,
  getIfReportMeeting,
} = require("../../src/utils");

describe("Test unitaires pour toMinutes", () => {
  it("Convertir 12:00 en minutes", () => {
    expect(toMinutes("12:00")).toBe(720);
  });

  it("Convertir 00:00 en minutes", () => {
    expect(toMinutes("00:00")).toBe(0);
  });

  it("Convertir 23:59 en minutes", () => {
    expect(toMinutes("23:59")).toBe(1439);
  });
});

describe("Test unitaires pour toTime", () => {
  test('Convertir 720 minutes en heure au format "hh:mm"', () => {
    expect(toTime(720)).toBe("12:00");
  });

  test('Convertir 0 minute en heure au format "hh:mm"', () => {
    expect(toTime(0)).toBe("00:00");
  });

  test('Convertir 1439 minutes en heure au format "hh:mm"', () => {
    expect(toTime(1439)).toBe("23:59");
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
});

describe("Test unitaires pour getIfReportMeeting", () => {
  it("Devrait retourner null", () => {
    expect(
      getIfReportMeeting({
        dayD: { dayOfWeek: 1, startMeeting: 10, endMeeting: 19, firstSlot: 20 },
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

  it("Devrait retourner la ligne qui se chevauche avec firstSlot actualisé", () => {
    expect(
      getIfReportMeeting({
        dayD: { dayOfWeek: 1, startMeeting: 10, endMeeting: 19, firstSlot: 20 },
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

  it("Devrait retourner une error car la reunion n'a pas pu etre placé", () => {
    expect(
      getIfReportMeeting({
        dayD: { dayOfWeek: 1, startMeeting: 10, endMeeting: 19, firstSlot: 20 },
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

  it("Devrait retourner la ligne qui englobe firstSlot et firstSlot + meetingDuration et firstSlot actualisé", () => {
    expect(
      getIfReportMeeting({
        dayD: { dayOfWeek: 1, startMeeting: 10, endMeeting: 19, firstSlot: 20 },
        days: [
          { dayOfWeek: 1, startMeeting: 28, endMeeting: 33, firstSlot: 1 },
          { dayOfWeek: 3, startMeeting: 2, endMeeting: 12, firstSlot: 1 },
          { dayOfWeek: 5, startMeeting: 2, endMeeting: 12, firstSlot: 2 },
        ],
        meetingDuration: 10,
        workingHoursEnd: 1000,
      })
    ).toEqual({
      dayOfWeek: 1,
      endMeeting: 33,
      startMeeting: 28,
      firstSlot: 34,
    });
  });
});

const {
  toTime,
  toMinutes,
  getFirstSlot,
  filterAndSortResult,
  getIfReportMeeting,
} = require("./utils");

const IMPOSSIBLE = "Aucun horaire de réunion disponible.";

const findMeetingRecursive = ({
  days,
  workingHoursEnd,
  meetingDuration,
  daysOverBooking,
}) => {
  const newDays = filterAndSortResult({
    days,
    daysOverBooking: daysOverBooking,
  });

  const dayD = newDays.length > 0 ? newDays[0] : null;

  if (!dayD) {
    return IMPOSSIBLE;
  }

  const reschedulingMeeting = getIfReportMeeting({
    dayD,
    days: newDays.slice(1),
    meetingDuration,
    workingHoursEnd,
  });

  /*
   * 3 états pour reschedulingMeeting:
   * - error: ==> l'on ne peut pas poser de reunion le jour J on rappelle la fonction avec un nouveau trie de tableau
   * - null: ==> tout est OK, on ne trouve pas de réunion surprise entre hh:mm et hh:mm + meetingDuration
   * - { dayOfWeek: 'x', start: xxx, end: xxx, firstSlot: xxx }: ==> on a trouver une nouvelle date, car on réunion c'était glissé entre hh:mm et hh:mm + meetingDuration
   *
   */

  // Si reschedulingMeeting est "error" cela veut dire que l'on ne peut pas poser de reunion,
  // on passe au jour suivant en rappellant la fonction avec un nouveau trie de tableau
  if (reschedulingMeeting === "error") {
    return findMeetingRecursive({
      days: newDays,
      workingHoursEnd,
      meetingDuration,
      // On ajout le jour de la semaine qui tombe en error dans daysOverBooking
      daysOverBooking: [...daysOverBooking, dayD.dayOfWeek],
    });
  } else {
    // Si rescheduling, mais si il est null, le jour qui était deja defini
    return reschedulingMeeting || dayD;
  }
};

const findMeetingTime = ({
  dataInput = [],
  hoursStart = "08:00",
  hoursEnd = "17:59",
  duration = 60,
}) => {
  const startDay = toMinutes(hoursStart);
  const endDay = toMinutes(hoursEnd);
  const meetingDuration = duration; // Durée de la réunion en minutes

  const formattedDays = dataInput.map((line) => {
    const [dayOfWeek, range] = line.split(" ");
    const [startMeeting, endMeeting] = range.split("-").map(toMinutes);
    // Trouver le premier slot disponible
    const firstSlot = getFirstSlot({
      startDay,
      endDay,
      meetingDuration,
      startMeeting,
      endMeeting,
    });
    return {
      dayOfWeek,
      startMeeting,
      endMeeting,
      firstSlot,
    };
  });

  /*
   * On regarde si j'ai un first slot à null
   * Cela voudra dire que je ne peux pas poser de meeting ce jour là,
   * Je crée donc un tableau avec les jours ou j'ai un firstSlot à null
   */
  // Je ne met pas cette fonction dans la fonction recursive car on ne l'utilise qu'une seul fois
  const daysOverBooking = formattedDays.reduce(
    (acc, { dayOfWeek, firstSlot }) => {
      if (firstSlot === null && !acc.includes(dayOfWeek)) {
        acc.push(dayOfWeek);
      }
      return acc;
    },
    []
  );

  // c'est la ou est le coeur du réacteur
  if (formattedDays.length > 0) {
    const rescheduling = findMeetingRecursive({
      days: formattedDays,
      workingHoursEnd: endDay,
      meetingDuration,
      daysOverBooking,
    });

    if (rescheduling === IMPOSSIBLE) {
      return IMPOSSIBLE;
    }

    return `${rescheduling.dayOfWeek} ${toTime(
      rescheduling.firstSlot
    )}-${toTime(rescheduling.firstSlot + meetingDuration - 1)}`;
  }
};

module.exports = {
  findMeetingTime,
  findMeetingRecursive,
};
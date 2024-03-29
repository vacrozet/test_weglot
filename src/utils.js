// Fonction pour convertir l'heure en minutes
const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Fonction pour convertir des minutes depuis minuit en horaire (hh:mm)
const toTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

// Fonction pour aller chercher le premier slot disponible
const getFirstSlot = ({
  startDay,
  endDay,
  meetingDuration,
  startMeeting,
  endMeeting,
}) => {
  /*
   * Si startDy + le temps de la réunion sont en dessous ou egal au debut de la reunion deja posé
   * On déterminer que le premier slot disponible du temps de la réunion est celui-ci
   */
  if (startDay + meetingDuration <= startMeeting) {
    return startDay;
    /*
     * Si on ne rentre pas dans le premier if,
     * on va regarder si on a un slot du temps de la réunion apres la réunion deja posé
     * Si c'est le cas, la fin du meeting + 1 minute
     */
  } else if (endMeeting + meetingDuration <= endDay) {
    // Il faut mettre une minute en plus quand on termine sur la fin de la reunion - 8:59 => 9:00
    return endMeeting + 1;
    /*
     * Si on ne rentre pas dans le premier if ni le deuxieme,
     * cela veut dire que l'on ne peut pas poser de reunion
     */
  } else {
    return null;
  }
};

const filterAndSortResult = ({ days = [], daysOverBooking = [] }) => {
  // On ne garde que les jours ou j'ai un first slot non null
  return days
    .filter((day) => !daysOverBooking.includes(day.dayOfWeek))
    .sort((a, b) => {
      /*
       * Je fais 2 tries.
       * On trie par jour puis par firstSlot (desc) pour avoir le premier créneau disponible
       * de celui qui est le plus occupé
       */
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      } else {
        return b.firstSlot - a.firstSlot;
      }
    });
};

/*
 * Reprenons un peu la logique:
 * - On ne peut pas avoir de réunion en dessous du firstSlot de celui qui est le plus occupé
 * - Mais rien n'empeche d'avoir une réunion au dessus du firstSlot de celui qui est le plus occupé
 * Du coup:
 * - On regarde si le firstSlot (+ le temps) de celui qui est le plus occupé:
 * --> N'englobe pas un slot voisin (verif 1)
 * --> Ne chevauche pas un slot voisin (verif 2)
 */
const getIfReportMeeting = ({
  dayD,
  days,
  meetingDuration,
  workingHoursEnd,
}) => {
  // console.log({ dayD, days });
  return days.reduce((acc, day) => {
    if (acc !== "error") {
      // N'englobe pas un slot voisin (verif 1)
      if (
        dayD.firstSlot <= day.startMeeting &&
        dayD.firstSlot + meetingDuration >= day.endMeeting
      ) {
        // console.log("je passe la");
        if (day.endMeeting + meetingDuration > workingHoursEnd) {
          // Je met acc a "error" pour la suite
          acc = "error";
        } else {
          // Si il englobe un slot voisin, on prend la fin de la reunion du slot voisin (+ 1 minutes)
          if (!acc) {
            /*
             * On verifie si la fin de la reunion du slot voisin
             * + le temps de la futur reunion est superieur à la fin de la journee
             * Si c'est le cas, on ne peut pas poser de reunion ==> Erreur
             */
            acc = { ...day, firstSlot: day.endMeeting + 1 };
          } else if (day.endMeeting >= acc.firstSlot) {
            acc = { ...day, firstSlot: day.endMeeting + 1 };
          }
        }
        return acc;
      }

      // Ne chevauche pas un slot voisin (verif 2)
      if (
        dayD.firstSlot < day.startMeeting &&
        dayD.firstSlot + meetingDuration > day.startMeeting &&
        dayD.firstSlot + meetingDuration < day.endMeeting
      ) {
        if (day.endMeeting + meetingDuration > workingHoursEnd) {
          // Je met acc a "error" pour la suite
          acc = "error";
        } else {
          if (!acc) {
            acc = { ...day, firstSlot: day.endMeeting + 1 };
          } else if (day.endMeeting >= acc.firstSlot) {
            acc = { ...day, firstSlot: day.endMeeting + 1 };
          }
        }
        return acc;
      }
      return acc;
    }
    return acc;
  }, null);
};

module.exports = {
  toTime,
  toMinutes,
  getFirstSlot,
  filterAndSortResult,
  getIfReportMeeting,
};

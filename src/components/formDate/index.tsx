import { Timestamp } from "firebase/firestore";

const formDate = (date: string | Timestamp): string => {
  if (!date) return "";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === "string") {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    dateObj = new Date(date);
  } else {
    return "";
  }

  const offset = dateObj.getTimezoneOffset() * 60000;
  const localTime = dateObj.getTime() - offset;

  return new Date(localTime).toISOString().slice(0, 10);
};

export default formDate;

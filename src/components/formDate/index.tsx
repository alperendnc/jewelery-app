import { Timestamp } from "firebase/firestore";

const formDate = (isoDate: string | Timestamp): string => {
  if (typeof isoDate === "string") return isoDate;
  if (isoDate instanceof Timestamp) {
    return isoDate.toDate().toISOString().slice(0, 10);
  }
  return new Date(isoDate as any).toISOString().slice(0, 10);
};

export default formDate;

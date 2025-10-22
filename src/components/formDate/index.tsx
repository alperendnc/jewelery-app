import { Timestamp } from "firebase/firestore";

const formDate = (date: string | Timestamp | undefined | null): string => {
  if (!date) return "Tarih Yok";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === "string") {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }

    const cleanDate = date.replace(/"/g, "").trim();

    const parts = cleanDate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (parts) {
      const day = parts[1].padStart(2, "0");
      const month = parts[2].padStart(2, "0");
      const year = parts[3];

      dateObj = new Date(`${year}/${month}/${day}`);
    } else {
      dateObj = new Date(cleanDate);
    }
  } else {
    return "Tip Hatası";
  }

  if (isNaN(dateObj.getTime())) {
    console.error("Geçersiz tarih string'i algılandı ve kurtarılamadı:", date);
    return "Format Hatalı";
  }

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default formDate;

import { Timestamp } from "firebase/firestore";

// Hata verilerini konsolda görebilmek için fonksiyonu güvenceye alıyoruz
const formDate = (date: string | Timestamp | undefined | null): string => {
  if (!date) return "Tarih Yok";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    // 1. Timestamp ise doğrudan toDate()
    dateObj = date.toDate();
  } else if (typeof date === "string") {
    // 2a. Zaten YYYY-MM-DD formatındaysa geri döndür
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }

    // 2b. Olası Hatalı String Formatlarını Ayrıştırmayı Dene (DD.MM.YYYY veya DD-MM-YYYY)
    // Tırnak işaretli stringleri temizleyebiliriz
    const cleanDate = date.replace(/"/g, "").trim();

    // DD.MM.YYYY veya DD-MM-YYYY formatını YYYY/MM/DD formatına çevirerek
    // Date nesnesinin daha kolay ayrıştırmasını sağla.
    const parts = cleanDate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (parts) {
      // Türkiye formatından (GÜN.AY.YIL) ISO formatına (YIL/AY/GÜN) çevir
      const day = parts[1].padStart(2, "0");
      const month = parts[2].padStart(2, "0");
      const year = parts[3];

      // new Date() AY/GÜN/YIL formatını daha güvenli işler.
      dateObj = new Date(`${year}/${month}/${day}`);
    } else {
      // Standart Date parser'ı ile dene (ISO, Mon Jan 01 2024 vb.)
      dateObj = new Date(cleanDate);
    }
  } else {
    // 3. Beklenmedik tip
    return "Tip Hatası";
  }

  // 4. Nihai Geçerlilik Kontrolü (ANA DÜZELTME PARÇASI)
  if (isNaN(dateObj.getTime())) {
    console.error("Geçersiz tarih string'i algılandı ve kurtarılamadı:", date);
    return "Format Hatalı";
  }

  // 5. Tarihi YYYY-MM-DD formatında (Yerel Saate Göre) döndür
  // UTC kaymalarını engellemek için yerel metotları kullanıyoruz.
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default formDate;

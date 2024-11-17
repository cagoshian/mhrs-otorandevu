const moment = require("moment");
moment.locale("tr")
const prompt = require("prompt-sync")({ sigint: true });
const functions = require("./functions.js");

let denemesayisi = 0

function kontrolEt(token, il, ilce, cinsiyet, klinik, onumuzdekigun) {
   functions.kullaniciRandevulari(token).then(randevular => {
         if (randevular.aktifRandevuDtoList.filter(a => a.mhrsKlinikAdi == klinik.text && a.randevuKayitDurumu.val != 4).length <= 0) {
            const date = moment().format('YYYY-MM-DD HH:mm:ss')
            functions.randevuAra(token, il.value, ilce == "f" ? -1 : ilce.value, cinsiyet, klinik.value, String(date), String(moment().add(Number(onumuzdekigun), 'days').format('YYYY-MM-DD HH:mm:ss'))).then(veri => {
               let alinabilir = veri.hastane.sort((a, b) => new Date(a.baslangicZamani).getTime() > new Date(b.baslangicZamani).getTime())
                  functions.hekimAra(token, il.value, cinsiyet, klinik.value, alinabilir[0].kurum.mhrsKurumId, alinabilir[0].hekim.mhrsHekimId).then(veri => {
                     const kullanilabilirhekim = veri.filter(hekim => hekim.kalanKullanim > 0)
                     if (kullanilabilirhekim.length > 0) {
                        for (let hekim in kullanilabilirhekim) {
                           const saatler = kullanilabilirhekim[0].hekimSlotList[0].muayeneYeriSlotList[0].saatSlotList.filter(saat => saat.bos === true)
                           const slotList = []
                           saatler.map(saat => {
                              saat.slotList.map(a => slotList.push(a))
                           })
                           
                           const alinabilir = slotList.filter(a => a.bos === true)
                           
                           functions.randevuAl(token, alinabilir[0].slot.id, alinabilir[0].slot.fkCetvelId, alinabilir[0].slot.baslangicZamani, alinabilir[0].slot.bitisZamani).then(resp => {
                              console.log(`Randevu alındı\nHekim adı: ${resp.hekim.ad} ${resp.hekim.soyad}\nKurum adı: ${resp.kurum.kurumAdi} (${resp.kurum.ilAdi}-${resp.kurum.ilceAdi})\nRandevu tarihi: ${resp.randevuBaslangicZamaniStr.zaman} - ${resp.randevuBitisZamaniStr.saat}`)
                              process.exit()
                           }).catch(() => console.error("Randevu alınırken hata oluştu"))
                        }
                     }else{
                        denemesayisi++
                        console.log(`Hekim bulundu, fakat uygun randevu bulunamadı - ${denemesayisi}. deneme`)
                     }
                  }).catch(() => console.error("Hekim aranırken hata oluştu"))
            }).catch(err => {
               console.error(err)
               if (err.response.data.errors[0].kodu == "RND4010") {
                  denemesayisi++
                  console.log(`Randevu bulunamadı - ${denemesayisi}. deneme`)
               }
               else console.error("Randevu bulunurken hata oluştu")
            })
         } else {
            console.log("Zaten randevu alınmış, sistem durduruldu")
            process.exit()
         }
      }).catch(() => {
         console.error("Randevu geçmişi alınırken hata oluştu")
   })
}

const tckimlik = prompt("TC kimlik numarası: ")
const sifre = prompt("Şifre: ")

functions.girisYap(tckimlik, sifre).then(async loginresp => {
   console.log(`${loginresp.data.kullaniciAdi} ${loginresp.data.kullaniciSoyadi} adına giriş başarılı`)
   const token = String("Bearer " + loginresp.data.jwt)
   
   let il;
   const ilPrompt = functions.yaziSadele(prompt("Randevu istediğiniz ilin adı veya plakası: "))
   let iller = await functions.illeriAl(token)
   il = iller.find(a => isNaN(ilPrompt) ? functions.yaziSadele(a.text).includes(ilPrompt) : a.value == ilPrompt)
   if (!il) return console.log("Belirtilen il bulunamadı")
   console.log(`Seçilen il: ${il.value} plaka kodlu ${il.text}`)
   
   let ilce;
   const ilcePrompt = functions.yaziSadele(prompt("Randevu istediğiniz ilçenin adı (ilin merkez ilçesi için merkez, fark etmez için F yazın): "))
   if (ilcePrompt != "f") {
      let ilceler = await functions.ilinIlceleri(token, il.value)
      ilce = ilceler.find(a => functions.yaziSadele(a.text).includes(ilcePrompt))
      if (!ilce) return console.log("Belirtilen ilçe bulunamadı")
      console.log(`Seçilen ilçe: ${ilce.value} ID'li ${ilce.text}`)
   }else console.log(`Seçilen ilçe: Fark etmez`)
   
   let klinik;
   const klinikPrompt = functions.yaziSadele(prompt("Randevu istediğiniz kliniğin adı: "))
   let klinikler = await functions.klinikleriAl(token, il.value, ilce == "f" ? -1 : ilce.value)
   klinik = klinikler.find(a => functions.yaziSadele(a.text).includes(klinikPrompt))
   if (!klinik) return console.log("Belirtilen klinik bulunamadı")
   console.log(`Seçilen klinik: ${klinik.value} ID'li ${klinik.text}`)
   
   const cinsiyet = prompt("İstediğiniz cinsiyet (E/K/F): ").toUpperCase()
   if (cinsiyet != "E" && cinsiyet != "K" && cinsiyet != "F") return console.log("Geçersiz cinsiyet")
   console.log(`Seçilen cinsiyet: ${cinsiyet == "E" ? "Erkek" : cinsiyet == "K" ? "Kadın" : "Fark etmez"}`)
   
   const onumuzdekigun = prompt("Önümüzdeki kaç gün için randevu alınsın? (1-15): ")
   if (isNaN(Number(onumuzdekigun)) || onumuzdekigun < 1 || onumuzdekigun > 15) return console.log("Geçersiz gün sayısı")
   console.log(`Seçilen gün sayısı: Önümüzdeki ${onumuzdekigun} gün`)
   
   console.log("Başladı, her dakikada bir randevular kontrol edilecek")
   kontrolEt(token, il, ilce, cinsiyet, klinik, onumuzdekigun)
   setInterval(() => {
      kontrolEt(token, il, ilce, cinsiyet, klinik, onumuzdekigun)
   }, 60000)
}).catch((error) => console.error(error))

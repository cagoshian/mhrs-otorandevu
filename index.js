const moment = require("moment");
moment.locale("tr");
const prompt = require("prompt-sync")({ sigint: true });
const functions = require("./functions.js");

let denemeSayisi = 0;

async function kontrolEt(token, il, ilce, cinsiyet, klinik, onumuzdekiGun) {
	try {
		const randevular = await functions.kullaniciRandevulari(token);
		const mevcutRandevu = randevular.aktifRandevuDtoList.some(
			(a) => a.mhrsKlinikAdi === klinik.text && a.randevuKayitDurumu.val !== 4,
		);

		if (mevcutRandevu) {
			console.log("Zaten bu klinikte bir randevunuz var, sistem durduruldu.");
			process.exit();
			return;
		}

		const baslangicTarihi = moment().format("YYYY-MM-DD HH:mm:ss");
		const bitisTarihi = moment()
			.add(Number(onumuzdekiGun), "days")
			.format("YYYY-MM-DD HH:mm:ss");

		const randevuVerisi = await functions.randevuAra(
			token,
			il.value,
			ilce === "f" ? -1 : ilce.value,
			cinsiyet,
			klinik.value,
			String(baslangicTarihi),
			String(bitisTarihi),
		);

		if (!randevuVerisi.hastane || randevuVerisi.hastane.length === 0) {
			denemeSayisi++;
			console.log(`Randevu bulunamadı - ${denemeSayisi}. deneme`);
			return;
		}

		const enYakinHastane = randevuVerisi.hastane.sort(
			(a, b) =>
				new Date(a.baslangicZamani).getTime() -
				new Date(b.baslangicZamani).getTime(),
		)[0];

		const hekimVerisi = await functions.hekimAra(
			token,
			il.value,
			cinsiyet,
			klinik.value,
			enYakinHastane.kurum.mhrsKurumId,
			enYakinHastane.hekim.mhrsHekimId,
		);

		const kullanilabilirHekimler = hekimVerisi.filter(
			(hekim) => hekim.kalanKullanim > 0,
		);

		if (kullanilabilirHekimler.length > 0) {
			for (const hekim of kullanilabilirHekimler) {
				const saatler =
					hekim.hekimSlotList[0].muayeneYeriSlotList[0].saatSlotList.filter(
						(saat) => saat.bos === true,
					);

				const slotList = [];

				for (const saat of saatler) {
					for (const slot in saat.slotList) {
						slotList.push(slot);
					}
				}

				const alinabilirSlotlar = slotList.filter((a) => a.bos === true);

				if (alinabilirSlotlar.length > 0) {
					const alinacakSlot = alinabilirSlotlar[0].slot;
					const resp = await functions.randevuAl(
						token,
						alinacakSlot.id,
						alinacakSlot.fkCetvelId,
						alinacakSlot.baslangicZamani,
						alinacakSlot.bitisZamani,
					);

					console.log(
						`Randevu alındı!\nHekim adı: ${resp.hekim.ad} ${resp.hekim.soyad}\nKurum adı: ${resp.kurum.kurumAdi} (${resp.kurum.ilAdi}-${resp.kurum.ilceAdi})\nRandevu tarihi: ${resp.randevuBaslangicZamaniStr.zaman} - ${resp.randevuBitisZamaniStr.saat}`,
					);
					process.exit();
					return;
				}
			}
		}

		denemeSayisi++;
		console.log(
			`Hekim bulundu, fakat uygun randevu bulunamadı - ${denemeSayisi}. deneme`,
		);
	} catch (err) {
		if (err.response?.data?.errors?.[0]?.kodu === "RND4010") {
			denemeSayisi++;
			console.log(`Randevu bulunamadı - ${denemeSayisi}. deneme`);
		} else {
			console.error("Randevu kontrolü sırasında bir hata oluştu:", err.message);
		}
	}
}

async function main() {
	try {
		const tckimlik = prompt("TC kimlik numarası: ");
		const sifre = prompt("Şifre: ");

		const loginresp = await functions.girisYap(tckimlik, sifre);
		console.log(
			`${loginresp.data.kullaniciAdi} ${loginresp.data.kullaniciSoyadi} adına giriş başarılı`,
		);
		const token = `Bearer ${loginresp.data.jwt}`;

		const iller = await functions.illeriAl(token);
		const ilPrompt = functions.yaziSadele(
			prompt("Randevu istediğiniz ilin adı veya plakası: "),
		);
		const il = iller.find((a) =>
			Number.isNaN(Number(ilPrompt))
				? functions.yaziSadele(a.text).includes(ilPrompt)
				: a.value === Number(ilPrompt),
		);
		if (!il) {
			console.log("Belirtilen il bulunamadı");
			return;
		}
		console.log(`Seçilen il: ${il.value} plaka kodlu ${il.text}`);

		let ilce;
		const ilcePrompt = functions.yaziSadele(
			prompt(
				"Randevu istediğiniz ilçenin adı (ilin merkez ilçesi için merkez, fark etmez için F yazın): ",
			),
		);
		if (ilcePrompt !== "f") {
			const ilceler = await functions.ilinIlceleri(token, il.value);
			ilce = ilceler.find((a) =>
				functions.yaziSadele(a.text).includes(ilcePrompt),
			);
			if (!ilce) {
				console.log("Belirtilen ilçe bulunamadı");
				return;
			}
			console.log(`Seçilen ilçe: ${ilce.value} ID'li ${ilce.text}`);
		} else {
			ilce = "f";
			console.log("Seçilen ilçe: Fark etmez");
		}

		const klinikler = await functions.klinikleriAl(
			token,
			il.value,
			ilce === "f" ? -1 : ilce.value,
		);
		const klinikPrompt = functions.yaziSadele(
			prompt("Randevu istediğiniz kliniğin adı: "),
		);
		const klinik =
			klinikler.find((a) => functions.yaziSadele(a.text) === klinikPrompt) ||
			klinikler.find((a) =>
				functions.yaziSadele(a.text).includes(klinikPrompt),
			);
		if (!klinik) {
			console.log("Belirtilen klinik bulunamadı");
			return;
		}
		console.log(`Seçilen klinik: ${klinik.value} ID'li ${klinik.text}`);

		const cinsiyet = prompt("İstediğiniz cinsiyet (E/K/F): ").toUpperCase();
		if (cinsiyet !== "E" && cinsiyet !== "K" && cinsiyet !== "F") {
			console.log("Geçersiz cinsiyet");
			return;
		}
		console.log(
			`Seçilen cinsiyet: ${
				cinsiyet === "E" ? "Erkek" : cinsiyet === "K" ? "Kadın" : "Fark etmez"
			}`,
		);

		const onumuzdekiGun = prompt(
			"Önümüzdeki kaç gün için randevu alınsın? (1-15): ",
		);
		if (
			Number.isNaN(Number(onumuzdekiGun)) ||
			onumuzdekiGun < 1 ||
			onumuzdekiGun > 15
		) {
			console.log("Geçersiz gün sayısı");
			return;
		}
		console.log(`Seçilen gün sayısı: Önümüzdeki ${onumuzdekiGun} gün`);

		const kontrolSiklik = prompt(
			"Ne kadar sıklıkla randevu kontrol edilsin? (1-30 dakika): ",
		);
		if (
			Number.isNaN(Number(kontrolSiklik)) ||
			kontrolSiklik < 1 ||
			kontrolSiklik > 30
		) {
			console.log("Geçersiz sıklık değeri");
			return;
		}
		console.log(
			`Başladı, her ${kontrolSiklik} dakikada bir randevular kontrol edilecek`,
		);

		const kontrolDongusu = () => {
			kontrolEt(token, il, ilce, cinsiyet, klinik, onumuzdekiGun);
			setTimeout(kontrolDongusu, Number(kontrolSiklik) * 60000);
		};
		kontrolDongusu();
	} catch (error) {
		console.error("Uygulama başlatılırken bir hata oluştu:", error.message);
	}
}

main();

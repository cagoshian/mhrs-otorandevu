const axios = require("axios");

module.exports = {
	girisYap: (tckimlik, sifre) => {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                "kullaniciAdi": tckimlik,
                "parola": sifre,
                "islemKanali": "VATANDAS_WEB",
                "girisTipi": "PAROLA"
            });
            
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            axios.post("https://prd.mhrs.gov.tr/api/vatandas/login", data, config).then(resp => {
                resolve(JSON.stringify(resp.data.data.jwt));
            }).catch(error => reject(error));
        });
    },
    
    kullaniciRandevulari: (token) => {
        return new Promise((resolve, reject) => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.get("https://prd.mhrs.gov.tr/api/kurum/randevu/randevu-gecmisi", config).then(resp => {
                resolve(resp.data.data);
            }).catch(error => reject(error));
        });
    },
    
    randevuAra: (token, plaka, cinsiyet, klinikid, baslangic, bitis) => {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                "aksiyonId": "200",
                "cinsiyet": cinsiyet,
                "mhrsHekimId": -1,
                "mhrsIlId": plaka,
                "mhrsIlceId": -1,
                "mhrsKlinikId": klinikid,
                "mhrsKurumId": -1,
                "muayeneYeriId": -1,
                "tumRandevular": false,
                "ekRandevu": true,
                "randevuZamaniList": [],
                "baslangicZamani": baslangic,
                "bitisZamani": bitis
            });
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.post("https://prd.mhrs.gov.tr/api/kurum-rss/randevu/slot-sorgulama/arama", data, config).then(resp => {
                resolve({
                    hekimId: resp.data.data.hastane[0].hekim.mhrsHekimId,
                    kurumId: resp.data.data.hastane[0].kurum.mhrsKurumId,
                });
            }).catch(error => reject(error));
        })
    },
    
    hekimAra: (token, plaka, cinsiyet, klinikid, kurumid, hekimid) => {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                "aksiyonId": 200,
                "mhrsHekimId": hekimid,
                "mhrsIlId": plaka,
                "mhrsKlinikId": klinikid,
                "mhrsKurumId": kurumid,
                "muayeneYeriId": -1,
                "cinsiyet": cinsiyet,
                "tumRandevular": false,
                "ekRandevu": true,
                "randevuZamaniList": []
            });
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.post("https://prd.mhrs.gov.tr/api/kurum-rss/randevu/slot-sorgulama/slot", data, config).then(resp => {
                resolve(resp.data.data);
            }).catch(error => reject(error));
        })
    },
    
    randevuAl: (token, fkslotid, fkcetvelid, baslangiczamani, bitiszamani) => {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                "fkSlotId": fkslotid,
                "fkCetvelId": fkcetvelid,
                "yenidogan": false,
                "baslangicZamani": baslangiczamani,
                "bitisZamani": bitiszamani,
                "randevuNotu": ""
            })
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.post("https://prd.mhrs.gov.tr/api/kurum/randevu/randevu-ekle", data, config).then(resp => {
                resolve(resp.data.data);
            }).catch(error => reject(error))
        })
    }
}

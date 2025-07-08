const axios = require("axios");

const turkceKarakterler = "ğüşöçıİĞÜŞÖÇ";
const ingilizceKarakterler = "gusociIGUSOC";
const karakterMap = new Map();
for (let i = 0; i < turkceKarakterler.length; i++) {
    karakterMap.set(turkceKarakterler[i], ingilizceKarakterler[i]);
}

module.exports = {
    yaziSadele: (cumle) => {
      let yeniStr = "";
      for (let i = 0; i < cumle.length; i++) {
        const karakter = cumle[i];
        yeniStr += karakterMap.has(karakter) ? karakterMap.get(karakter) : karakter;
      }
      
      return yeniStr.toLowerCase().replaceAll(" ", "");
    },
    
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
                resolve(resp.data);
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
    
    illeriAl: async (token) => {
        return new Promise((resolve, reject) => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.get("https://prd.mhrs.gov.tr/api/yonetim/genel/il/selectinput-tree", config).then(resp => {
                resolve(resp.data);
            }).catch(error => reject(error));
        });
    },
    
    ilinIlceleri: async (token, ilPlaka) => {
        return new Promise((resolve, reject) => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.get(`https://prd.mhrs.gov.tr/api/yonetim/genel/ilce/selectinput/${ilPlaka}`, config).then(resp => {
                resolve(resp.data);
            }).catch(error => reject(error));
        });
    },
    
    klinikleriAl: async (token, ilPlaka, ilceId) => {
        return new Promise((resolve, reject) => {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };
            
            axios.get(`https://prd.mhrs.gov.tr/api/kurum/kurum/kurum-klinik/il/${ilPlaka}/ilce/${ilceId}/kurum/-1/aksiyon/200/select-input`, config).then(resp => {
                resolve(resp.data.data);
            }).catch(error => reject(error));
        });
    },
    
    randevuAra: (token, plaka, ilceId, cinsiyet, klinikid, baslangic, bitis) => {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                "aksiyonId": "200",
                "cinsiyet": cinsiyet,
                "mhrsHekimId": -1,
                "mhrsIlId": plaka,
                "mhrsIlceId": ilceId,
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
                resolve(resp.data.data);
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

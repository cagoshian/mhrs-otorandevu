# mhrs-otorandevu
MHRS'de randevuları otomatik kontrol eden ve randevu bulunduğunda alan sistem.

## Kullanım

Proje kodlarını indirip masaüstünde bir klasöre çıkartın.

Ardından, `node .` komuduyla yazılımı çalıştırın.

Programı çalıştırdığınızda önce sizden TC kimlik numaranızı ve şifrenizi isteyecektir. Bu bilgileri girip MHRS'ye girişi sağladıktan sonra, randevuyu istediğiniz ili, ilçeyi, kliniği, cinsiyet tercihini ve önümüzdeki kaç gün için randevu aranması gerektiğini soracaktır. Bu bilgileri girdikten sonra yazılım, her 2 dakikada bir kriterlere uygun randevu olup olmadığını kontrol edecektir. Uygun bir randevu bulduğunda, randevuyu otomatik olarak alacaktır.

Alternatif olarak, [bu linkten](https://github.com/cgnkota/mhrs-otorandevu/releases/tag/v1.0) işletim sisteminize uygun dosyayı indirip çalıştırabilirsiniz. 

# mhrs-otorandevu
MHRS'de randevuları otomatik kontrol eden ve randevu bulunduğunda alan sistem.

## Kullanım

[Bu linkten](https://github.com/cgnkota/mhrs-otorandevu/releases/latest) işletim sisteminize uygun dosyayı indirip, ardından çalıştırın. Alternatif olarak, proje kodlarını indirip NodeJS ile de çalıştırabilirsiniz.

Programı çalıştırdığınızda önce sizden TC kimlik numaranızı ve şifrenizi isteyecektir. Bu bilgileri girip MHRS'ye girişi sağladıktan sonra, randevuyu istediğiniz ili, ilçeyi, kliniği, cinsiyet tercihini ve önümüzdeki kaç gün için randevu aranması gerektiğini soracaktır. Bu bilgileri girdikten sonra yazılım, her 2 dakikada bir kriterlere uygun randevu olup olmadığını kontrol edecektir. Uygun bir randevu bulduğunda, randevuyu otomatik olarak alacaktır.

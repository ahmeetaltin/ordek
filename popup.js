// Aktif sekmenin URL'sini almak için bir fonksiyon
function getCurrentTabURL(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}
// Token ve channelID'ler için bir fonksiyon
document.addEventListener("DOMContentLoaded", function () {
  function getCredentials(callback) {
    fetch(chrome.runtime.getURL("veriler.txt"))
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const credentials = {
          channelID: lines[0].split('=')[1].trim(),
          token: lines[1].split('=')[1].trim(),
        };
        callback(credentials);
      })
      .catch(error => console.error('Credentials alınamadı:', error));
  }
// Click gelince yapılacaklar için bir fonksiyon
  function handleClick(command, credentials) {
    getCurrentTabURL(function (url) {

      //Link eğer bi youtube linki iste regex ile düzenlemeler yapıp playlist'i atar sadece o müzik linkini bırakır.
      if (command.endsWith("play"))
        var modifiedURL = command + " " + url.match(/(https:\/\/)(www|music)\.(youtube.com\/)[a-zA-Z0-9\/\?=_-]+/)[0];
      else
        var modifiedURL = command

      if (modifiedURL) {
        console.log("Metinde eşleşme bulundu! Eşleşme: " + modifiedURL);

        // Discord API ayarları
        var channelID = credentials.channelID;
        var token = credentials.token;
        var message = modifiedURL;
        var url = 'https://discord.com/api/v9/channels/' + channelID + '/messages';
        var data = { "content": message };
        var headers = { "authorization": token };

        // POST isteği gönderme
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (response.ok) {
              console.log('POST isteği başarıyla gönderildi.');
            } else {
              console.error('POST isteği sırasında bir hata oluştu.');
            }
          })
          .catch(error => {
            console.error('POST isteği sırasında bir hata oluştu:', error);
          });

      } else {
        console.log("Metinde eşleşme bulunamadı.");
        return;
      }

      chrome.runtime.sendMessage({
        message: "sendWebhookRequest",
        text: modifiedURL
      });
    });
  }

  //Eğer farklı bir müzik botu kullanılacaksa buradaki m!play bilgileri değiştirilmeli
  getCredentials(function (credentials) {
    // "m!play" butonu
    document.getElementById("playButton").addEventListener("click", function () {
      handleClick("m!play", credentials);
    });

    // "m!next" butonu
    document.getElementById("nextButton").addEventListener("click", function () {
      handleClick("m!next", credentials);
    });

    // "m!stop" butonu
    document.getElementById("stopButton").addEventListener("click", function () {
      handleClick("m!stop", credentials);
    });
  });
});

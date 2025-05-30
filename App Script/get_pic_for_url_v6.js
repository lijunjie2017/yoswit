window.get_pic_for_url = async (url='/private/files/1747726046673.jpg') => {
  try{
    let response = await http2.request(encodeURI(url), {
      method: 'GET',
      debug: true,
    headers: {
      'Content-Type': 'image/jpeg',
    },
    responseType: 'arraybuffer',
  });
  console.log(response);
  if (response.status == 200) {
    // 将 ArrayBuffer 转换为 Base64
    const arrayBuffer = response.data;
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    let blobUrl = `data:${mimeType};base64,${base64}`;
    console.log('blobUrl', blobUrl);
    app.sheet.create({
      content: `
      <div class="sheet-modal" style="height:auto">
        <div class="sheet-modal-inner">
          <div class="swipe-handler"></div>
          <div class="page-content" style="height:600px;">
            <img src="${blobUrl}" alt="Image" style="width: 100%; height: auto;">
          </div>
        </div>
      </div>`,
      on: {
        closed: function () {
          app.sheet.close();
        }
      },
      swipeToClose: true,
      push: true,
      backdrop: true,
    }).open();
    return blobUrl;
  }else{
      console.error('Failed to fetch image:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

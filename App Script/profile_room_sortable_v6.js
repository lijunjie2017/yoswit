window.profile_room_sortable = async (param) => {
  console.log(param);
  const status = param.ref.split('|')[0];
  const profileId = param.ref.split('|')[1];
  const element = param.obj;
  if (status === '0') {
    $(element).find('i').text('done'); // enable sort
    $(element).attr('ref', '1|' + profileId);
  } else {
    app.dialog.preloader();
    $(element).find('i').text('filter_list');
    const ul = $('ul[class="dynamic-list-generated-from-jinja"]')[0];
    const lis = $(ul)[0].children;
    let roomIndex = 1;
    let rooms = [];
    const res = await http.request('/api/resource/Profile/' + profileId, {
      method: 'GET',
      responseType: 'json',
    });
    let profileData = res.data.data;
    for (let liIndex = 0; liIndex < lis.length; liIndex++) {
      const li = lis[liIndex];
      if (li.classList.contains('room-list-item')) {
        const roomName = $(li).attr('room-name');
        profileData['profile_room'].forEach((room) => {
          if (room.name == roomName) {
            room.idx = roomIndex;
            rooms.push(room);
            roomIndex++;
          }
        });
      }
    }
    console.log(rooms);
    profileData['profile_room'] = rooms;
    // region prepare submit edited data
    var formData = new FormData();
    formData.append('doc', JSON.stringify(profileData));
    formData.append('action', 'Save');
    console.log(JSON.stringify(profileData));
    http
      .request('/api/method/frappe.desk.form.save.savedocs', {
        method: 'POST',
        responseType: 'json',
        serializer: 'multipart',
        data: formData,
      })
      .then(async(r) => {
        console.log(r);
        await ha_profile_ready();
        app.dialog.close();
        debugger
        emitter.emit('refresh',{page : 'save_subdevice'});
        mainView.router.refreshPage();
      })
      .catch((error) => {
        app.dialog.close();
        console.log("error",error)
        app.dialog.alert(_('Encountered a problem while saving, please check'));
      });
    // endregion
    // finish sort
    $(element).attr('ref', '0|' + profileId);
  }
};

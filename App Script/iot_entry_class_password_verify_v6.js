erp.script.iot_entry_class_password_verify = (guid, profile_subdevice_id) => {
  let TAG = 'iot_entry_class_password_verify';
  console.log(TAG);
  return new Promise((resolve, reject) => {
    //connect default paw 000000;
    peripheral[guid].disconnect().then(() => {
      peripheral[guid].prop.password = '000000';
      peripheral[guid]
        .doConnect()
        .then(() => {
          resolve(1);
        })
        .catch((err) => {
          console.log(err);
          if (err == 7200) {
            app.dialog.password('Please enter correct password', function (password) {
              if (password.trim() == '' || password.length != 6) {
                app.dialog.alert('Invalid Password!');
                //iot_entry_class_password_verify(guid);
              } else {
                peripheral[guid].prop.password = password;
                //if password is correct, then update the profile
                let profile_device = '';
                if (profile_subdevice_id) {
                  let list = cloneDeep(erp.info.profile.profile_subdevice);
                  list.forEach((item) => {
                    if (item.name == profile_subdevice_id) {
                      profile_device = item.profile_device;
                    }
                  });
                }
                peripheral[guid]
                  .doConnect()
                  .then(() => {
                    if (profile_device) {
                      //update the profile device
                      let devices = erp.info.profile.profile_device;
                      devices.forEach((item) => {
                        if (item.name == profile_device) {
                          item.password = password;
                        }
                      });
                      let url = '/api/resource/Profile%20Device/' + encodeURI(profile_device);
                      http.request(url, {
                        method: 'PUT',
                        serializer: 'json',
                        data: {
                          data: {
                            name: profile_device,
                            password: password,
                          },
                        },
                      });
                    }
                    resolve(1);
                  })
                  .catch((error) => {
                    app.dialog.alert(_(erp.get_log_description(error)));
                    reject(error);
                  });
              }
            });
          } else {
            app.dialog.alert(_(erp.get_log_description(err)));
          }
        });
    });
  });
};

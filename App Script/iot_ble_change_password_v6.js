window.iot_ble_change_password = (params) => {
  const guid = params.ref;
  const device_name = params.obj.attr('device-name');

  app.dialog.login(_('Please enter a password with length = 6'), function (username, password) {
    if (username.length == 6) {
      if (username == password) {
        let oripassword = peripheral[guid].prop.password;
        if (oripassword != password) {
          iot_ble_perform_password(guid, password, device_name);
        } else {
          app.dialog.alert(_('Update Successfully.'));
        }
      } else {
        app.dialog.alert(_('Password is not same.'));
      }
    } else {
      app.dialog.alert(_('Invalid Password Format.'));
    }
  });
  setTimeout(() => {
    $(`.dialog-input-field input[name="dialog-username"]`).attr('type', 'password');
    $(`.dialog-input-field input[name="dialog-username"]`).attr('placeholder', 'New Password');
    $(`.dialog-input-field input[name="dialog-password"]`).attr('placeholder', 'Confirm Password');
  }, 0);
};

window.iot_ble_perform_password = async (guid, password, device_name) => {
    debugger
  let errorflag = false;
  //new logic
  $('.bluetooth-icons').attr('ref', 2);
  try {
    await peripheral[guid].connect();
    $('.bluetooth-icons').attr('ref', 1);
    await ble.startNotification(peripheral[guid].prop.id, 'ff80', 'ff82', function (rs) {
      if (rs.startsWith('82')) {
        if (rs.endsWith('00') || rs.endsWith('02') || rs.endsWith('03')) {
          //ending the startNotification
          ble.stopNotification(peripheral[guid].prop.id, 'ff80', 'ff82');
          //change the prop
          peripheral[guid].prop.password = password;
          let data = {
            name: device_name,
            password: password,
          };
          var url = '/api/resource/Profile%20Device/' + encodeURI(device_name);
          var method = 'PUT';
          http2
            .request(url, {
              method: method,
              serializer: 'json',
              data: { data: data },
            })
            .then(() => {
              let url = `/api/resource/Device/${guid}`;
              let data = {
                password: password,
              };
              return http2.request(url, {
                method: method,
                responseType: 'json',
                serializer: 'json',
                data: data,
              });
            })
            .then(() => {
              app.dialog.alert(_('Update Successfully.'));
              ha_profile_ready();
            })
            .catch(() => {
              app.dialog.alert(_('Update Failed.'));
            });
        } else {
          app.dialog.alert(_('Update failed.'));
        }
      }
    });
    //end startNotification
    //return iot_ble_write(guid, 'ff80', 'ff81', '82' + (oripassword.substring(0, 6) + password.substring(0, 6)).convertToHex());
    let oripassword = peripheral[guid].prop.password;
    let data = `82${(oripassword.substring(0, 6) + password.substring(0, 6)).convertToHex()}`;
    await peripheral[guid].write([
      {
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
      },
    ]);
  } catch (error) {
    $('.bluetooth-icons').attr('ref', 0);
    ble.stopNotification(peripheral[guid].prop.id, 'ff80', 'ff82');
    if (error == 7200) {
      app.dialog.password(_('Please enter the password'), function (password) {
        peripheral[guid].prop.password = password;
        iot_ble_perform_password(guid, password, device_name);
      });
    } else {
      app.dialog.alert(_(erp.get_log_description(error)));
    }
  }
};

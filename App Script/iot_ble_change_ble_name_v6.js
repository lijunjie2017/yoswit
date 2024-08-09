window.iot_ble_change_ble_name = (params) => {
  const guid = params.ref;
  const device_name = params.obj.attr('device-name');
  //let p = Object.values(scanned_periperals).find((item) => item.guid == guid);
  app.dialog.prompt(_('New Device Name'), function (new_device_name) {
    //verify the name
    if (new_device_name) {
      let filename = new_device_name;
      let nameHex = convertToFileHex(filename, 63);
      let data = `98060000${(nameHex.length / 2).toString(16)}${nameHex}`;
      console.log('data', data);
      //let cmd = [{ 'action': 'connect' }, { 'action': 'write', 'data': data }];
      if (Capacitor.getPlatform() === 'android') {
        ble.requestMtu(
          window.peripheral[guid].prop.id,
          512,
          () => {
            console.log('request mtu success');
            window.peripheral[guid].write([{
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: data,
              }]).then(() => {
                app.dialog.alert(_('Update Successfully.'));
              })
              .catch((error) => {
                app.dialog.alert(error);
              });
          },
          () => {
            console.log('request mtu failed');
          }
        );
      } else {
        window.peripheral[guid].write([{
            service: 'ff80',
            characteristic: 'ff81',
            data: data,
        },{
          service: 'ff80',
          characteristic: 'ff81',
          data: `810e`,
        }]).then(() => {
            app.dialog.alert(_('Update Successfully.'));
          })
          .catch((error) => {
            app.dialog.alert(erp.get_log_description(error));
          });
      }
    } else {
      app.dialog.alert(_('Invalid Input Format.'));
    }
    setTimeout(() => {
      //$(`.dialog-input-field input[name="dialog-username"]`).attr('type','password');
      $(`.dialog-input-field input[name="dialog-username"]`).attr('placeholder', 'Expiry Time(Minutes)');
      $(`.dialog-input-field input[name="dialog-password"]`).attr('placeholder', 'Password');
    }, 0);
  });
};

window.convertToFileHex = (inputString, sizeInBytes) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(inputString);
    
    const byteSize = sizeInBytes * 2; // 每个字节对应两个十六进制字符
    const hexString = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    const paddedHexString = hexString.padEnd(byteSize, '0'); // 在结果前面填充零，使其达到指定的字节大小
    return paddedHexString.toLowerCase(); // 转换为小写形式并返回
};
iot_device_update_firmware_by_class = async (params) => {
  const guid = params.ref;
  //get the firmware version by ble
  app.dialog.preloader(_('Getting firmware version...'));
  try {
    await window.peripheral[guid].connect();
    const readFirmware = () => {
      let service = '180a',
        characteristic = '2a26';
      if (window.peripheral[guid].prop.characteristics) {
        for (let c of window.peripheral[guid].prop.characteristics) {
          if (c.characteristic.toLowerCase() == '2a26' || c.characteristic.toLowerCase() == '2a28') {
            service = c.service;
            characteristic = c.characteristic;
          }
        }
      }
      ble.read(
        window.peripheral[guid].prop.id,
        service,
        characteristic,
        async function (data) {
          let firmware = data.convertToAscii().toLowerCase();
          window.peripheral[guid].prop.firmware = firmware;
          window.peripheral[guid].prop.firmwareNo = window.peripheral[guid].getFirmwareNo(firmware);
          $(`.read-firmware-box-text`).text(window.peripheral[guid].prop.firmware);
          //update the firmware version
          try {
            let url = `/api/resource/Device/${guid}`;
            await http2.request(url, {
              method: 'PUT',
              serializer: 'json',
              responseType: 'json',
              data: {
                firmware: firmware,
              },
            });
            erp.info.device[guid].firmware = firmware;
            app.dialog.close();
          } catch (error) {
            app.dialog.close();
            app.dialog.alert(_(erp.get_log_description(error)));
          }
        },
        function (failure) {
          app.dialog.close();
          app.dialog.alert(_(erp.get_log_description(failure)));
        }
      );
    };
    readFirmware();
  } catch (error) {
    app.dialog.close();
    app.dialog.alert(_(erp.get_log_description(error)));
  }
};

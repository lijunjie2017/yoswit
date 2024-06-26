/**
 * @param {import('types/listener').CommonListenerParams} params
 * @returns
 */
erp.script.iot_reset_password_peripheral = async function (params) {
  const guid = params.obj.attr("ref");
  console.log("guid",guid)
  const mac = core_utils_get_mac_address_from_guid(guid, true);
  const byte = mac.match(/.{1,2}/g);

  const cmd = '880083' + byte[3] + byte[0] + '543e15';
  const promisifyWrite = (device_id, service_uuid, characteristic_uuid, data) => {
    return new Promise((resolve, reject) => {
      ble.write(
        device_id,
        service_uuid,
        characteristic_uuid,
        data.convertToBytes(),
        () => {
          resolve();
        },
        (error) => {
          if (data === '810e') {
            resolve();
          } else {
            reject(error);
          }
        }
      );
    });
  };

  const promisifyConnect = (device_id) => {
    return new Promise((resolve, reject) => {
      ble.connect(
        device_id,
        () => {
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const promisifyDisconnect = (device_id) => {
    return new Promise((resolve, reject) => {
      ble.disconnect(
        device_id,
        () => {
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const sleep = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  };

  try {
    app.preloader.show();
    const periperal = window.peripheral[guid].prop;

    await promisifyConnect(periperal.id);
    await promisifyWrite(periperal.id, 'ff80', 'ff81', cmd);
    // ble.startNotification(periperal.id, 'ff80', 'ff82');
    await promisifyDisconnect(periperal.id);

    await sleep(2000);

    await promisifyConnect(periperal.id);

    await promisifyWrite(periperal.id, 'ff80', 'ff81', '812700');
    // await promisifyWrite(periperal.id, 'ff80', 'ff81', '810e');

    // 88ff00aa77
    // 8e01

    app.preloader.hide();
    app.dialog.alert('Reset Success!');
  } catch (err) {
    app.preloader.hide();
    app.dialog.alert('Reset fail: ' + JSON.stringify(err));
  }
};

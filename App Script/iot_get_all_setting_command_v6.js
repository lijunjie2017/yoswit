window.iot_get_all_setting_command = async () => {
  try {
    let guid = '3730623935303835343862611201541d';
    await window.peripheral[guid].connect();
    //start notify
    ble.startNotification(
      peripheral[guid].prop.id,
      'ff80',
      'ff82',
      (rs) => {
        console.log('start notify');
        console.log("rs",rs);
      },
      (notifyError) => {
        console.log('notifyError', notifyError);
      }
    );
    let data = '81ff';
    await window.peripheral[guid].write([
      {
        service: 'ff80',
        characteristic: 'ff81',
        data: data,
      },
    ]);
  } catch (error) {
    console.log(error);
  }
};

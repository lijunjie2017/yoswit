window.iot_old_device_test = () => {
  let uuid = '98:07:2D:A3:8F:6A';
  console.log(uuid);
  ble.connect(
    uuid,
    (rs) => {
      console.log('connected');
      ble.startNotification(
        uuid,
        'ffc0',
        'ffc2',
        function (rs) {
          console.log(rs);
        },
        (error) => {
          console.log(error);
        }
      );
      let data = (('000000'+'000000').convertToHex()).convertToBytes();
      ble.write(
        uuid,
        'ffc0',
        'ffc1',
        data,
        function (rs) {
          console.log('rs', rs);
          //nothing to do, instead, need notify
        },
        function (errors) {
          console.log(errors)
        }
      );
    },
    (error) => {
      console.log(error);
    }
  );
};
//iot_old_device_test()
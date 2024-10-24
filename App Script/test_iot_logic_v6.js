window.test_iot_logic = async () => {
  //test the iot logic
  let uuid = '20:91:48:5A:FC:B8';
  ble.connect(
    uuid,
    async(rs) => {
        debugger;
      console.log('rs', rs);
      await ble.startNotification(
        uuid,
        'ffc0',
        'ffc2',
        function (rs) {
          //ble.stopNotification(self.prop.id, "ffc0", "ffc2");
          console.log('startNotification', rs);
          if (rs.startsWith('00')) {
            //resolve("Password is correct");
          } else if (rs.startsWith('01')) {
            //reject(7200); //Password is not correct
          } else if (rs.startsWith('02')) {
            //reject("Password is correct");
          }
        },
        function (error) {
          console.log('error', error);
          // ble.stopNotification(uuid, "ffc0", "ffc2");
          // reject("Failed to check password for firmware v3.x to v5.x");
        }
      );

      let data = ('000000' + '000000').convertToHex().convertToBytes();
      setTimeout(()=>{
        ble.write(
            uuid,
            'ffc0',
            'ffc1',
            `303030303030303030303030`.convertToBytes(),
            function (rs) {
              //nothing to do, instead, need notify
            },
            function (rs) {
              console.log('Failed to submit password for firmware v3.x to v5.x');
              //reject("Failed to submit password for firmware v3.x to v5.x (Error: "+rs+")");
            }
          );
      },500)
    },
    (error) => {
      console.log('error', error);
    }
  );
};

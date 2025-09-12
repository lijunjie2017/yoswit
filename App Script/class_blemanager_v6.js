window.BleManager = (function () {
  function BleManager(ble) {
    this.manager = ble;
    this.timer = [];
  }

  BleManager.prototype.stopScan = function () {
    const self = this;
    return new Promise((resolve) => {
      self.manager.stopScan(resolve, resolve);
    });
  };

  BleManager.prototype.scan = function (success, failure, services = ['fff0', 'ff70', 'ffb0', 'ff80', '1827', '1828']) {
    const self = this;

    self.manager.startScanWithOptions(
      services,
      {
        reportDuplicates: true,
        scanMode: 'lowLatency',
      },
      success,
      failure
    );
    self.timer.push(
      setTimeout(async () => {
        for (let guid in peripheral) {
          const p = peripheral[guid].getProp();
          if (isset(p.lastDiscoverDate) && !p.disappear) {
            let currentDate = new Date();
            let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;

            //console.log('disappear: '+timeDifference);
            if (timeDifference >= 18) {
              peripheral[guid].update({ rssi: 1000 });
            }
          }
        }

        await self.stopScan();
        await self.wait(200);
        self.scan(success, failure, services);
      }, 20000)
    );
    // self.manager.isEnabled(()=>{
    //     if (deviceInfo.operatingSystem === 'ios') {
    //     	self.manager.startScanWithOptions(
    // 			services,
    // 			{
    // 				reportDuplicates: true,
    // 				scanMode: 'lowLatency',
    // 			},
    // 			success,
    // 			failure
    // 		)

    // 		self.timer.push(setTimeout(async ()=>{
    // 		    for(let guid in peripheral){
    // 		        const p = peripheral[guid].getProp();
    // 		        if(isset(p.lastDiscoverDate) && !p.disappear){
    // 		            let currentDate = new Date();
    //                     let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;

    //                     //console.log('disappear: '+timeDifference);
    //                     if (timeDifference >= 18) {
    //                     	peripheral[guid].update({rssi:1000});
    //                     }
    // 		        }
    // 		    }

    // 		    await self.stopScan();
    // 		    await self.wait(200);
    // 		    self.scan(success, failure, services);
    // 		}, 20000));
    //     }else{
    //         self.manager.isLocationEnabled(()=>{
    //         	self.manager.startScanWithOptions(
    //     			services,
    //     			{
    //     				reportDuplicates: true,
    //     				scanMode: 'lowLatency',
    //     			},
    //     			success,
    //     			failure
    //     		)

    //     		self.timer.push(setTimeout(async ()=>{
    //     		    for(let guid in peripheral){
    //     		        const p = peripheral[guid].getProp();
    //     		        if(isset(p.lastDiscoverDate) && !p.disappear){
    //     		            let currentDate = new Date();
    //                         let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;

    //                         //console.log('disappear: '+timeDifference);
    //                         if (timeDifference >= 18) {
    //                         	peripheral[guid].update({rssi:1000});
    //                         }
    //     		        }
    //     		    }

    //     		    await self.stopScan();
    //     		    await self.wait(200);
    //     		    self.scan(success, failure, services);
    //     		}, 20000));
    //         }, ()=>{
    //             //alert("FFFFF2");
    //             failure(bleError.BLE_MOBILE_LOCATION_SERVICE_NOT_ENABLED);
    //         });
    //     }
    // }, ()=>{
    //     if (deviceInfo.operatingSystem === 'ios'){
    //         failure(bleError.BLE_MOBILE_BLUETOOTH_NOT_ENABLED);
    //     }else{
    //         ble.enable(()=>{},()=>{});
    //     }
    // });
  };

  BleManager.prototype.wait = function (ms) {
    const self = this;

    return new Promise((resolve) => {
      self.timer.push(setTimeout(resolve, ms));
    });
  };

  BleManager.prototype.clear = function (ms) {
    const self = this;

    for (let i in self.timer) {
      clearTimeout(self.timer[i]);
    }
  };

  return BleManager;
})();

if (isset(window.bleManager)) {
  bleManager.clear();
  bleManager = null;
}
window.bleManager = new BleManager(ble);

window.bleHelper = {
  getGangId: function (button_group) {
    // 0 and 5-7 are not used

    if (button_group.startsWith('ONOFF GANG')) {
      //1 to 4, 0 is not used
      return button_group.replaceAll('ONOFF GANG', '') * 1;
    } else if (button_group.startsWith('DIMMING')) {
      // 8 to 11, 5-7 are not used
      if (button_group == 'DIMMING') return 8;
      else return button_group.replaceAll('DIMMING', '') * 1 + 7;
    } else if (button_group.startsWith('GV DIMMING')) {
      return button_group.replaceAll('GV DIMMING', '') * 1 + 7;
    } else if (button_group.startsWith('RCU ONOFF GANG')) {
      // rcu onoff 1-20, id are from 12 - 31
      return button_group.replaceAll('RCU ONOFF GANG', '') * 1 + 11;
    } else if (button_group.startsWith('RCU DIMMING')) {
      // rcu dimming 1-10, id are from 32 - 41
      return button_group.replaceAll('RCU DIMMING', '') * 1 + 31;
    } else if (button_group.startsWith('OPENCLOSE GANG')) {
      // OPENCLOSE, no status, but for control, gang 1= 1_2, gang 2= 2_2, gang 3= 3_4, gang 4= 4_3
      // let gang = button_group.replaceAll('OPENCLOSE GANG', '');
      // let nature_gang = 12
      // if(gang = '1_2'){
      //     nature_gang = 12;
      // }else if(gang = '2_1'){
      //     nature_gang = 13;
      // }else if(gang = '3_4'){
      //     nature_gang = 14;
      // }else if(gang = '4_3'){
      //     nature_gang = 15;
      // }
      // return nature_gang;
      return button_group.replaceAll('OPENCLOSE GANG', '');
    } else if (button_group.startsWith('RCU OPENCLOSE GANG')) {
      // OPENCLOSE, no status, but for control, gang 1= 1_2, gang 2= 2_2, gang 3= 3_4, gang 4= 4_3
      return button_group.replaceAll('RCU OPENCLOSE GANG', '');
    } else if (button_group.startsWith('Thermostat')) {
      return 42;
    } else if (button_group.startsWith('RCU OUTPUT')) {
      return button_group.replaceAll('RCU OUTPUT', '') * 1 + 49;
    } else if (button_group.startsWith('RCU INPUT')) {
      return button_group.replaceAll('RCU INPUT', '') * 1 + 49;
    } else if (
      button_group.startsWith('OPENCLOSE UART') ||
      button_group.startsWith('OPENCLOSE WIFI UART') ||
      button_group.startsWith('OPENCLOSE WIFI UART REVERSE') ||
      button_group.startsWith('OPENCLOSE UART REVERSE')
    ) {
      return 48;
    } else if (button_group.startsWith('4in1 Sensor')) {
      return 49;
    } else if (button_group.startsWith('Door Open')) {
      return 86;
    } else {
      return 1;
    }
  },
  openBluetooth: function () {
    while (true) {
      try {
        const dialog = app.dialog.close();
        if (!dialog) {
          break;
        }
      } catch (e) {
        break;
      }
    }
    ble.isEnabled(
      function () {
        //app.dialog.alert(_('device is not here.'));
        return new Promise((resolve, reject) => {
          reject(6300);
        });
      },
      function () {
        if (deviceInfo.operatingSystem === 'ios') {
          app.dialog.confirm(
            _('Please open bluetooth in settings or toolbar, and then refresh.'),
            () => {
              PermissionRequestSheet.openSettings();
            },
            () => {}
          );
        } else {
          ble.enable(
            () => {},
            () => {}
          );
          setTimeout(() => {
            mainView.router.refreshPage();
          }, 2000);
        }
      }
    );
  },
  getControlSource: function (device) {
    return new Promise((resolve) => {
      peripheral[device].findRoute().then((route) => {
        let control_source = route;
        if (control_source == 'bluetooth') {
          control_source = 'Bluetooth';
        } else if (control_source == 'mobmob') {
          control_source = 'MobMob';
        } else {
          control_source = 'Bluetooth';
        }
        resolve(control_source);
      });
    });
  },
  sendLongCommand: function (command, device) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!isset(SparkMD5)) {
          await core_load_script('https://dev.mob-mob.com/files/spark-md5.min.js');
        }
      } catch (error) {
        await core_load_script('https://dev.mob-mob.com/files/spark-md5.min.js');
      }
      const commandReady = () => {
        const binaryBuffer = hexToBuffer(command);
        const md5str = SparkMD5.ArrayBuffer.hash(binaryBuffer);
        let sizeHex = iot_utils_to_little_endian_hex(command.length / 2, 4);
        let nameHex = convertToFixedSizeHex(`ir_command`, 31);
        let readyData = `933300003403${sizeHex}${md5str}${nameHex}`;
        return ble.writeWithoutResponse(
          window.peripheral[device].prop.id,
          'ff80',
          'ff85',
          readyData.convertToBytes(),
          () => {},
          (error) => {}
        );
      };
      const commandAction = async () => {
        return new Promise(async (actionResolve, actionReject) => {
          let mainChunkSizeInBytes = 4096;
          let negotiatedMTU = 180;
          let data = command.convertToBytes();
          let newArray = [];
          for (let i = 0; i < data.byteLength; i += mainChunkSizeInBytes) {
            let subChunk = data.slice(i, Math.min(i + mainChunkSizeInBytes, data.byteLength));
            let hexString = arrayBufferToHex(subChunk);
            // 直接基于原始字节计算 MD5，避免字符串编码问题
            let md5str = SparkMD5.ArrayBuffer.hash(subChunk);
            let newData = hexToBuffer(hexString + md5str);
            newArray.push(newData);
          }
          let this_index = 0;
          let subChunks = [];
          let postBleDataList = [];
          for (let j in newArray) {
            let obj = {
              index: j,
              subChunks: [],
              sendStatus: false,
            };
            const subChunkSizeInBytes = negotiatedMTU;
            let offsetItem = 0;
            for (let i = 0; i < newArray[j].byteLength; i += subChunkSizeInBytes) {
              const subChunk = newArray[j].slice(i, Math.min(i + subChunkSizeInBytes, newArray[j].byteLength));
              subChunks.push(subChunk);
              obj.subChunks.push({
                item: subChunk,
                index: this_index,
                status: false,
                offsetItem: offsetItem,
              });
              offsetItem += 502;
            }
            if (this_index > j) {
              subChunks.push(false);
            }
            postBleDataList.push(obj);
            this_index++;
          }
          let offset = 0;
          let postIndex = 0;
          for (let i in postBleDataList) {
            let list = postBleDataList[i].subChunks;
            let offsetItem = 0;
            for (let j in list) {
              let hexString = arrayBufferToHex(list[j].item);
              let commandLength = (hexString.length / 2 + 4).toString(16);
              commandLength = commandLength.padStart(4, '0');
              let command = `933400${commandLength}${iot_utils_to_little_endian_hex(offsetItem, 4)}${hexString}`;
              console.log('command', command);
              await ble.writeWithoutResponse(
                window.peripheral[device].prop.id,
                'ff80',
                'ff85',
                command.convertToBytes(),
                function (response) {
                  console.log('response', response);
                },
                function (error) {
                  actionReject(error);
                }
              );
              await new Promise((resolve) => setTimeout(resolve, 500));
              if (postIndex == postBleDataList.length - 1 && j == list.length - 1) {
                console.log('9335');
                setTimeout(() => {
                  ble.writeWithoutResponse(
                    window.peripheral[device].prop.id,
                    'ff80',
                    'ff85',
                    '9335'.convertToBytes(),
                    function (response) {
                      console.log('response', response);
                      actionResolve(true);
                    },
                    function (error) {
                      actionReject(error);
                    }
                  );
                }, 500);
              }
              offsetItem += negotiatedMTU;
            }
            postIndex++;
          }
        });
      };
      try {
        app.dialog.preloader(_('Sending, please wait...'));
        await commandReady();
        await new Promise((resolve) => setTimeout(resolve, 500));
        await commandAction();
        app.dialog.close();
      } catch (error) {
        app.dialog.close();
        reject(error);
      }
    });
  },
  parseTimeString: function (timeStr) {
    if (!timeStr) return { timestamp: 0, microsec: 0 };
    const [datePart, timePart] = timeStr.split(' ');
    const [hours, minutes, seconds] = timePart.split(':');
    const [sec, microsec] = seconds.split('.');
    const dateTime = dayjs(`${datePart} ${hours}:${minutes}:${sec}`);
    return {
      timestamp: dateTime.valueOf(),
      microsec: microsec ? parseInt(microsec, 10) : 0,
    };
  },
};

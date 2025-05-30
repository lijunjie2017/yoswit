window.iotChunks = [];
window.iot_uploadData = null;
window.uploadStatus = [];
window.iot_attempt = 0;
window.iot_update_file = async () => {
  const TAG = 'iot_update_file';
  window.iot_attempt = 0;
  await core_load_script('https://dev.mob-mob.com/files/spark-md5.min.js');
  setTimeout(() => {
    app.preloader.show();
    let uuid = '94:B5:55:97:53:0E';
    //let uuid = 'C434EB73-0997-209C-932B-D05FC4CAA554';
    //get the file link
    //let url = 'https://dev.mob-mob.com/files/test.mp3';
    let url = `https://ota.mob-mob.com/wifi/v12.116E.bin`;
    //let url = `https://dev.mob-mob.com/files/test.txt`;
    let filesize = 0;
    let filename = 'v12.116E.bin';
    http
      .request(encodeURI(url), {
        method: 'GET',
        responseType: 'blob',
      })
      .then((rs) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          const chunks = [];
          const fileSize = rs.data.size;
          let offset = 0;
          const chunkSizeInBytes = 4096;
          const reader = new FileReader();
          const file = rs.data;
          reader.readAsArrayBuffer(rs.data);
          reader.onload = function (event) {
            window.iot_uploadData = event.target.result;
            resolve(rs);
          };
        });
      })
      .then((rs) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsBinaryString(rs.data);
          reader.onload = function (e) {
            console.log('e.target.result', e.target.result);
            const md5 = SparkMD5.hashBinary(e.target.result);
            console.log('md5', md5);
            resolve(md5);
          };
          reader.onerror = reject;
          console.log(rs);
          filesize = rs.data.size;
        });
      })
      .then(async (filedata) => {
        console.log(filedata);
        let fileType = 1; //1:ota,2:mp3 3:chunk
        let sizeHex = iot_utils_to_little_endian_hex(filesize, 4);
        let nameHex = convertToFixedSizeHex(filename, 31);
        console.log(nameHex);
        let data = `93330000340${fileType}${sizeHex}${filedata}${nameHex}`;
        console.log(data);
        //return
        //connect to the device
        try {
          ble.connect(
            uuid,
            (peripheralData) => {
              if (Capacitor.getPlatform() === 'android') {
                ble.requestMtu(
                  uuid,
                  512,
                  () => {
                    console.log('>>>> device request mtu success');
                    let this_dialog = app.dialog.progress(`${_('Loading assets')}`, 0);
                    setTimeout(() => {
                      ble.startNotification(
                        uuid,
                        'ff80',
                        'ff85',
                        function (rs) {
                          console.log(rs);
                          if (rs && window.iot_attempt == 0) {
                            iotProcessData(uuid, window.iot_uploadData);
                            window.iot_attempt++;
                          }
                          if (rs && window.iot_attempt > 0) {
                            let status = parseInt(rs.substring(10, 12), 16);
                            if (status > 0) {
                              app.preloader.hide();
                              this_dialog.setProgress(status);
                            }
                            if (status == 100) {
                              app.preloader.hide();
                              this_dialog.close();
                              app.dialog.alert('Success', runtime.appInfo.name, () => {});
                              window.uploadStatus[parseInt(window.iot_attempt) - 1] = true;
                            }
                            //if status > 100?reject error
                            if (status > 100) {
                              //disconnect the device
                              app.preloader.hide();
                              app.dialog.close();
                              ble.disconnect(uuid);
                              app.dialog.alert('Error: ' + status, runtime.appInfo.name, () => {});
                            }
                          }
                        },
                        function (error) {
                          console.log(error);
                        }
                      );
                      ble.writeWithoutResponse(
                        uuid,
                        'ff80',
                        'ff85',
                        data.convertToBytes(),
                        function (response) {
                          console.log(response);
                        },
                        function (error) {
                          console.log(error);
                        }
                      );
                    }, 1000);
                  },
                  (err) => {
                    console.log('>>>> device request mtu fail: ' + err);
                    app.dialog.alert('>>>> device request mtu fail: ' + err);
                  }
                );
              } else {
                let this_dialog = app.dialog.progress(`${_('Loading assets')}`, 0);
                setTimeout(() => {
                  ble.startNotification(
                    uuid,
                    'ff80',
                    'ff85',
                    function (rs) {
                      console.log(rs);
                      if (rs && window.iot_attempt == 0) {
                        iotProcessData(uuid, window.iot_uploadData);
                        window.iot_attempt++;
                      }
                      if (rs && window.iot_attempt > 0) {
                        let status = parseInt(rs.substring(10, 12), 16);
                        if (status > 0) {
                          app.preloader.hide();
                          this_dialog.setProgress(status);
                        }
                        if (status == 100) {
                          app.preloader.hide();
                          this_dialog.close();
                          app.dialog.alert('Success', runtime.appInfo.name, () => {});
                          window.uploadStatus[parseInt(window.iot_attempt) - 1] = true;
                        }
                        //if status > 100?reject error
                        if (status > 100) {
                          //disconnect the device
                          app.preloader.hide();
                          app.dialog.close();
                          ble.disconnect(uuid);
                          app.dialog.alert('Error: ' + status, runtime.appInfo.name, () => {});
                        }
                      }
                    },
                    function (error) {
                      console.log(error);
                    }
                  );
                  ble.writeWithoutResponse(
                    uuid,
                    'ff80',
                    'ff85',
                    data.convertToBytes(),
                    function (response) {
                      console.log(response);
                    },
                    function (error) {
                      console.log(error);
                    }
                  );
                }, 1000);
              }
            },
            (err) => {
              app.dialog.alert(err, runtime.appInfo.name, () => {});
            }
          );
        } catch (error) {
          app.preloader.hide();
          app.dialog.alert(error, runtime.appInfo.name, () => {});
        }
      })
      .catch((e) => {
        console.log(e);
        //window.app.preloader.hide();
        app.dialog.alert(e, runtime.appInfo.name, () => {});
      });
  }, 500);
};

window.iotProcessData = async (uuid, data) => {
  let mainChunkSizeInBytes = 4096;
  console.log('data.byteLength', data.byteLength);
  let newArray = [];
  for (let i = 0; i < data.byteLength; i += mainChunkSizeInBytes) {
    let subChunk = data.slice(i, Math.min(i + mainChunkSizeInBytes, data.byteLength));
    const fileString = arrayBufferToHex(subChunk); 
    const bytestoString = bytesToString(subChunk);
    //console.log('bytestoString', bytestoString);
    const crc16 = core_util_calculate_crc16_modbus_for_doa(fileString);
    const md5str = SparkMD5.hashBinary(bytestoString);
    console.log('md5str', md5str);
    const new_data = hexToBuffer(fileString + md5str);
    newArray.push(new_data);
    window.uploadStatus.push(false);
  }
  console.log('newArray', newArray);
  let this_index = 0;
  let subChunks = [];
  for (let j in newArray) {
    const subChunkSizeInBytes = 504;
    for (let i = 0; i < newArray[j].byteLength; i += subChunkSizeInBytes) {
      const subChunk = newArray[j].slice(i, Math.min(i + subChunkSizeInBytes, newArray[j].byteLength));
      subChunks.push(subChunk);
    }
    if (this_index > j) {
      subChunks.push(false);
    }
    this_index++;
  }
  console.log('subChunks', subChunks);
  for (let i in subChunks) {
    let hexString = arrayBufferToHex(subChunks[i]);
    let commandLength = (hexString.length / 2).toString(16);
    commandLength = commandLength.padStart(4, '0');
    console.log('commandLength', commandLength);
    let command = `933400${commandLength}${hexString}`;
    console.log('command', command);
    //await iot_delay(500);
    if (!subChunks[i]) {
      console.log('9335');
      setTimeout(() => {
        ble.writeWithoutResponse(
          uuid,
          'ff80',
          'ff85',
          '9335'.convertToBytes(),
          function (response) {
            //resolve(response);
          },
          function (error) {
            //reject(error);
          }
        );
      }, 500);
    } else {
      setTimeout(() => {
        ble.writeWithoutResponse(
          uuid,
          'ff80',
          'ff85',
          command.convertToBytes(),
          function (response) {
            //resolve(response);
          },
          function (error) {
            //reject(error);
          }
        );
      }, 500);
    }
  }
  setTimeout(() => {
    ble.writeWithoutResponse(
      uuid,
      'ff80',
      'ff85',
      '9335'.convertToBytes(),
      function (response) {
        //resolve(response);
      },
      function (error) {
        //reject(error);
      }
    );
  }, 10 * 1000);
};

window.writeNextSlice = (deviceId, sliceCount) => {
  console.log(currentIndex);
  console.log(allslices.length);
  if (currentIndex >= allslices.length) {
    console.log('All data has been written');
    return;
  }

  let thisslice = allslices[currentIndex];
  ble.writeWithoutResponse(
    deviceId,
    'ff80',
    'ff85',
    thisslice.buffer,
    function () {
      console.log('Slice ' + (currentIndex + 1) + ' of ' + sliceCount + ' has been written');
      currentIndex++;
      writeNextSlice(deviceId, sliceCount);
    },
    function (error) {
      console.log('Failed to write slice ' + (currentIndex + 1) + ' of ' + sliceCount + ': ' + error);
    }
  );
};

window.bytesToString = function (buffer) {
  return Array.from(new Uint8Array(buffer), byte => 
    String.fromCharCode(byte)
  ).join('');
};

window.convertToFixedSizeHex = (inputString, sizeInBytes) => {
  console.log(inputString);
  const byteSize = sizeInBytes * 2; // 每个字节对应两个十六进制字符
  const hexString = stringToHex(inputString); // 将字符串转换为十六进制表示
  console.log(hexString);
  const paddedHexString = hexString.padEnd(byteSize, '0'); // 在结果前面填充零，使其达到指定的字节大小
  return paddedHexString.toLowerCase(); // 转换为大写形式并返回
};

window.stringToHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex;
};

window.arrayBufferToHex = (arrayBuffer) => {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

window.hexToBuffer = (hexString) => {
  // 假设 hexString 是一个表示十六进制数据的字符串，例如 "4A2F7C"
  // 首先将 hexString 解析为字节数组
  var bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }

  // 然后创建一个 ArrayBuffer 对象并将字节数组复制到这个缓冲区中
  var buffer = bytes.buffer;

  return buffer;
};

window.iot_delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

window.iot_update_file_json = async () => {
  const TAG = 'iot_update_json';
  window.iot_attempt = 0;
  try {
    const jsonData = {
      'name': 'n3j9lvba94',
      'owner': 'grace.zhao@yoswit.com',
      'creation': '2025-05-15 11:43:20.356538',
      'modified': '2025-05-16 05:04:49.950126',
      'modified_by': 'Administrator',
      'docstatus': 0,
      'idx': 0,
      'device': 'C0:84:7D:0E:D2:B3',
      'device_button_group': 'INNO_PRESS_LIFT_10F',
      'status': 'Expired',
      'access_type': 'Octopus Card',
      'guest_email': 'uhb@qq.com',
      'pin_remark': 'Octopus Card',
      'octopus_card_id': '12345678',
      'octopus_check_digit': '9',
      'access_level': '0',
      'one_time_access': 0,
      'access_control_setting': 0,
      'disabled': 0,
      'valid_from': '2025-05-15 11:42:07',
      'valid_to': '2025-05-15 23:59:00',
      'repeat_1': 0,
      'repeat_2': 0,
      'repeat_3': 0,
      'repeat_4': 0,
      'repeat_5': 0,
      'repeat_6': 0,
      'repeat_7': 0,
      'reference': 'n268d5lj31',
      'next_publish': '2025-05-16 05:04:13.862885',
      'door': '026ec8ce1e',
      'next_publish_mins': 1024,
      'door_name': 'Innocell Lift 2 Cam 3 10F',
      'last_publish': '2025-05-15 20:32:13.862984',
      'doctype': 'Device Access',
      'blocking_schedule': [],
      '__last_sync_on': '2025-05-16T07:20:07.057Z',
    };
    // 2. 数据转换与校验

  } catch (error) {
    console.log(error);
  }
};

window.base64ToArrayBuffer = (base64String) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

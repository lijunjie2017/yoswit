window.iot_ir_db_upload = async()=>{
  const TAG = 'iot_ir_db_upload';
  console.log(TAG);
//   let url = `http://image.si-yee.com/uploads/2024/09/13/EjR3WvUj_8.b.b3-E.db`;

let url = `https://explorer.si-yee.com/api/public/dl/lMwRArXb/8.b.ac_jj_all.db`;
  let filePath = '8.b.ac_jj_all.db';
  let fileName = '8.b.ac_jj_all.db';
  let mkdirFilePath = `databases/`;
  if(deviceInfo.operatingSystem === 'ios'){
    mkdirFilePath = `Library/LocalDatabase/`;
  }
  //check if have this file  
  try{
    // let res = await Capacitor.Plugins.Filesystem.stat({
    //   directory: 'LIBRARY',
    //   path: filePath,
    // })
    // console.log("res",res);
   await http2.inspectFileStat(cordova.file.applicationStorageDirectory, `${mkdirFilePath}${fileName}`)
   const db =  window.sqlitePlugin.openDatabase({ name: fileName, location: 'default' });
   console.log("db",db);
   let sql = `SELECT CODE FROM AIR_TABLE WHERE BRAND_CN = "Aztech";`;
   db.executeSql(
    sql,
    [],
    (resultSet) => {
      for (let i = 0; i < resultSet.rows.length; i++) {
        console.log(resultSet.rows.item(0))
      }
    },
    (error) => {
      console.log(error);
    }
  );
  }catch(error){
    // debugger
    console.log(error);
    alert(JSON.stringify(error))
    // try{
    //   let res = await Capacitor.Plugins.Filesystem.downloadFile({
    //     url : url,
    //     method : 'GET',
    //     readTimeout : 6000,
    //     connectTimeout : 6000,
    //     timeout: 6000,
    //     path : filePath,
    //     directory : 'DOCUMENTS',
    //     progress : true,
    //     recursive : true
    //   })
    //   console.log("res",res)
    // }catch(errors){
    //   console.log(errors)
    // }
    try{
      const resData = await http2.request({
        url: url,
        method: 'DOWNLOAD',
        timeout: 60,
        debug:true,
        file: {
          path: cordova.file.applicationStorageDirectory + mkdirFilePath + fileName,
          name: `${fileName}`,
        },
      });
      console.log("resData",resData);
    }catch(errorss){
      console.log("errorss",errorss)
    }
    
    return
    let uri = await Capacitor.Plugins.Filesystem.getUri({
      directory: 'LIBRARY',
      path: filePath,
    });
    console.log("uri",uri);
    let thisUri = uri.uri.replace('files', 'databases');
    //download the file
    cordova.plugin.http.sendRequest(encodeURI(url), {
        method: 'download',
        filePath : thisUri,
        name : fileName,
        timeout: 60,
        connectTimeout: 60,
        readTimeout: 60,

    },(res)=>{
      console.log("res",res);
    },(error)=>{
      console.log(error)
    })
    
  }
}





// window.iot_update_file = async () => {
//   const TAG = 'iot_update_file';
//   window.iot_attempt = 0;
//   await core_load_script('https://dev.mob-mob.com/files/spark-md5.min.js');
//   setTimeout(() => {
//     app.preloader.show();
//     let uuid = '94:B5:55:97:53:0E';
//     //let uuid = 'C434EB73-0997-209C-932B-D05FC4CAA554';
//     //get the file link
//     //let url = 'https://dev.mob-mob.com/files/test.mp3';
//     let url = `https://ota.mob-mob.com/wifi/v12.116E.bin`;
//     //let url = `https://dev.mob-mob.com/files/test.txt`;
//     let filesize = 0;
//     let filename = 'v12.116E.bin';
//     http
//       .request(encodeURI(url), {
//         method: 'GET',
//         responseType: 'blob',
//       })
//       .then((rs) => {
//         const reader = new FileReader();
//         return new Promise((resolve, reject) => {
//           const chunks = [];
//           const fileSize = rs.data.size;
//           let offset = 0;
//           const chunkSizeInBytes = 4096;
//           const reader = new FileReader();
//           const file = rs.data;
//           reader.readAsArrayBuffer(rs.data);
//           reader.onload = function (event) {
//             window.iot_uploadData = event.target.result;
//             resolve(rs);
//           };
//         });
//       })
//       .then((rs) => {
//         return new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.readAsBinaryString(rs.data);
//           reader.onload = function (e) {
//             console.log('e.target.result', e.target.result);
//             const md5 = SparkMD5.hashBinary(e.target.result);
//             console.log('md5', md5);
//             resolve(md5);
//           };
//           reader.onerror = reject;
//           console.log(rs);
//           filesize = rs.data.size;
//         });
//       })
//       .then(async (filedata) => {
//         console.log(filedata);
//         let fileType = 1; //1:ota,2:mp3
//         let sizeHex = iot_utils_to_little_endian_hex(filesize, 4);
//         let nameHex = convertToFixedSizeHex(filename, 31);
//         console.log(nameHex);
//         let data = `93330000340${fileType}${sizeHex}${filedata}${nameHex}`;
//         console.log(data);
//         //return
//         //connect to the device
//         try {
//           ble.connect(
//             uuid,
//             (peripheralData) => {
//               if (Capacitor.getPlatform() === 'android') {
//                 ble.requestMtu(
//                   uuid,
//                   512,
//                   () => {
//                     console.log('>>>> device request mtu success');
//                     let this_dialog = app.dialog.progress(`${_('Loading assets')}`, 0);
//                     setTimeout(() => {
//                       ble.startNotification(
//                         uuid,
//                         'ff80',
//                         'ff85',
//                         function (rs) {
//                           console.log(rs);
//                           if (rs && window.iot_attempt == 0) {
//                             iotProcessData(uuid, window.iot_uploadData);
//                             window.iot_attempt++;
//                           }
//                           if (rs && window.iot_attempt > 0) {
//                             let status = parseInt(rs.substring(10, 12), 16);
//                             if (status > 0) {
//                               app.preloader.hide();
//                               this_dialog.setProgress(status);
//                             }
//                             if (status == 100) {
//                               app.preloader.hide();
//                               this_dialog.close();
//                               app.dialog.alert('Success', runtime.appInfo.name, () => {});
//                               window.uploadStatus[parseInt(window.iot_attempt) - 1] = true;
//                             }
//                             //if status > 100?reject error
//                             if (status > 100) {
//                               //disconnect the device
//                               app.preloader.hide();
//                               app.dialog.close();
//                               ble.disconnect(uuid);
//                               app.dialog.alert('Error: ' + status, runtime.appInfo.name, () => {});
//                             }
//                           }
//                         },
//                         function (error) {
//                           console.log(error);
//                         }
//                       );
//                       ble.writeWithoutResponse(
//                         uuid,
//                         'ff80',
//                         'ff85',
//                         data.convertToBytes(),
//                         function (response) {
//                           console.log(response);
//                         },
//                         function (error) {
//                           console.log(error);
//                         }
//                       );
//                     }, 1000);
//                   },
//                   (err) => {
//                     console.log('>>>> device request mtu fail: ' + err);
//                     app.dialog.alert('>>>> device request mtu fail: ' + err);
//                   }
//                 );
//               } else {
//                 let this_dialog = app.dialog.progress(`${_('Loading assets')}`, 0);
//                 setTimeout(() => {
//                   ble.startNotification(
//                     uuid,
//                     'ff80',
//                     'ff85',
//                     function (rs) {
//                       console.log(rs);
//                       if (rs && window.iot_attempt == 0) {
//                         iotProcessData(uuid, window.iot_uploadData);
//                         window.iot_attempt++;
//                       }
//                       if (rs && window.iot_attempt > 0) {
//                         let status = parseInt(rs.substring(10, 12), 16);
//                         if (status > 0) {
//                           app.preloader.hide();
//                           this_dialog.setProgress(status);
//                         }
//                         if (status == 100) {
//                           app.preloader.hide();
//                           this_dialog.close();
//                           app.dialog.alert('Success', runtime.appInfo.name, () => {});
//                           window.uploadStatus[parseInt(window.iot_attempt) - 1] = true;
//                         }
//                         //if status > 100?reject error
//                         if (status > 100) {
//                           //disconnect the device
//                           app.preloader.hide();
//                           app.dialog.close();
//                           ble.disconnect(uuid);
//                           app.dialog.alert('Error: ' + status, runtime.appInfo.name, () => {});
//                         }
//                       }
//                     },
//                     function (error) {
//                       console.log(error);
//                     }
//                   );
//                   ble.writeWithoutResponse(
//                     uuid,
//                     'ff80',
//                     'ff85',
//                     data.convertToBytes(),
//                     function (response) {
//                       console.log(response);
//                     },
//                     function (error) {
//                       console.log(error);
//                     }
//                   );
//                 }, 1000);
//               }
//             },
//             (err) => {
//               app.dialog.alert(err, runtime.appInfo.name, () => {});
//             }
//           );
//         } catch (error) {
//           app.preloader.hide();
//           app.dialog.alert(error, runtime.appInfo.name, () => {});
//         }
//       })
//       .catch((e) => {
//         console.log(e);
//         //window.app.preloader.hide();
//         app.dialog.alert(e, runtime.appInfo.name, () => {});
//       });
//   }, 500);
// };


// window.iotProcessData = async (uuid, data) => {
//   let mainChunkSizeInBytes = 4096;
//   console.log("data.byteLength",data.byteLength);
//   let newArray = [];
//   for (let i = 0; i < data.byteLength; i += mainChunkSizeInBytes) {
//     let subChunk = data.slice(i, Math.min(i + mainChunkSizeInBytes,data.byteLength));
//     const fileString = arrayBufferToHex(subChunk);
//     const bytestoString = bytesToString(subChunk);
//     //console.log('bytestoString', bytestoString);
//     const crc16 = core_util_calculate_crc16_modbus_for_doa(fileString);
//     const md5str = SparkMD5.hashBinary(bytestoString);
//     console.log('md5str', md5str);
//     const new_data = hexToBuffer(fileString + md5str);
//     newArray.push(new_data);
//     window.uploadStatus.push(false);
//   }
//   console.log('newArray', newArray);
//   let this_index = 0;
//   let subChunks = [];
//   for (let j in newArray) {
//     const subChunkSizeInBytes = 504;
//     for (let i = 0; i < newArray[j].byteLength; i += subChunkSizeInBytes) {
//       const subChunk = newArray[j].slice(i, Math.min(i + subChunkSizeInBytes,newArray[j].byteLength));
//       subChunks.push(subChunk);
//     }
//     if (this_index > j) {
//       subChunks.push(false);
//     }
//     this_index++;
//   }
//   console.log('subChunks', subChunks);
//   for (let i in subChunks) {
//     let hexString = arrayBufferToHex(subChunks[i]);
//     let commandLength = (hexString.length / 2).toString(16);
//     commandLength = commandLength.padStart(4, '0');
//     console.log('commandLength', commandLength);
//     let command = `933400${commandLength}${hexString}`;
//     console.log('command', command);
//     //await iot_delay(500);
//     if (!subChunks[i]) {
//       console.log('9335');
//       setTimeout(() => {
//         ble.writeWithoutResponse(
//           uuid,
//           'ff80',
//           'ff85',
//           '9335'.convertToBytes(),
//           function (response) {
//             //resolve(response);
//           },
//           function (error) {
//             //reject(error);
//           }
//         );
//       }, 500);
//     } else {
//       setTimeout(() => {
//         ble.writeWithoutResponse(
//           uuid,
//           'ff80',
//           'ff85',
//           command.convertToBytes(),
//           function (response) {
//             //resolve(response);
//           },
//           function (error) {
//             //reject(error);
//           }
//         );
//       }, 500);
//     }
//   }
//   setTimeout(() => {
//     ble.writeWithoutResponse(
//       uuid,
//       'ff80',
//       'ff85',
//       '9335'.convertToBytes(),
//       function (response) {
//         //resolve(response);
//       },
//       function (error) {
//         //reject(error);
//       }
//     );
//   }, 10 * 1000);
// };

// window.writeNextSlice = (deviceId, sliceCount) => {
//   console.log(currentIndex);
//   console.log(allslices.length);
//   if (currentIndex >= allslices.length) {
//     console.log('All data has been written');
//     return;
//   }

//   let thisslice = allslices[currentIndex];
//   ble.writeWithoutResponse(
//     deviceId,
//     'ff80',
//     'ff85',
//     thisslice.buffer,
//     function () {
//       console.log('Slice ' + (currentIndex + 1) + ' of ' + sliceCount + ' has been written');
//       currentIndex++;
//       writeNextSlice(deviceId, sliceCount);
//     },
//     function (error) {
//       console.log('Failed to write slice ' + (currentIndex + 1) + ' of ' + sliceCount + ': ' + error);
//     }
//   );
// };

// window.bytesToString = function (buffer) {
//   return String.fromCharCode.apply(null, new Uint8Array(buffer));
// };

// window.convertToFixedSizeHex = (inputString, sizeInBytes) => {
//   console.log(inputString);
//   const byteSize = sizeInBytes * 2; // 每个字节对应两个十六进制字符
//   const hexString = stringToHex(inputString); // 将字符串转换为十六进制表示
//   console.log(hexString);
//   const paddedHexString = hexString.padEnd(byteSize, '0'); // 在结果前面填充零，使其达到指定的字节大小
//   return paddedHexString.toLowerCase(); // 转换为大写形式并返回
// };

// window.stringToHex = (str) => {
//   let hex = '';
//   for (let i = 0; i < str.length; i++) {
//     hex += '' + str.charCodeAt(i).toString(16);
//   }
//   return hex;
// };

// window.arrayBufferToHex = (arrayBuffer) => {
//   const uint8Array = new Uint8Array(arrayBuffer);
//   return Array.from(uint8Array)
//     .map((byte) => byte.toString(16).padStart(2, '0'))
//     .join('');
// };

// window.hexToBuffer = (hexString) => {
//   // 假设 hexString 是一个表示十六进制数据的字符串，例如 "4A2F7C"
//   // 首先将 hexString 解析为字节数组
//   var bytes = new Uint8Array(Math.ceil(hexString.length / 2));
//   for (var i = 0; i < bytes.length; i++) {
//     bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
//   }

//   // 然后创建一个 ArrayBuffer 对象并将字节数组复制到这个缓冲区中
//   var buffer = bytes.buffer;

//   return buffer;
// };

// window.iot_delay = (ms) => {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// };

window.ir_data = [];
window.iot_ir_learned = (params) => {
  const TAG = 'iot_ir_learned';
  const guid = params.obj.attr('guid');
  let uuid = '';
  for (let i in scanned_periperals) {
    if (scanned_periperals[i].guid == guid) {
      uuid = i;
    }
  }
  ble.requestMtu(
    uuid,
    512,
    () => {
      console.log('request mtu success');
      let data = '8700';
      let cmd = [];
      cmd.push({ action: 'connect' });
      cmd.push({ action: 'write', data: data });
      ha_process_periperal_cmd(uuid, cmd).then(
        () => {
          let new_cmd = [];
          new_cmd.push({
            action: 'startNotification',
            post: (id, s, rs) => {
              console.log('startNotification', rs);
              if (rs.startsWith('89')) {
                console.log('rs', rs);
                let index = rs.substring(2, 4);
                let ir_learned_data = rs.substring(4, rs.length);
                window.ir_data.push(ir_learned_data);
                if (index == '00') {
                  $(`.init-input[name="ir_code"]`).val(window.ir_data.join(''));
                }
              }
            },
          });
          ha_process_periperal_cmd(uuid, new_cmd).then((rs) => {});
        },
        (error) => {
          const toast = app.toast.create({
            position: 'bottom',
            closeTimeout: 3000,
            text: error,
          });
          toast.open();
        }
      );
    },
    () => {
      console.log('request mtu failed');
    }
  );
};

window.iot_ir_test = async (params) => {
  const TAG = 'iot_ir_test';
  console.log(TAG);
  const guid = params.obj.attr('guid');
  let uuid = '';
  for (let i in scanned_periperals) {
    if (scanned_periperals[i].guid == guid) {
      uuid = i;
    }
  }
  let bytes_array = [];
  let bytes_string = window.ir_data.join('')
  let this_data = `3003${bytes_string.substring(2, bytes_string.length)}`;
  let count_string = `${this_data}${addChecksum(iotConvertHexToData(this_data))}`;
  let handle_data = iot_ir_learned_init(this_data);
  let ref = `${handle_data}${count_string.toString(16).pad('00')}`;
  console.log("ref",ref);
  if (ref.length > 36) {
    let group = Math.ceil((ref.length * 1.0) / 36.0);
    for (var i = 0; i < group; i++) {
      bytes_array.push('87' + (group - i - 1).toString(16).pad('00') + ref.substr(i * 36, 36));
    }
  } else {
    bytes_array.push('8700' + ref);
  }
  console.log(bytes_array);
  let cmd = [{ 'action': 'connect' }];
  for (var i in bytes_array) {
    (function (_i, _bytes) {
      cmd.push({ action: 'write', data: _bytes });
    })(i, bytes_array[i]);
  }
  try {
    console.log('cmd', cmd);
    if(window.device.platform.toLowerCase()=='ios'){
      ha_process_periperal_cmd(uuid, cmd, true)
          .then((rs) => {
            console.log('rs', rs);
          })
          .catch((error) => {
            app.dialog.alert(error);
          });
    }else{
      ble.requestMtu(
        uuid,
        512,
        () => {
          console.log('request mtu success');
          ha_process_periperal_cmd(uuid, cmd, true)
            .then((rs) => {
              console.log('rs', rs);
            })
            .catch((error) => {
              app.dialog.alert(error);
            });
        },
        () => {
          console.log('request mtu failed');
        }
      );
    }
  } catch (error) {
    app.dialog.alert(error);
  }
};

window.calculateHexSum = (hexString) => {
  let sum = 0;
  // 每两个字符为一个字节，进行加法运算
  for (let i = 0; i < hexString.length; i += 2) {
    let byte = parseInt(hexString.substr(i, 2), 16); // 将每两个字符转换为十进制数
    sum += byte;
  }

  return sum;
};

window.iot_ir_learned_init = (data)=>{
  let zeroLen = 0, zeroPosition = 0, currZeroLen = 0, currZeroPosition = 0;

  // Find the longest consecutive "00" sequence
  for (let i = 0; i < data.length; i++) {
      if (data.substring(i, i + 2).toLowerCase() === "00") {
          if (currZeroLen === 0) {
              currZeroPosition = Math.floor(i / 2);
          }
          currZeroLen ++;
      } else {
          if (currZeroLen > zeroLen) {
              zeroLen = currZeroLen;
              zeroPosition = currZeroPosition;
          }
          currZeroLen = 0;
      }
      i++;
  }

  // Check the last sequence
  if (currZeroLen > zeroLen) {
      zeroLen = currZeroLen;
      zeroPosition = currZeroPosition;
  }

  if (zeroLen > 0) {
      // Create the new data string
      let newData = "3003" + zeroPosition.toString(16).padStart(2, '0') + zeroLen.toString(16).padStart(2, '0');

      for (let i = 4; i < data.length; i++) {
          if (i / 2 >= zeroPosition && i / 2 < zeroLen + zeroPosition) {
              i++;
              continue;
          }
          newData += data.substring(i, i + 2);
          i++;
      }

      data = newData;
  }

  return data;
}

window.iotConvertHexToData = (hexString)=>{
  let bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return bytes;
}

window.addChecksum = (data)=> {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
      sum += data[i];
  }
  
  let newData = new Uint8Array(data.length + 1);
  let j = 0;
  for (let i = 0; i < data.length; i++) {
      j += data[i];
      newData[i] = data[i];
  }
  newData[data.length] = j;
  
  return j;
}

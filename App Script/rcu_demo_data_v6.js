rcu_demo_data = () => {
  let manufacturing_data =
    '97000101080201030302ff000402ffff05027f7f11030400000000120401801305101326b00000000000000000000000000014060800000000000000001507200000000000000000000000000000000000000000000000000000000000000000';
  //"97000101000201000302ffff0402000005020000110304000000001204018013051002006000000000000000000000000000"
  let trigger_status = '00000000280000000000000000000000';
  const splitBytesAndConvertToBinaryArray = (character) => {
    let bytes = character.match(/.{1,2}/g);
    let binaryArray = bytes
      .map((byte) => {
        let binaryByte = (parseInt(byte, 16) >>> 0).toString(2).padStart(8, '0');
        return binaryByte.split('').map(Number);
      })
      .flat();
    return binaryArray;
  };
  const tindyRcuData = (str) => {
    let result = [];
    let i = 4;
    while (i < str.length) {
      let index = str.substring(i, i + 2);
      let type = str.substring(i + 2, i + 4);
      let dataLength = type === '01' ? 2 : type === '02' ? 4 : 0;
      let data = str.substring(i + 4, i + 4 + dataLength);

      result.push({
        index,
        type,
        data,
      });

      if (index === '05') break;

      i += 4 + dataLength;
    }
    return result;
  };

  const ble_rcu_input_render_for_erp = (input) => {
    if (input.length !== 32) {
      throw new Error('输入必须为32位字符');
    }
    // 分割为16个字节（每2个字符）
    const bytes = [];
    for (let i = 0; i < 32; i += 2) {
      bytes.push(input.substr(i, 2));
    }
    // 生成128位二进制字符串
    let binaryStr = '';
    for (const byte of bytes) {
      const value = parseInt(byte, 16);
      binaryStr += value.toString(2).padStart(8, '0');
    }
    // 生成结果对象
    const result = {};
    for (let i = 0; i < 128; i++) {
      const position = i + 1;
      const hexKey = position.toString(16).padStart(2, '0').toUpperCase();
      result[hexKey] = binaryStr[i] || '0'; // 安全处理
    }
    return result;
  };

  const indexMap = {
    '01': [32, 33],
    '02': [34, 35],
    '03': [36, 37],
    '04': [38, 39],
    '05': [40, 41],
  };
  const indexOnoffMap = {
    '01': [12, 13, 14, 15],
    '02': [16, 17, 18, 19],
    '03': [20, 21, 22, 23],
    '04': [24, 25, 26, 27],
    '05': [28, 29, 30, 31],
  };

  let rcuDataList = tindyRcuData(manufacturing_data);
  console.log('rcuDataList', rcuDataList);
  rcuDataList.forEach((item) => {
    if (item.type === '02' && item.index in indexMap) {
      const [firstIndex, secondIndex] = indexMap[item.index];
      console.log('firstIndex', parseInt(item.data.substring(0, 2), 16));
      console.log('secondIndex', parseInt(item.data.substring(2, 4), 16));
      // deviceItem.status['mobmob'][0][firstIndex] = parseInt(item.data.substring(0, 2), 16);
      // deviceItem.status['mobmob'][0][secondIndex] = parseInt(item.data.substring(2, 4), 16);
    }
    if (item.type === '01' && item.index in indexMap) {
      let this_ref = parseInt(item.data, 16).toString(2).pad('0000');
      //debugger
      const [firstIndex, secondIndex, thirdIndex, flourIndex] = indexOnoffMap[item.index];
      console.log('this_ref', this_ref);
      // deviceItem.status['mobmob'][0][firstIndex] = this_ref[3];
      // deviceItem.status['mobmob'][0][secondIndex] = this_ref[2];
      // deviceItem.status['mobmob'][0][thirdIndex] = this_ref[1];
      // deviceItem.status['mobmob'][0][flourIndex] = this_ref[0];
    }
  });

  let inputDataList = manufacturing_data.split('110304');
  let inputStatus = inputDataList[1].substring(0, 8);
  let inputStatusByteList = splitBytesAndConvertToBinaryArray(inputStatus);
  console.log('inputStatusByteList', inputStatusByteList);

  let obj_map = ble_rcu_input_render_for_erp(trigger_status);
  console.log('obj_map', obj_map);

  let profile_subdevices = cloneDeep(erp.info.profile.profile_subdevice);
  profile_subdevices.forEach((item) => {
    if (isset(item.config)) {
      //find the scene_id=14&enable=true
      if (item.config.includes('scene_id=')) {
        let scene_id = item.config.split('scene_id=')[1].split('&')[0];
        let scene_id_16 = parseInt(scene_id).toString(16).pad('00').toUpperCase();
        console.log('scene_id_16', scene_id_16);
        let scene_status = obj_map[scene_id_16];
        console.log('scene_status', scene_status);
        //scene_status=0,代表有人，1代表无人
      }
    }
  });
};

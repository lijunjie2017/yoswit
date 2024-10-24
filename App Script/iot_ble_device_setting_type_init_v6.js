window.iot_ble_device_setting_type_init = (type, value, guid, oldGuid) => {
  //init the device setting type and command
  const device_setting_type = {
    'Set Time': {
      'type': '2', //1 write directly  2 need converted
      'command': '',
    },
    'Mesh Retry Times': {},
    'Power-Up Status': {},
    'Physical Switch Lock': {},
    'PVI Enable': {},
    'LED Mode': {},
    'Delay / Last for': {},
    'Device Pairing': {},
    'Virtual Device Pairing': {},
    'Wifi SSID': {},
    'Wifi Password': {},
    'Email Address': {},
    'Server URI': {},
    'Server Port': {},
    'Server Username': {},
    'Server Password': {},
    'fan_speed': {},
    'mode_selection': {},
    'temperature_sensor': {},
    'temperature_offset': {},
    'fan_speed_in_auto_mode_in_dead_band': {},
    'occ': {},
    'cooling_setpoint_unoccupied': {},
    'heating_setpoint_unoccupied': {},
    'fan_mode_when_unoccupied': {},
    'setpoint_limit_lower': {},
    'setpoint_limit_upper': {},
    'frost_protection': {},
    'frost_protection_setpoint': {},
    'restart_after_power_failure': {},
    'backlight_off': {},
    'keypad_lock_after_backlight_off': {},
    'backlight_brightness': {},
    'screen_lights_up_on_command': {},
    'humidity_offset': {},
    'setpoint_limit_lower_heat': {},
    'setpoint_limit_upper_heat': {},
    'Sensitivity': {},
    'Trigger Speed': {},
    'Unmanned Duration': {},
    'X1': {},
    'X2': {},
    'Y1': {},
    'Z1': {},
    'Z2': {},
    'Phase-Cut Mode': {},
    'Dimming Mode': {},
    'Per Press Brightness': {},
    'Minimum Trim': {},
    'Buzzer': {},
    'Maximum': {},
    'Manual Dim Steps': {},
    'Delay Lastfor': {},
  };
  let commandList = [];

  let thermostat_type_list = [
    'fan_speed',
    'mode_selection',
    'temperature_sensor',
    'temperature_offset',
    'humidity_offset',
    'fan_speed_in_auto_mode_in_dead_band',
    'occ',
    'cooling_setpoint_unoccupied',
    'heating_setpoint_unoccupied',
    'fan_mode_when_unoccupied',
    'setpoint_limit_lower',
    'setpoint_limit_upper',
    'frost_protection',
    'frost_protection_setpoint',
    'restart_after_power_failure',
    'backlight_off',
    'keypad_lock_after_backlight_off',
    'backlight_brightness',
    'screen_lights_up_on_command',
    'setpoint_limit_lower_heat',
    'setpoint_limit_upper_heat',
  ];
  let thermostat_write_status = false;

  //defind differ setting function

  const get_device_info = (guid) => {
    //should get the device model,mode,button_group
    let deviceMap = {};
    let p = window.peripheral[guid].prop;
    let hexModel = p.hexModel;
    let erpModelMap = erp.doctype.device_model;
    //check if no initialize
    if (hexModel == '011A' || !erpModelMap[hexModel]) {
      app.dialog.alert(_('Sorry, the device has not been initialized.'));
      return;
    }
    let device_model = erpModelMap[hexModel].model_code;
    let device_mode = erpModelMap[hexModel].mode;
    let obj = {
      device_model: device_model,
      device_mode: device_mode,
    };
    return obj;
  };

  const reverseStringByLittleEndian = (hexString) => {
    let swapped = '';
    for (var i = hexString.length - 2; i >= 0; i -= 2) {
      swapped += hexString.substr(i, 2);
    }
    return swapped;
  };

  const toLittleEndianHexString = (num, byteCount) => {
    const byteArray = [];
    for (let i = 0; i < byteCount; i++) {
      byteArray.push(num & 0xff);
      num = num >> 8;
    }
    const hexString = byteArray.map((byte) => ('0' + byte.toString(16)).slice(-2)).join('');
    return hexString;
  };
  const get_set_time_command = () => {
    let data = '840001';
    const date = new Date();
    data += date.getSeconds().toString(16).pad('00');
    data += date.getMinutes().toString(16).pad('00');
    data += date.getHours().toString(16).pad('00');
    data += date.getDate().toString(16).pad('00');
    data += (date.getMonth() + 1).toString(16).pad('00');
    const hexYear = date.getFullYear().toString(16).pad('0000');
    const yearHigh = hexYear.substring(0, 2);
    const yearLow = hexYear.substring(2);
    data += yearLow + yearHigh;

    return data;
  };

  const get_mesh_retry_times = (value) => {
    let command = `9361000001${parseInt(value).toString(16).pad('00')}`;
    return command;
  };

  const get_power_up_status = (value) => {
    let deviceMap = get_device_info(guid);
    let data = '810B';
    if (deviceMap.device_mode == 'Triac Dimming' || deviceMap.device_mode == '1-10v Dimming' || deviceMap.device_mode == '0-10v Dimming') {
      data = '8908';
    }
    let gang = parseInt('11110', 2).toString(16).pad('00');
    //this have bug,this case should be lock 1 gang
    if (deviceMap.device_mode == 'On Off Switch' || deviceMap.device_mode == 'Multiway Switch' || deviceMap.device_mode == 'On Off IR') {
      const g = 1;
      gang = parseInt('1'.padEnd(g + 1, '0'), 2)
        .toString(16)
        .pad('00');
    } else {
      gang = 'ffffffff';
    }
    data += gang;
    if (value == 'Off') {
      data += '00';
    }
    if (
      value == 'Off' &&
      (deviceMap.device_mode == 'Triac Dimming' || deviceMap.device_mode == '1-10v Dimming' || deviceMap.device_mode == '0-10v Dimming')
    ) {
      data = '890800000000';
    }
    return data;
  };

  const get_physical_switch_lock = (value) => {
    let deviceMap = get_device_info(guid);
    let data = '8111';
    let gang = 'FF';
    const g = 1;
    gang = parseInt('1'.padEnd(g + 1, '0'), 2)
      .toString(16)
      .pad('00');
    data += gang;
    if (value == 'Off') {
      data += '00';
    }
    return data;
  };

  const get_pvi_enable = (value) => {
    let deviceMap = get_device_info(guid);
    let data = '8102';
    if (value == 'Off') {
      data += '01';
    } else {
      data += '00';
    }
    return data;
  };

  const get_led_mode = (value) => {
    const commandMap = {
      'Reverse': '810A02',
      'Always On': '810A00',
      'Always Off': '810A01',
      'Sync': '810A03',
    };
    let data = commandMap[value];
    return data;
  };

  const get_delay_lastfor = (value) => {
    //first should be get the button group
    let valueMap = JSON.parse(value);
    let button_group = valueMap.button_group;
    //{"button_group":"ONOFF GANG1","Run for (s)":"0","Delay Mode":"Off Only","Delay for (s)":"0"}
    let runfor = valueMap['Run for (s)'];
    let delay_mode = valueMap['Delay Mode'];
    let delay_for = valueMap['Delay for (s)'];
    let data = '810301';
    let gang = parseInt('1111', 2).toString(16).pad('00');
    if (button_group.startsWith('ONOFF GANG')) {
      const g = button_group.replace('ONOFF GANG', '') * 1;

      gang = parseInt('1'.padEnd(g, '0'), 2).toString(16).pad('00');
    } else if (button_group.startsWith('OPENCLOSE GANG')) {
      const g = button_group.replace('OPENCLOSE GANG', '');
      if (g === '1_2') {
        gang = parseInt('0011', 2).toString(16).pad('00');
      } else if (g === '3_4') {
        gang = parseInt('1100', 2).toString(16).pad('00');
      }
    }
    data += gang;
    // dalay on / off
    const delayLittleEndian = toLittleEndianHexString(parseInt(delay_for), 2);
    switch (delay_mode) {
      case 'On and Off':
        data += delayLittleEndian + delayLittleEndian;
        break;
      case 'On Only':
        data += delayLittleEndian + toLittleEndianHexString(0, 2);
        break;
      case 'Off Only':
        data += toLittleEndianHexString(0, 2) + delayLittleEndian;
        break;
    }

    // run for on
    const runLittleEndian = toLittleEndianHexString(parseInt(runfor), 2);
    data += runLittleEndian;

    // run for off
    data += toLittleEndianHexString(0, 2);

    return data;
  };

  //'Wifi SSID': {},'Wifi Password': {},
  const get_wifi_server_post = (type, value) => {
    //confirm the android open the requestMtu
    let data = ``;
    if (type == 'Wifi SSID') {
      let ssid_data = '932000' + value.length.toString(16).pad('0000') + value.convertToHex();
      data = ssid_data;
    } else if (type == 'Wifi Password') {
      let ssid_password_data = '932100' + value.length.toString(16).pad('0000') + value.convertToHex();
      data = ssid_password_data;
    } else if (type == 'Email Address') {
      let email_data = '932200' + value.toLowerCase().length.toString(16).pad('0000') + value.toLowerCase().convertToHex();
      data = email_data;
    } else if (type == 'Server Port') {
      let port_data = '9301000002' + (value * 1).toString(16).pad('0000');
      data = port_data;
    } else if (type == 'Server URI') {
      let server_url_data = '930000' + value.length.toString(16).pad('0000') + value.convertToHex();
      data = server_url_data;
    }
    return data;
  };

  const get_thermostat_command = (type) => {
    //this function must be check all the thermostat setting,input one value,then return all the command
    let target_type_num = 21; // depend on this value to check if all thermostat setting
    //this config record the thermostat mapping value
    const thermostatConfig = {
      'fan_speed': {
        'Disable': 0,
        '1 Speed': 1,
        '2 Speed': 2,
        '3 Speed': 3,
      },
      'mode_selection': {
        'Cooling and Heating': 0,
        'Heating': 1,
        'Cooling': 2,
      },
      'temperature_sensor': {
        'Internal': 0,
        'External': 1,
      },
      'temperature_offset': {
        'Default': 0,
      },
      'humidity_offset': {
        'Default': 1,
      },
      'fan_speed_in_auto_mode_in_dead_band': {
        'Fan Off': 0,
        '1 Speed': 1,
      },
      'occ': {
        'Disable': 0,
        'Close fan and valve when unoccupied (Open circuit without occupancy)': 1,
        'Close fan and valve when unoccupied (Open circuit with occupancy)': 2,
        'Switch to unoccupied mode (Open circuit without occupancy)': 3,
        'Switch to unoccupied mode (Open circuit with occupancy)': 4,
        'Open circuit indicates dew point alarm': 5,
        'Short circuit indicates dew point alarm': 6,
        'Open circuit indicates filter alarm': 7,
        'Short circuit indicates filter alarm': 8,
      },
      'cooling_setpoint_unoccupied': {
        'Default': 26,
      },
      'heating_setpoint_unoccupied': {
        'Default': 18,
      },
      'fan_mode_when_unoccupied': {
        'User': 0,
        '1 Speed': 1,
      },
      'setpoint_limit_lower': {
        'Default': 5,
      },
      'setpoint_limit_upper': {
        'Default': 35,
      },
      'frost_protection': {
        'On': 0,
        'Off': 1,
      },
      'frost_protection_setpoint': {
        'Default': 5,
      },
      'restart_after_power_failure': {
        'On': 0,
        'Off': 1,
        'Restore': 2,
      },
      'backlight_off': {
        'Default': 30,
      },
      'keypad_lock_after_backlight_off': {
        'On': 0,
        'Off': 1,
      },
      'backlight_brightness': {
        'Default': 100,
      },
      'screen_lights_up_on_command': {
        'On': 0,
        'Off': 1,
      },
      'setpoint_limit_lower_heat': {
        'Default': 10,
      },
      'setpoint_limit_upper_heat': {
        'Default': 35,
      },
    };
    //get the old device setting
    let device_settings = erp.info.device[oldGuid].settings;
    let thermostatMap = {};
    device_settings.forEach((item) => {
      if (thermostat_type_list.indexOf(item.setting_type) != -1) {
        //some type have default value
        let default_value_list = [
          'cooling_setpoint_unoccupied',
          'heating_setpoint_unoccupied',
          'setpoint_limit_lower',
          'setpoint_limit_upper',
          'frost_protection_setpoint',
          'backlight_off',
          'backlight_brightness',
          'setpoint_limit_lower_heat',
          'setpoint_limit_upper_heat',
          'humidity_offset',
          'temperature_offset',
        ];
        if (default_value_list.indexOf(item.setting_type) != -1) {
          if (isset(item.setting)) {
            thermostatMap[item.setting_type] = item.setting;
          } else {
            thermostatMap[item.setting_type] = 1;
          }
        } else {
          thermostatMap[item.setting_type] = thermostatConfig[item.setting_type][item.setting];
        }
      }
    });
    let data = '9402000013';
    if (window.peripheral && isset(window.peripheral[guid])) {
      if (window.peripheral[guid].prop.firmware >= 12.3) {
        data = '9402000015';
      }
    }
    data += parseInt(`${thermostatMap['fan_speed']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['mode_selection']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['temperature_sensor']}`).toString(16).pad('00');
    if (thermostatMap['temperature_offset'] < 0) {
      const unsignedInt = thermostatMap['temperature_offset'] & 0xff;
      data += unsignedInt.toString(16).pad('00');
    } else {
      data += thermostatMap['temperature_offset'].toString(16).pad('00');
    }
    data += parseInt(`${thermostatMap['fan_speed_in_auto_mode_in_dead_band']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['occ']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['cooling_setpoint_unoccupied']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['heating_setpoint_unoccupied']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['fan_mode_when_unoccupied']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['setpoint_limit_lower']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['setpoint_limit_upper']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['frost_protection']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['frost_protection_setpoint']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['restart_after_power_failure']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['backlight_off']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['keypad_lock_after_backlight_off']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['backlight_brightness']}`).toString(16).pad('00');
    data += `01`;
    if (thermostatMap['humidity_offset'] < 0) {
      const unsignedInt = thermostatMap['humidity_offset'] & 0xff;
      data += unsignedInt.toString(16).pad('00');
    } else {
      data += thermostatMap['humidity_offset'].toString(16).pad('00');
    }
    data += parseInt(`${thermostatMap['setpoint_limit_lower_heat']}`).toString(16).pad('00');
    data += parseInt(`${thermostatMap['setpoint_limit_upper_heat']}`).toString(16).pad('00');
    return data;
  };

  const get_sensitivity_command = (value) => {
    let data = '';
    let pre_command = `9525000001`;
    if (value == 'High') {
      data = pre_command + '0c';
    } else if (value == 'Medium') {
      data = pre_command + '0b';
    } else if (value == 'Low') {
      data = pre_command + '0a';
    }
    return data;
  };

  const get_trigger_speed_command = (value) => {
    let data = '';
    let pre_command = `9526000001`;
    if (value === 'Fast') {
      data = pre_command + '10';
    } else if (value === 'Medium') {
      data = pre_command + '0f';
    } else if (value === 'Slow') {
      data = pre_command + '0e';
    }
    return data;
  };

  const get_unmanned_duration = (value) => {
    const data = '9527000004' + iot_utils_to_little_endian_hex(parseInt(value), 4);
    return data;
  };

  const get_x_y_command = () => {
    //should find the x1,x2,y1,y2,z1,z2,then return the command
    let target_list = ['X1', 'X2', 'Y1', 'Y2'];
    let device_settings = erp.info.device[oldGuid].settings;
    let x_y_map = {
      'X1': '-3',
      'X2': '3',
      'Y1': '-3',
      'Y2': '3',
    };
    device_settings.forEach((item) => {
      if (target_list.indexOf(item.setting_type) != -1) {
        x_y_map[item.setting_type] = item.setting;
      }
    });
    let pre_command = `95280000`;
    let ble_x1 = `${parseInt(x_y_map['X1']) == 0 ? '00000000' : core_utils_float_ieee_convert(x_y_map['X1'])}`;
    let ble_x2 = `${parseInt(x_y_map['X2']) == 0 ? '00000000' : core_utils_float_ieee_convert(x_y_map['X2'])}`;
    let ble_y1 = `${parseInt(x_y_map['Y1']) == 0 ? '00000000' : core_utils_float_ieee_convert(x_y_map['Y1'])}`;
    let ble_y2 = `${parseInt(x_y_map['Y2']) == 0 ? '00000000' : core_utils_float_ieee_convert(x_y_map['Y2'])}`;
    let $length = `04${ble_x1}${ble_x2}${ble_y1}${ble_y2}`.length / 2;
    let data = `${pre_command}${$length.toString(16).pad('00')}04${ble_x1}${ble_x2}${ble_y1}${ble_y2}`;
    return data;
  };

  const get_z_command = () => {
    let z_map = {
      'Z1': '0.5',
      'Z2': '2.5',
    };
    let device_settings = erp.info.device[oldGuid].settings;
    device_settings.forEach((item) => {
      if (item.setting_type == 'Z1' || item.setting_type == 'Z2') {
        z_map[item.setting_type] = item.setting;
      }
    });

    let ble_z1 = `${parseInt(z_map['Z1']) == 0 ? '00000000' : core_utils_float_ieee_convert(z_map['Z1'])}`;
    let ble_z2 = `${parseInt(z_map['Z2']) == 0 ? '00000000' : core_utils_float_ieee_convert(z_map['Z2'])}`;
    let $z_length = `${ble_z1}${ble_z2}`.length / 2;
    let z_data = `95290000${$z_length.toString(16).pad('00')}${ble_z1}${ble_z2}`;
    return z_data;
  };

  const get_phase_cut_mode_command = (value) => {
    const phase_cut_map = {
      'Trailing Edge': '890A01',
      'Leading Edge': '890A00',
    };
    let data = phase_cut_map[value];
    return data;
  };

  const get_wiring_mode_command = (value) => {
    const wiriing_mode_map = {
      'Without Neutral': '890B00',
      'With Neutral': '890B01',
    };

    let data = wiriing_mode_map[value];

    return data;
  };

  const get_dimming_mode_command = (value) => {
    const dimming_mode_map = {
      '0-10v Dimming': '890702',
      '1-10v Dimming': '890703',
    };
    let data = dimming_mode_map[value];
    return data;
  };

  const get_per_press_brightness_command = (value) => {
    const data = `8909${value.toString(16).pad('00')}${value.toString(16).pad('00')}`;
    return data;
  };

  const get_minimum_command = (value) => {
    const valueList = [13, 19, 25, 31, 37, 43, 49, 55, 61];
    let postValue = valueList[parseInt(value) - 1];
    let data = '8905' + parseInt(postValue).toString(16).pad('00') + parseInt(postValue).toString(16).pad('00');
    return data;
  };

  const get_buzzer_command = (value) => {
    const buzzer_map = {
      'Disable': '890D00',
      'Door Open': '890D01',
      'Door Close': '890D02',
    };
    const data = buzzer_map[value];
    return data;
  };

  const get_time_interval_command = (value) => {
    const t = parseInt(value);
    const data = '9355000002' + t.toString(16).pad('0000');
    return data;
  };

  const get_virtual_device_pairing_command = (value) => {
    //ONOFF GANG1|70b950856d06
    //should find the profile config
    let subdevices = cloneDeep(erp.info.profile.profile_subdevice);
    let configList = [];
    subdevices.forEach((item) => {
      if (item.device == oldGuid) {
        if (item.config) {
          let configMap = JSON.parse(item.config);
          configMap['button_group'] = item.device_button_group;
          configList.push(configMap);
        }
      }
    });
    let command_list = [];
    configList.forEach((item) => {
      let virtual_name = item.virtual;
      let button_group = item.button_group;
      let device_hex_model = peripheral[guid].getProp().hexModel.toUpperCase();
      let device_model = erp.doctype.device_model[device_hex_model].name;

      subdevices.forEach((kitem) => {
        if (kitem.name == virtual_name) {
          let target_button_group = kitem.device_button_group;
          let this_guid = kitem.device;
          let mac_address = core_utils_get_mac_address_from_guid(this_guid);
          let data = '8108';
          let data_2 = '';
          let data_3 = ''; //pause curtain switch
          let gang = '01';
          if (button_group.startsWith('ONOFF GANG')) {
            let g = button_group.replace('ONOFF GANG', '') * 1;
            if (device_model == 'YO845m' || device_model == 'YO843m' || device_model == 'YO2086s-2GM') {
              if (g > 1) {
                g = g - 1;
              }
            }
            gang = g.toString(16).pad('00');
          } else if (button_group.startsWith('DIMMING')) {
            gang = '05';
          } else if (button_group.startsWith('OPENCLOSE GANG')) {
            let curtain_gang = button_group.replace('OPENCLOSE GANG', '');
            data_3 = '81080520';
            if (curtain_gang == '1_2') {
              gang = '01';
              data_2 = `810802`;
            } else if (curtain_gang == '3_4') {
              gang = '03';
              data_2 = `810804`;
            }
          }
          data += gang;
          let head = '02'; // FF
          if (target_button_group.startsWith('DIMMING')) {
            head = '';
            data += '20';
          } else if (target_button_group.startsWith('OPENCLOSE GANG')) {
            head = '';
            data += '20';
            data_2 += '20';
          }

          data += head;
          data += reverseStringByLittleEndian(mac_address.replace(/:/g, ''));
          if (data_2) {
            data_2 += reverseStringByLittleEndian(mac_address.replace(/:/g, ''));
          }
          if (data_3) {
            data_3 += reverseStringByLittleEndian(mac_address.replace(/:/g, ''));
          }
          if (target_button_group.startsWith('DIMMING')) {
            data += '2000';
          } else if (target_button_group.startsWith('OPENCLOSE GANG')) {
            let target_gang = target_button_group.replace('OPENCLOSE GANG', '');
            data_3 += `2000`;
            if (target_gang == '1_2') {
              data += '0200';
              data_2 += `0400`;
            } else if (target_gang == '3_4') {
              data += '0800';
              data_2 += `1000`;
            }
          } else {
            data += '00';
            let target_gang = '01';
            if (target_button_group.startsWith('ONOFF GANG')) {
              const g = target_button_group.replace('ONOFF GANG', '') * 1;
              target_gang = g.toString(16).pad('00');
            }

            data += target_gang;
            data += '00';
          }
          command_list.push({
            button_group : button_group,
            command : data
          });
        }
      });
    });
    console.log('command_list', command_list);
    return command_list;
  };

  switch (type) {
    case 'Set Time':
      let command = get_set_time_command();
      commandList.push({
        command: command,
        title: type,
        value: value,
      });
      break;
    case 'Mesh Retry Times':
      commandList.push({
        command: get_mesh_retry_times(value),
        title: type,
        value: value,
      });
      break;
    case 'Power-Up Status':
      commandList.push({
        command: get_power_up_status(value),
        title: type,
        value: value,
      });
      break;
    case 'Physical Switch Lock':
      commandList.push({
        command: get_physical_switch_lock(value),
        title: type,
        value: value,
      });
      break;
    case 'PVI Enable':
      commandList.push({
        command: get_pvi_enable(value),
        title: type,
        value: value,
      });
      break;
    case 'LED Mode':
      commandList.push({
        command: get_led_mode(value),
        title: type,
        value: value,
      });
      break;
    case 'Wifi SSID':
      commandList.push({
        command: get_wifi_server_post(type, value),
        title: type,
        value: value,
      });
      break;
    case 'Wifi Password':
      commandList.push({
        command: get_wifi_server_post(type, value),
        title: type,
        value: value,
      });
      break;
    case 'Email Address':
      commandList.push({
        command: get_wifi_server_post(type, value),
        title: type,
        value: value,
      });
      break;
    case 'Server Port':
      commandList.push({
        command: get_wifi_server_post(type, value),
        title: type,
        value: value,
      });
      break;
    case 'Server URI':
      commandList.push({
        command: get_wifi_server_post(type, value),
        title: type,
        value: value,
      });
      break;
    case 'Sensitivity':
      commandList.push({
        command: get_sensitivity_command(value),
        title: type,
        value: value,
      });
      break;
    case 'Trigger Speed':
      commandList.push({
        command: get_trigger_speed_command(value),
        title: type,
        value: value,
      });
      break;
    case 'Unmanned Duration':
      commandList.push({
        command: get_unmanned_duration(value),
        title: type,
        value: value,
      });
      break;
    case 'X1':
      commandList.push({
        command: get_x_y_command(value),
        title: `X1,X2,Y1,Y2`,
        value: '',
      });
      break;
    case 'Z1':
      commandList.push({
        command: get_z_command(value),
        title: `Z1,Z2`,
        value: '',
      });
      break;
    case 'Phase-Cut Mode':
      commandList.push({
        command: get_phase_cut_mode_command(value),
        title: type,
        value: value,
      });
      break;
    case 'Wiring Mode':
      commandList.push({
        command: get_wiring_mode_command(value),
        title: type,
        value: value,
      });
      break;
    case 'Dimming Mode':
      commandList.push({
        command: get_dimming_mode_command(value),
        title: type,
        value: value,
      });
      break;
    case 'Virtual Device Pairing':
      let list = get_virtual_device_pairing_command(value);
      list.forEach(item=>{
        commandList.push({
          command : item.command,
          title: type,
          value : item.button_group
        });
        if(item.button_group.startsWith("ONOFF GANG")){
          commandList.push({
            command : `8111${parseInt("1".padEnd((item.button_group.replace("ONOFF GANG", "") * 1) + 1, "0"), 2).toString(16).pad("00")}`,
            title: 'Physical Switch Lock',
            value : item.button_group
          });
        }
      })
      break;
    default:
      if (type.includes('Delay Lastfor')) {
        commandList.push({
          command: get_delay_lastfor(value),
          title: `Delay Lastfor`,
          value: '3 item',
        });
      }
      if (thermostat_type_list.indexOf(type) != -1 && !thermostat_write_status) {
        commandList.push({
          command: get_thermostat_command(value),
          title: type,
          value: value,
        });
      }
      break;
  }
  console.log('commandList', commandList);
  return commandList;
};

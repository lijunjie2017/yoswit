window.iot_device_thermostat_fan_speed_picker = {};
window.iot_device_thermostat_mode_selection_picker = {};
window.iot_device_thermostat_temperature_sensor_picker = {};
window.iot_device_thermostat_temperature_offset_picker = {};
window.iot_device_thermostat_dead_band_picker = {};
window.iot_device_thermostat_cooling_setpoint_unoccupied_slider = {};
window.iot_device_thermostat_heating_setpoint_unoccupied_slider = {};
window.iot_device_thermostat_unoccupied_fan_mode_picker = {};
window.iot_device_thermostat_setpoint_limit_lower_slider = {};
window.iot_device_thermostat_setpoint_limit_upper_slider = {};
window.iot_device_thermostat_frost_protection_picker = {};
window.iot_device_thermostat_frost_protection_setpoint_slider = {};
window.iot_device_thermostat_restart_after_power_failure_picker = {};
window.iot_device_thermostat_keypad_lock_after_backlight_off_picker = {};
window.iot_device_thermostat_screen_lights_up_picker = {};
window.iot_device_thermostat_set_lower_tem = 5;
window.iot_device_thermostat_set_upper_tem = 35;
window.iot_device_thermostat_set_lower_tem_heat = 10;
window.iot_device_thermostat_set_upper_tem_heat = 35;
// window.iot_device_thermostat_push_mqtt_picker = {};
window.iot_device_thermostat_humidity_offset_picker = {};
window.iot_device_thermostat_form_init = function (json) {
  const TAG = '>>>> iot_device_thermostat_form_init';

  if (!json) return;

  app.preloader.show();

  // setting options
  const fan_speed_options = ['Disable', '1 Speed', '2 Speed', '3 Speed'];
  const fan_speed_default = fan_speed_options[3];

  const mode_selection_options = ['Cooling and Heating', 'Heating', 'Cooling'];
  const mode_selection_default = mode_selection_options[0];

  const temperature_sensor_options = ['Internal', 'External'];
  const temperature_sensor_default = temperature_sensor_options[0];

  const temperature_offset_default = 0;

  const dead_band_options = ['Fan Off', '1 Speed'];
  const dead_band_default = dead_band_options[1];

  const occ_options = [
    'Disable',
    'Close fan and valve when unoccupied (Open circuit without occupancy)',
    'Close fan and valve when unoccupied (Open circuit with occupancy)',
    'Switch to unoccupied mode (Open circuit without occupancy)',
    'Switch to unoccupied mode (Open circuit with occupancy)',
    'Open circuit indicates dew point alarm',
    'Short circuit indicates dew point alarm',
    'Open circuit indicates filter alarm',
    'Short circuit indicates filter alarm',
  ];
  const occ_default = occ_options[4];

  const cooling_setpoint_unoccupied_default = 26;

  const heating_setpoint_unoccupied_default = 18;

  const unoccupied_fan_mode_options = ['User', '1 Speed'];
  const unoccupied_fan_mode_default = unoccupied_fan_mode_options[1];

  const setpoint_limit_lower_default = 5;

  const setpoint_limit_upper_default = 35;

  const setpoint_limit_lower_heat_default = 10;

  const setpoint_limit_upper_heat_default = 35;

  const frost_protection_options = ['On', 'Off'];
  const frost_protection_default = frost_protection_options[0];

  const frost_protection_setpoint_default = 5;

  const restart_after_power_failure_options = ['On', 'Off', 'Restore'];
  const restart_after_power_failure_default = restart_after_power_failure_options[2];

  const keypad_lock_after_backlight_off_options = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
  const keypad_lock_after_backlight_off_default = 100;

  const screen_lights_up_options = ['On', 'Off'];
  const screen_lights_up_default = screen_lights_up_options[0];

  const push_mqtt_options = ['On', 'Off'];
  const push_mqtt_default = push_mqtt_options[0];

  let default_data = {
    fan_speed: fan_speed_default,
    mode_selection: mode_selection_default,
    temperature_sensor: temperature_sensor_default,
    temperature_offset: temperature_offset_default,
    fan_speed_in_auto_mode_in_dead_band: dead_band_default,
    occ: occ_default,
    cooling_setpoint_unoccupied: cooling_setpoint_unoccupied_default,
    heating_setpoint_unoccupied: heating_setpoint_unoccupied_default,
    fan_mode_when_unoccupied: unoccupied_fan_mode_default,
    setpoint_limit_lower: setpoint_limit_lower_default,
    setpoint_limit_upper: setpoint_limit_upper_default,
    setpoint_limit_lower_heat: setpoint_limit_lower_heat_default,
    setpoint_limit_upper_heat: setpoint_limit_upper_heat_default,
    frost_protection: frost_protection_default,
    frost_protection_setpoint: frost_protection_setpoint_default,
    restart_after_power_failure: restart_after_power_failure_default,
    backlight_off: 30,
    keypad_lock_after_backlight_off: keypad_lock_after_backlight_off_default,
    backlight_brightness: 100,
    screen_lights_up_on_command: screen_lights_up_default,
    // push_mqtt_message_after_state_change: push_mqtt_default,
    humidity_offset: 1,
  };

  try {
    const device = JSON.parse(json);

    for (let i = 0; i < device.settings.length; i++) {
      const st = device.settings[i];
      default_data[st.setting_type] = st.setting;
    }
    iot_device_thermostat_set_lower_tem = default_data.setpoint_limit_lower;
    iot_device_thermostat_set_upper_tem = default_data.setpoint_limit_upper;
  } catch (err) {
    // ignore
  }

  window.iot_device_thermostat_fan_speed_picker = app.picker.create({
    inputEl: '#thermostat-fan-speed-picker',
    cols: [
      {
        textAlign: 'center',
        values: fan_speed_options,
        displayValues: fan_speed_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_mode_selection_picker = app.picker.create({
    inputEl: '#thermostat-mode-selection-picker',
    cols: [
      {
        textAlign: 'center',
        values: mode_selection_options,
        displayValues: mode_selection_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_temperature_sensor_picker = app.picker.create({
    inputEl: '#thermostat-temperature-sensor-picker',
    cols: [
      {
        textAlign: 'center',
        values: temperature_sensor_options,
        displayValues: temperature_sensor_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_temperature_offset_picker = app.picker.create({
    inputEl: '#thermostat-temperature-offset-picker',
    cols: [
      {
        textAlign: 'center',
        values: (function () {
          var arr = [];
          for (var i = -5; i <= 5; i++) {
            arr.push(i);
          }
          return arr;
        })(),
        displayValues: (function () {
          var arr = [];
          for (var i = -5; i <= 5; i++) {
            arr.push(i + '℃');
          }
          return arr;
        })(),
      },
    ],
  });

  window.iot_device_thermostat_dead_band_picker = app.picker.create({
    inputEl: '#thermostat-dead-band-picker',
    cols: [
      {
        textAlign: 'center',
        values: dead_band_options,
        displayValues: dead_band_options.map((e) => _(e)),
      },
    ],
  });

  // <option value="Disable">{{ _("Disable") }}</option>
  $('#thermostat-occ').html(occ_options.map((e, i) => `<option value="${e}" ${i === 0 ? 'selected' : ''}>${_(e)}</option>`).join(''));

  window.iot_device_thermostat_cooling_setpoint_unoccupied_slider = app.range.create({
    el: '#thermostat-cooling-setpoint-unoccupied-slider',
    min: 22,
    max: 32,
    step: 1,
    scale: true,
    label: true,
    scaleSteps: 1,
    scaleSubSteps: 5,
    formatScaleLabel: (v) => {
      if (v === 22 || v === 32) {
        return v + '℃';
      } else {
        return v;
      }
    },
    formatLabel: (v) => {
      return v + '℃';
    },
    // on: {
    //     change: (range) => {
    //         const form = app.form.convertToData("#frappe-form");
    //         const max = parseInt(form.setpoint_limit_upper);
    //         const min = parseInt(form.setpoint_limit_lower);
    //         const cur = range.getValue();
    //         if (cur < min) {
    //             range.setValue(min);
    //         } else if (cur > max) {
    //             range.setValue(max);
    //         }
    //     }
    // }
  });

  window.iot_device_thermostat_heating_setpoint_unoccupied_slider = app.range.create({
    el: '#thermostat-heating-setpoint-unoccupied-slider',
    min: 10,
    max: 21,
    step: 1,
    scale: true,
    label: true,
    scaleSteps: 1,
    scaleSubSteps: 5,
    formatScaleLabel: (v) => {
      if (v === 10 || v === 21) {
        return v + '℃';
      } else {
        return v;
      }
    },
    formatLabel: (v) => {
      return v + '℃';
    },
    // on: {
    //     change: (range) => {
    //         const form = app.form.convertToData("#frappe-form");
    //         const max = parseInt(form.setpoint_limit_upper);
    //         const min = parseInt(form.setpoint_limit_lower);
    //         const cur = range.getValue();
    //         if (cur < min) {
    //             range.setValue(min);
    //         } else if (cur > max) {
    //             range.setValue(max);
    //         }
    //     }
    // }
  });

  window.iot_device_thermostat_unoccupied_fan_mode_picker = app.picker.create({
    inputEl: '#thermostat-unoccupied-fan-mode-picker',
    cols: [
      {
        textAlign: 'center',
        values: unoccupied_fan_mode_options,
        displayValues: unoccupied_fan_mode_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_setpoint_limit_lower_slider = app.range.create({
    el: '#thermostat-setpoint-limit-lower-slider',
    min: 1,
    max: 35,
    step: 1,
    dual: true,
    scale: true,
    label: true,
    scaleSteps: 1,
    scaleSubSteps: 5,
    formatScaleLabel: (v) => {
      if (v === 0 || v === 38) {
        return v + '℃';
      } else {
        return v;
      }
    },
    formatLabel: (v) => {
      return v + '℃';
    },
    on: {
      change: (range) => {
        let rangeList = range.getValue();
        const lower = rangeList[0];
        const upper = rangeList[1];
        window.iot_device_thermostat_set_lower_tem = lower;
        window.iot_device_thermostat_set_upper_tem = upper;
        if (lower >= upper) {
          range.setValue([upper - 3, upper]);
          window.iot_device_thermostat_set_lower_tem = upper - 3;
          window.iot_device_thermostat_set_upper_tem = upper;
        }
      },
    },
  });

  window.iot_device_thermostat_setpoint_limit_upper_slider = app.range.create({
    el: '#thermostat-setpoint-limit-upper-slider',
    min: 3,
    max: 40,
    step: 1,
    dual: true,
    scale: true,
    label: true,
    scaleSteps: 1,
    scaleSubSteps: 5,
    formatScaleLabel: (v) => {
      if (v === 2 || v === 40) {
        return v + '℃';
      } else {
        return v;
      }
    },
    formatLabel: (v) => {
      return v + '℃';
    },
    on: {
      change: (range) => {
        let rangeList = range.getValue();
        const lower = rangeList[0];
        const upper = rangeList[1];
        window.iot_device_thermostat_set_lower_tem_heat = lower;
        window.iot_device_thermostat_set_upper_tem_heat = upper;
        if (lower >= upper) {
          range.setValue([upper - 3, upper]);
          window.iot_device_thermostat_set_lower_tem_heat = upper - 3;
          window.iot_device_thermostat_set_upper_tem_heat = upper;
        }

        // if (upper <= lower) {
        //   range.setValue(lower + 1);
        // }
      },
    },
  });

  window.iot_device_thermostat_frost_protection_picker = app.picker.create({
    inputEl: '#thermostat-frost-protection-picker',
    cols: [
      {
        textAlign: 'center',
        values: frost_protection_options,
        displayValues: frost_protection_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_frost_protection_setpoint_slider = app.range.create({
    el: '#thermostat-frost-protection-setpoint-slider',
    min: 1,
    max: 20,
    step: 1,
    scale: true,
    label: true,
    scaleSteps: 1,
    scaleSubSteps: 5,
    formatScaleLabel: (v) => {
      if (v === 1 || v === 20) {
        return v + '℃';
      } else {
        return v;
      }
    },
    formatLabel: (v) => {
      return v + '℃';
    },
  });

  window.iot_device_thermostat_restart_after_power_failure_picker = app.picker.create({
    inputEl: '#thermostat-restart-after-power-failure-picker',
    cols: [
      {
        textAlign: 'center',
        values: restart_after_power_failure_options,
        displayValues: restart_after_power_failure_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_keypad_lock_after_backlight_off_picker = app.picker.create({
    inputEl: '#thermostat-keypad-lock-after-backlight-off-picker',
    cols: [
      {
        textAlign: 'center',
        values: keypad_lock_after_backlight_off_options,
        displayValues: keypad_lock_after_backlight_off_options.map((e) => _(e)),
      },
    ],
  });

  window.iot_device_thermostat_screen_lights_up_picker = app.picker.create({
    inputEl: '#thermostat-screen-lights-up-picker',
    cols: [
      {
        textAlign: 'center',
        values: screen_lights_up_options,
        displayValues: screen_lights_up_options.map((e) => _(e)),
      },
    ],
  });

  //   window.iot_device_thermostat_push_mqtt_picker = app.picker.create({
  //     inputEl: '#thermostat-push-mqtt-picker',
  //     cols: [
  //       {
  //         textAlign: 'center',
  //         values: push_mqtt_options,
  //         displayValues: push_mqtt_options.map((e) => _(e)),
  //       },
  //     ],
  //   });

  window.iot_device_thermostat_humidity_offset_picker = app.picker.create({
    inputEl: '#thermostat-humidity-offset-picker',
    cols: [
      {
        textAlign: 'center',
        values: (function () {
          var arr = [];
          for (var i = -10; i <= 10; i++) {
            arr.push(i);
          }
          return arr;
        })(),
        displayValues: (function () {
          var arr = [];
          for (var i = -10; i <= 10; i++) {
            arr.push(i + '');
          }
          return arr;
        })(),
      },
    ],
  });

  app.form.fillFromData('#frappe-form', default_data);

  // range value must use api update
  iot_device_thermostat_cooling_setpoint_unoccupied_slider.setValue(default_data.cooling_setpoint_unoccupied);
  iot_device_thermostat_heating_setpoint_unoccupied_slider.setValue(default_data.heating_setpoint_unoccupied);
  iot_device_thermostat_setpoint_limit_lower_slider.setValue([
    default_data.setpoint_limit_lower,
    parseInt(default_data.setpoint_limit_upper),
  ]);
  iot_device_thermostat_setpoint_limit_upper_slider.setValue([
    parseInt(default_data.setpoint_limit_lower_heat),
    parseInt(default_data.setpoint_limit_upper_heat),
  ]);
  iot_device_thermostat_frost_protection_setpoint_slider.setValue(default_data.frost_protection_setpoint);

  window.iot_device_thermostat_fan_speed_picker.setValue([default_data.fan_speed]);
  window.iot_device_thermostat_mode_selection_picker.setValue([default_data.mode_selection]);
  window.iot_device_thermostat_temperature_sensor_picker.setValue([default_data.temperature_sensor]);
  window.iot_device_thermostat_temperature_offset_picker.setValue([default_data.temperature_offset]);
  window.iot_device_thermostat_dead_band_picker.setValue([default_data.fan_speed_in_auto_mode_in_dead_band]);
  window.iot_device_thermostat_unoccupied_fan_mode_picker.setValue([default_data.fan_mode_when_unoccupied]);
  window.iot_device_thermostat_frost_protection_picker.setValue([default_data.frost_protection]);
  window.iot_device_thermostat_restart_after_power_failure_picker.setValue([default_data.restart_after_power_failure]);
  window.iot_device_thermostat_keypad_lock_after_backlight_off_picker.setValue([default_data.keypad_lock_after_backlight_off]);
  window.iot_device_thermostat_screen_lights_up_picker.setValue([default_data.screen_lights_up_on_command]);
  window.iot_device_thermostat_humidity_offset_picker.setValue([default_data.humidity_offset]);
  //   window.iot_device_thermostat_push_mqtt_picker.setValue([default_data.push_mqtt_message_after_state_change]);

  app.preloader.hide();
};

window.iot_device_thermostat_form_save = function (params) {
  const guid = params.ref;

  if (!app.input.validateInputs('#frappe-form')) {
    return false;
  }

  const formdata = app.form.convertToData('#frappe-form');
  console.log(formdata);
  if (parseInt(iot_device_thermostat_set_lower_tem) >= parseInt(iot_device_thermostat_set_upper_tem)) {
    return false;
  }
  formdata['setpoint_limit_lower'] = iot_device_thermostat_set_lower_tem;
  formdata['setpoint_limit_upper'] = iot_device_thermostat_set_upper_tem;

  formdata['setpoint_limit_lower_heat'] = iot_device_thermostat_set_lower_tem_heat;
  formdata['setpoint_limit_upper_heat'] = iot_device_thermostat_set_upper_tem_heat;
  const fan_speed_command = {
    'Disable': 0,
    '1 Speed': 1,
    '2 Speed': 2,
    '3 Speed': 3,
  };

  const mode_selection_command = {
    'Cooling and Heating': 0,
    'Heating': 1,
    'Cooling': 2,
  };

  const temperature_sensor_command = {
    'Internal': 0,
    'External': 1,
  };

  const dead_band_command = {
    'Fan Off': 0,
    '1 Speed': 1,
  };

  const occ_command = {
    'Disable': 0,
    'Close fan and valve when unoccupied (Open circuit without occupancy)': 1,
    'Close fan and valve when unoccupied (Open circuit with occupancy)': 2,
    'Switch to unoccupied mode (Open circuit without occupancy)': 3,
    'Switch to unoccupied mode (Open circuit with occupancy)': 4,
    'Open circuit indicates dew point alarm': 5,
    'Short circuit indicates dew point alarm': 6,
    'Open circuit indicates filter alarm': 7,
    'Short circuit indicates filter alarm': 8,
  };

  const unoccupied_fan_mode_command = {
    'User': 0,
    '1 Speed': 1,
  };

  const on_off_command = {
    'On': 1,
    'Off': 0,
  };

  const restart_after_power_failure_command = {
    ...on_off_command,
    'Restore': 2,
  };

  app.preloader.show();

  iot_ble_check_enable()
    .then(() => {
      return window.peripheral[guid].connect();
    })
    .then(() => {
      let data = '9402000013';
      //check firmware
      if (window.peripheral && isset(window.peripheral[guid])) {
        if (window.peripheral[guid].prop.firmwareNo >= 12.3) {
          data = '9402000015';
        }
      }
      // const sort = [
      //     "fan_speed",
      //     "mode_selection",
      //     "temperature_sensor",
      //     "temperature_offset",
      //     "fan_speed_in_auto_mode_in_dead_band",
      //     "occ",
      //     "cooling_setpoint_unoccupied",
      //     "heating_setpoint_unoccupied",
      //     "fan_mode_when_unoccupied",
      //     "setpoint_limit_lower",
      //     "setpoint_limit_upper",
      //     "frost_protection",
      //     "frost_protection_setpoint",
      //     "restart_after_power_failure",
      //     "backlight_off",
      //     "keypad_lock_after_backlight_off",
      //     "backlight_brightness",
      //     "screen_lights_up_on_command",
      //     "push_mqtt_message_after_state_change"
      // ]

      data += parseInt(`${fan_speed_command[formdata['fan_speed']]}`).toString(16).pad('00');
      data += parseInt(`${mode_selection_command[formdata['mode_selection']]}`).toString(16).pad('00');
      data += parseInt(`${temperature_sensor_command[formdata['temperature_sensor']]}`).toString(16).pad('00');
      const temperature_offset = parseInt(`${formdata['temperature_offset']}`);
      if (temperature_offset < 0) {
        const unsignedInt = temperature_offset & 0xff; // 通过位与运算将有符号整数转换为无符号整数
        data += unsignedInt.toString(16).pad('00');
      } else {
        data += temperature_offset.toString(16).pad('00');
      }
      data += parseInt(`${dead_band_command[formdata['fan_speed_in_auto_mode_in_dead_band']]}`).toString(16).pad('00');
      data += parseInt(`${occ_command[formdata['occ']]}`).toString(16).pad('00');
      data += parseInt(`${formdata['cooling_setpoint_unoccupied']}`).toString(16).pad('00');
      data += parseInt(`${formdata['heating_setpoint_unoccupied']}`).toString(16).pad('00');
      data += parseInt(`${unoccupied_fan_mode_command[formdata['fan_mode_when_unoccupied']]}`).toString(16).pad('00');
      data += parseInt(`${iot_device_thermostat_set_lower_tem}`).toString(16).pad('00');
      data += parseInt(`${iot_device_thermostat_set_upper_tem}`).toString(16).pad('00');
      data += parseInt(`${on_off_command[formdata['frost_protection']]}`).toString(16).pad('00');
      data += parseInt(`${formdata['frost_protection_setpoint']}`).toString(16).pad('00');
      data += parseInt(`${restart_after_power_failure_command[formdata['restart_after_power_failure']]}`).toString(16).pad('00');
      data += parseInt(`${formdata['backlight_off']}`).toString(16).pad('00');
      data += `00`;
      data += parseInt(`${formdata['backlight_brightness']}`).toString(16).pad('00');
      data += parseInt(`${formdata['keypad_lock_after_backlight_off']}`).toString(16).pad('00');
      
      const humidity_offset = parseInt(`${formdata['humidity_offset']}`);
      
      if (humidity_offset < 0) {
        const unsignedInt = humidity_offset & 0xff; // 通过位与运算将有符号整数转换为无符号整数
        data += unsignedInt.toString(16).pad('00');
      } else {
        data += humidity_offset.toString(16).pad('00');
      }
      //   data += parseInt(`${on_off_command[formdata['push_mqtt_message_after_state_change']]}`).toString(16).pad('00');
      if (window.peripheral && isset(window.peripheral[guid])) {
        if (window.peripheral[guid].prop.firmwareNo >= 12.3) {
          
          data += parseInt(`${iot_device_thermostat_set_lower_tem_heat}`).toString(16).pad('00');
          data += parseInt(`${iot_device_thermostat_set_upper_tem_heat}`).toString(16).pad('00');
        }
      }
      debugger
      console.log('>>>> thermostat ble data: ' + data);

      // ha_process_periperal_cmd(runtime.peripherals[guid].id, [
      //   {
      //     action: 'connect'
      //   },
      //   {
      //     action: 'write',
      //     data: data
      //   }
      // ]);
      return window.peripheral[guid].write([
        {
          service: 'ff80',
          characteristic: 'ff81',
          data: data,
        },
      ]);
      //return iot_ble_write(guid, 'ff80', 'ff81', data, false);
    })
    .then(() => {
      return iot_device_setting_sync_server(guid, null, null, true, formdata);
    })
    .then(() => {
      app.preloader.hide();

      mainView.router.back();
    })
    .catch((err) => {
      app.preloader.hide();
      app.dialog.alert(_(erp.get_log_description(err)));
    });
};

window.onPriceChange = (e) => {
  const range = app.range.get(e.target);
  console.log(range);
};

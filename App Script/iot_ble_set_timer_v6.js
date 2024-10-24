window.iot_ble_set_timer = function (guid, timer_id, button_group, dateStr, timeStr, binaryRepeat, status, action, max_timer = 8) {
    // repeat [0000000]
    const TAG = ">>> iot_ble_set_timer";
    window.device_timer_list = [];
    return iot_ble_sync_clock(guid).then(() => {
      return http.request(`/api/resource/Device/${guid}`, {
          method: "GET",
          responseType: "json"
      });
    }).then((rs) => {
      const server_timers = rs.data.data.device_timer;
      device_timer_list = server_timers;
      if (timer_id === undefined || timer_id === null) {
          const timers = (runtime.peripherals ? runtime.peripherals[guid] ? runtime.peripherals[guid].timers ? runtime.peripherals[guid].timers : [] : [] : []).concat(server_timers);
          const timer_map = new Map();

          for (let i = 0; i < timers.length; i++) {
              timer_map.set(timers[i].timer_id, timers[i]);
          }

          let next_create_timer_id = max_timer - 1;

          for (let i = 0; i < max_timer; i++) {
              if (!timer_map.get(i)) {
                  next_create_timer_id = i;
                  break;
              }
          }

          // or can not create?
          const t = server_timers.find((e) => e.timer_id === next_create_timer_id);

          return Promise.resolve({ new_timer_id: next_create_timer_id, timer_name: t ? t.name : null });
      } else {
          const t = server_timers.find((e) => e.timer_id === timer_id);

          return Promise.resolve({ new_timer_id: timer_id, timer_name: t ? t.name : null });
      }
  }).then((rs) => {
        let data = "840101";
        const dateParts = dateStr.split("-");
        const timeParts = timeStr.split(":");
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);

        // EVT PORT ss mm hh dd MM YY YY REPEAT DELAY_FLAG STATUS ACTION ACTION ACTION ACTION
        // 0   1    2  3  4  5  6  7  8  9      10         11     12     12     12     12
        //     01   00 2f 0e 0b 03 e7 07 00     00         01     00     00     00     00

        data += parseInt(rs.new_timer_id).toString(16).pad("00");

        let port = iot_ble_get_device_port(button_group);

        data += port.toString(16).pad("00");
        data += date.getSeconds().toString(16).pad("00");
        data += date.getMinutes().toString(16).pad("00");
        data += date.getHours().toString(16).pad("00");
        data += date.getDate().toString(16).pad("00");
        data += (date.getMonth() + 1).toString(16).pad("00");

        const hexYear = date.getFullYear().toString(16).pad("0000");
        // hexYear.match(/.{1,2}/g).reverse().join('');
        const yearHigh = hexYear.substring(0, 2);
        const yearLow = hexYear.substring(2);
        data += (yearLow + yearHigh);

        // binaryRepeat value like: 0000000
        // sun sat fri thur wed tues mon
        // 0   0   0   0    0   0    0

        data += parseInt(binaryRepeat.pad("00000000"), 2).toString(16).pad("00");
        data += "00"; // delay
        data += status.toString(16).pad("00");
        data += parseInt(action).toString(16).pad("00");
        // unuse action
        data += "000000";

        console.log(TAG, data);
    
        return new Promise((resolve, reject) => {
            window.peripheral[guid].write([{
                service: 'ff80',
                characteristic: 'ff81',
                data: data,
            }]).then(() => {
                resolve(rs);
            }).catch(reject);
        });
    }).then((rs) => {
        debugger
        let url = encodeURI("/api/resource/Device/"+guid);
        let method = "PUT";
        let device_timer = cloneDeep(device_timer_list);
        const repeat_keys = ["repeat_monday", "repeat_tuesday", "repeat_wednesday", "repeat_thursday", "repeat_friday", "repeat_saturday", "repeat_sunday"].reverse();

        const repeat = {};
        for (let i = 0; i < repeat_keys.length; i++) {
            repeat[repeat_keys[i]] = parseInt(binaryRepeat[i]);
        }
        if (rs.timer_name) {
            //url += rs.timer_name;
            device_timer.forEach(item=>{
                if(item.name == rs.timer_name){
                    item.date = dateStr;
                    item.time = timeStr;
                    item.action = action;
                    item.disabled = status === 0 ? 1 : 0;
                    item.repeat_daily = binaryRepeat === "1111111" ? 1 : 0;
                    item.repeat_sunday = repeat.repeat_sunday;
                    item.repeat_monday = repeat.repeat_monday;
                    item.repeat_tuesday = repeat.repeat_tuesday;
                    item.repeat_wednesday = repeat.repeat_wednesday;
                    item.repeat_thursday = repeat.repeat_thursday;
                    item.repeat_friday = repeat.repeat_friday;
                    item.repeat_saturday = repeat.repeat_saturday;
                }
            })
        }else{
            device_timer.push({
                device_button_group: button_group,
                timer_id: rs.new_timer_id,
                date: dateStr,
                time: timeStr,
                action: action,
                repeat_daily: binaryRepeat === "1111111" ? 1 : 0,
                ...repeat,
                disabled: status === 0 ? 1 : 0,
            })
        }

        
        
        return http.request(url, {
            method: method,
            serializer: "json",
            data: {
                device_timer : device_timer
            }
        });
    }).then(()=>{
        //set the erp setting
        return iot_device_setting_sync_server(guid, 'Set Time', "true")
    })
}
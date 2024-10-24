window.iot_device_timer_form_time_picker = {};
window.iot_device_timer_form_date_picker = {};
window.iot_device_timer_form_repeat_select = {};
window.iot_device_timer_form_initiate = function () {
    const TAG = ">>>> iot_device_timer_form_initiate";
    
    const form = app.form.convertToData("#frappe-form");
    const timer_id = form.timer_id;
    const button_group = form.button_group;
    const guid = form.guid;
    const initiate_execute = form.initiate_execute;

    const repeat_keys = ["repeat_monday", "repeat_tuesday", "repeat_wednesday", "repeat_thursday", "repeat_friday", "repeat_saturday", "repeat_sunday"].reverse();

    const parseSmartSelectValue = function(info) {
        const v = [];
        if (info.repeat_daily === 1) {
            return v.concat(repeat_keys);
        }

        for (let i = 0; i < repeat_keys.length; i++) {
            if (info[repeat_keys[i]] === 1) {
                v.push(repeat_keys[i]);
            }
        }
        return v;
    }

    let defaultAction = "1";
    if (button_group.startsWith("DIMMING")) {
        defaultAction = "255";
    }

    app.preloader.show();
    window.peripheral[guid].connect().then(()=>{
        return new Promise((resolve, reject) => {
            let form_date = new Date();
            form_date.setMinutes(form_date.getMinutes() + 2);
            if (timer_id) {
                // edit timer
                const peripheral_s = peripheral[guid];
                debugger
                if (peripheral_s && peripheral_s.timers && peripheral_s.timers.findIndex((e) => e.timer_id === parseInt(timer_id)) !== -1) {
                    // use peripheral timer data
                    const timerIndex = peripheral_s.timers.findIndex((e) => e.timer_id === parseInt(timer_id));
                    const timerInfo = peripheral_s.timers[timerIndex];
    
                    const dateParts = timerInfo.date.split("-");
                    const timeParts = timerInfo.time.split(":");
                    form_date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
    
                    resolve({ form_date, action: timerInfo.action, repeat: parseSmartSelectValue(timerInfo) });
                } else {
                    http.request("/api/resource/Device/"+guid, {
                        method: "GET",
                        responseType: "json"
                    }).then((rs) => {
                        const timers = rs.data.data.device_timer;
    
                        if (timers.length <= 0) {
                            reject(new Error("Load Timer Info Error"));
                        } else {
                            let timerId = $(`input[name="timer_id"]`).val();

                            let timerInfo = null;
                            timers.forEach((item=>{
                                if(item.timer_id == timerId){
                                    timerInfo = item;
                                }
                            }))
                            const dateParts = timerInfo.date.split("-");
                            const timeParts = timerInfo.time.split(":");
                            form_date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
    
                            resolve({ form_date, action: timerInfo.action, repeat: parseSmartSelectValue(timerInfo) });
                        }
                    }).catch((e) => {
                        reject(e);
                    });
                }
    
            } else {
                // create timer
                resolve({ form_date, action: defaultAction, repeat: [] });
            }
        })
    }).then(({ form_date, action, repeat }) => {
        iot_device_timer_form_time_picker = app.picker.create({
            inputEl: "#device_timer-time-picker",
            value: [
                form_date.getHours().toString().pad("00"),
                form_date.getMinutes().toString().pad("00")
            ],
            formatValue: function (values, displayValues) {
                return values[0] + ':' + values[1];
            },
            cols: [
                // Hours
                {
                    values: (function () {
                        var arr = [];
                        for (var i = 0; i <= 23; i++) { arr.push(i.toString().pad("00")); }
                        return arr;
                    })(),
                },
                // Divider
                {
                    divider: true,
                    content: ':'
                },
                // Minutes
                {
                    values: (function () {
                        var arr = [];
                        for (var i = 0; i <= 59; i++) { arr.push(i.toString().pad("00")); }
                        return arr;
                    })(),
                }
            ]
        });
    
        iot_device_timer_form_date_picker = app.calendar.create({
            inputEl: "#device_timer-date-picker",
            locale: "en-US",
            dateFormat: "yyyy-mm-dd",
            value: [form_date],
            openIn: 'customModal',
            header: true,
            footer: true,
        });

        iot_device_timer_form_repeat_select = app.smartSelect.create({
            el: "#device_timer-repeat-select",
            openIn: "sheet"
        });

        iot_device_timer_form_repeat_select.setValue(repeat);

        // print format decide to init
        if (initiate_execute) {
            window[initiate_execute](action);
        }

        app.preloader.hide();
    }).catch((e) => {
        console.log(TAG, "error: " + e);

        app.preloader.hide();

        app.dialog.alert((e + "").startsWith("BLE Connection Error:") ? _("Sorry, the device cannot be connected right now. Please come close to the device to continue the setup!") : e, '', () => {
            mainView.router.back();
        });
    });
}

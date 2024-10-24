window.iot_ble_load_all_timer = function (params) {
    const TAG = ">>>> iot_ble_load_timer";

    const temp = params.ref.split("|");
    const profile_subdevice = temp[0];
    const guid = temp[1];
    const button_group = temp[2];

    const p = runtime.peripherals[guid];

    // port = 1 = GANG 1
    // 0 = IR
    // 6 = DIMMING
    let port = iot_ble_get_device_port(button_group);

    const repeat_keys = ["repeat_monday", "repeat_tuesday", "repeat_wednesday", "repeat_thursday", "repeat_friday", "repeat_saturday", "repeat_sunday"].reverse();

    const BLE_TIMER_LOAD = "8402";
    const BLE_TIMER_ALL = "FF";
    // const update_error_msg = "update server timer fail";

    app.preloader.show();

    iot_ble_check_enable().then(() => {
        return iot_ble_do_pre_action(guid);
    }).then(() => {
        // update device time
        return iot_ble_sync_clock(guid);
    }).then(() => {
        console.log(TAG, "pre action complete");
        // if (isset(runtime.peripherals[guid]["firmware"])) {
        //     p["firmwareNo"] = p["firmware"].toString().replace(/[^0-9.]/g, "") * 10000;
        // }

        return new Promise((resolve, reject) => {
            let timers = [];

            ble.startNotification(p.id, "ff80", "ff82",
                (rs) => {
                    if (rs && rs.startsWith(BLE_TIMER_LOAD)) {
                        console.log(TAG, rs);

                        if (rs === (BLE_TIMER_LOAD + BLE_TIMER_ALL).toLowerCase()) {
                            resolve(timers);
                        } else {
                            timers.push(rs);
                        }
                    }
                },
                (e) => {
                    app.preloader.hide();
                    console.log(TAG, "listen error: " + e);
                    reject(e);
                }
            );

            iot_ble_write(guid, "ff80", "ff81", BLE_TIMER_LOAD + BLE_TIMER_ALL, false).catch((e) => {
                console.log(TAG, "write error: " + e);
                reject(e);
            });
        });
    }).then((timers) => {
        // reset
        p.timers = [];

        // COMMAND TYPE ID
        // 84      02   00

        // EVT PORT ss mm hh dd MM YY YY REPEAT DELAY_FLAG STATUS ACTION ACTION ACTION ACTION
        // 0   1    2  3  4  5  6  7  8  9      10         11     12     12     12     12
        //     01   00 2f 0e 0b 03 e7 07 00     00         01     00     00     00     00

        for (let i = 0; i < timers.length; i++) {
            const timer_ret = timers[i];

            const id_byte = timer_ret.substring(4, 4 + 2);
            const port_byte = timer_ret.substring(6, 6 + 2);
            const sec_byte = timer_ret.substring(8, 8 + 2);
            const min_byte = timer_ret.substring(10, + 10 + 2);
            const hour_byte = timer_ret.substring(12, 12 + 2);
            const day_byte = timer_ret.substring(14, 14 + 2);
            const mon_byte = timer_ret.substring(16, 16 + 2);
            const year_l_byte = timer_ret.substring(18, 18 + 2);
            const year_h_byte = timer_ret.substring(20, 20 + 2);
            const repeat_byte = timer_ret.substring(22, 22 + 2);
            // const delay_flag_byte = timer_ret.substring(24, 24 + 2);
            const status_byte = timer_ret.substring(26, 26 + 2);
            const action_byte = timer_ret.substring(28, 28 + 2);

            // parse byte
            const id = parseInt(id_byte, 16);
            const device_port = parseInt(port_byte, 16);
            const seconds = parseInt(sec_byte, 16).toString().pad("00");
            const minutes = parseInt(min_byte, 16).toString().pad("00");
            const hour = parseInt(hour_byte, 16).toString().pad("00");
            const day = parseInt(day_byte, 16).toString().pad("00");
            const month = parseInt(mon_byte, 16).toString().pad("00");

            // parse low year and high year
            const low = parseInt(year_l_byte, 16);
            const high = parseInt(year_h_byte, 16);
            const shifted = (high << 8) | low;
            const year = shifted.toString();

            // parse repeat
            const binaryRepeat = parseInt(repeat_byte, 16).toString(2).pad("00000000");
            const repeat = {};
            for (let i = 1; i < binaryRepeat.length; i++) {
                repeat[repeat_keys[i - 1]] = parseInt(binaryRepeat[i]);
            }

            // const delay_flag = parseInt(delay_flag_byte, 16);
            const status = parseInt(status_byte, 16);
            const action = parseInt(action_byte, 16);

            // compare port
            p.timers.push({
                hex: timer_ret,
                timer_id: id,
                time: hour + ":" + minutes + ":" + seconds,
                date: year + "-" + month + "-" + day,
                disabled: status === 0 ? 1 : 0,
                action: action.toString(),
                repeat_daily: binaryRepeat === "01111111" ? 1 : 0,
                port: device_port,
                ...repeat,
            });
        }

        return frappe.print.out("iot_refresh_timer_unsync", true, { peripheral: { timers: p.timers.filter((e) => e.port === port) }, profile_subdevice: profile_subdevice, refresh_mode: "unsync" }, "APP_HA_Device_Timer_Unsync_List_V3");
    }).then(() => {
        $('.device-timer ul li').removeClass("disabled");
        $('.fab-add-timer').removeClass("disabled");

        if ($('.device-timer ul li').length <= 0) {
            $('.device-timer-empty').show();
        } else {
            $('.device-timer-empty').hide();
        }
        
        app.preloader.hide();
    }).then(() => {
        return new Promise((resolve, reject) => {

            http.request("/api/resource/Device%20Local%20Timer?parent=Device&" + encodeURI('fields=["*"]&filters=[["parent", "=", "' + guid + '"], ["device_button_group", "=", "' + button_group + '"]]'), {
                method: "GET",
                responseType: "json",
            }).then(async (rs) => {
                const server_timers = rs.data.data;
                const device_timers = p.timers.filter((e) => { return e.port === port; });

                // server exist, but device not exist, switch toggle to close
                for (let i = 0; i < server_timers.length; i++) {
                    const erp_timer = server_timers[i];
                    const index = device_timers.findIndex((e) => e.timer_id === erp_timer.timer_id); 

                    if (index === -1) {
                        $(".device-timer input[timer-id='" + erp_timer.timer_id + "']").removeAttr("checked");
                    }
                }
                
                // device exist, server not exist, update timer to server
                for (let i = 0; i < device_timers.length; i++) {
                    const peripheral_timer = device_timers[i];
                    const index = server_timers.findIndex((e) => e.timer_id === peripheral_timer.timer_id);
                    const needUpdateUITimers = [];

                    if (index === -1) {
                        const create_timer_data = Object.assign({}, peripheral_timer);
                        delete create_timer_data.hex;
                        delete create_timer_data.port;

                        try {
                            await http.request("/api/resource/Device%20Local%20Timer", {
                                serializer: "json",
                                method: "POST",
                                data: {
                                    parenttype: "Device",
                                    parentfield: "device_timer",
                                    parent: guid,
                                    device_button_group: button_group,
                                    ...create_timer_data
                                }
                            });
                        } catch (e) {
                            console.log(TAG, "create timer in server error: " + e);
                        }
                    } else {
                        // is created, diff timer
                        const erp_timer = server_timers[index];
                        const p_timer_binaryv = repeat_keys.map((k) => peripheral_timer[k]).join("");
                        const e_tmer_binaryv = repeat_keys.map((k) => erp_timer[k]).join("");

                        let needUpdate = false;
                        if (erp_timer.repeat_daily === 1 && p_timer_binaryv !== "1111111") {
                            needUpdate = true;
                        } else if (p_timer_binaryv !== e_tmer_binaryv) {
                            needUpdate = true;
                        } else if (erp_timer.action !== peripheral_timer.action) {
                            needUpdate = true;
                        } else if (erp_timer.disabled !== peripheral_timer.disabled) {
                            needUpdate = true;
                        } else if (erp_timer.date !== peripheral_timer.date) {
                            needUpdate = true;
                        } else if (erp_timer.time.pad("00000000") !== peripheral_timer.time) {
                            needUpdate = true;
                        }

                        if (needUpdate) {
                            const update_timer_data = Object.assign({}, peripheral_timer);
                            delete update_timer_data.hex;
                            delete update_timer_data.port;

                            try {
                                needUpdateUITimers.push(update_timer_data);

                                const removeEl = $(".device-timer li[timer-id='" + update_timer_data.timer_id + "']");
                                if (removeEl) {
                                    removeEl.remove();
                                }

                                await http.request("/api/resource/Device%20Local%20Timer/" + erp_timer.name, {
                                    method: "PUT",
                                    serializer: "json",
                                    data: {
                                        parenttype: "Device",
                                        parentfield: "device_timer",
                                        parent: guid,
                                        device_button_group: button_group,
                                        ...update_timer_data
                                    }
                                });
                            } catch (e) {
                                console.log(TAG, "update timer in server error: " + e);
                            }
                        }
                    }

                    if (needUpdateUITimers.length > 0) {
                        try {
                            await frappe.print.out("iot_refresh_timer_update", true, { peripheral: { timers: needUpdateUITimers }, profile_subdevice: profile_subdevice, refresh_mode: "update" }, "APP_HA_Device_Timer_Unsync_List_V3");
                        } catch (e) {
                            console.log(TAG, "update ui error: " + e);
                        }
                    }

                    resolve();
                }
            }).catch((e) => {
                console.log(TAG, e);
                // reject(update_error_msg);
            });
        });
    }).catch((e) => {
        console.log(TAG, "load all timer error: " + e);

        if ($('.device-timer ul li').length <= 0) {
            $('.device-timer-empty').show();
        }

        $('.device-timer ul li').addClass("disabled");
        $('.fab-add-timer').addClass("disabled");
        
        app.preloader.hide();

        if ((e + "").startsWith("BLE Connection Error:")) {
            app.dialog.alert(_("Sorry, the device cannot be connected right now. Please come close to the device to continue the setup!"), runtime.appInfo.name, () => {
                mainView.router.back();
            });
        } else {
            app.dialog.alert(e, runtime.appInfo.name, () => {});
        }
    });
}
window.iot_device_setting_sync_server = function(guid, type, setting, multiple, settings) {
    return http.request(encodeURI('/api/resource/Device/' + guid), {
        method: "GET",
        responseType: "json",
    }).then((res) => {
        const data = res.data.data;

        if (multiple) {
            Object.keys(settings).forEach((e) => {
                const new_setting = settings[e];

                let updated = false;
                for (let j = 0; j < data.settings.length; j++) {
                    const server_setting = data.settings[j];
                    
                    if (e === server_setting.setting_type) {
                        data.settings[j] = app.utils.extend(server_setting, {
                            setting_type: e,
                            setting: new_setting
                        });
                        updated = true;
                        break;
                    }
                }

                if (!updated) {
                    data.settings.push({
                        setting_type: e,
                        setting: new_setting
                    });
                }
            });

            return http.request(encodeURI('/api/resource/Device/' + guid), {
                serializer: "json",
                responseType: "json",
                method: "PUT",
                data: data
            });
        }  else if (data.settings) {
            for (let i = 0; i < data.settings.length; i++) {
                if (data.settings[i].setting_type === type) {
                    return data.settings[i].name;
                }
            }
        }
    }).then((name) => {
        if (multiple) return;

        if (name) {
            // UPDATE
            return http.request(encodeURI('/api/resource/Device Setting/' + name), {
                serializer: "json",
                responseType: "json",
                method: "PUT",
                data: {
                    parenttype: "Device",
                    parentfield: "settings",
                    parent: guid,
                    setting_type: type,
                    setting: setting
                }
            });
        } else {
            // CREATE
            return http.request(encodeURI('/api/resource/Device Setting'), {
                serializer: "json",
                responseType: "json",
                method: "POST",
                data: {
                    parenttype: "Device",
                    parentfield: "settings",
                    parent: guid,
                    setting_type: type,
                    setting: setting
                }
            });
        }
    });
}
window.iot_mode_setup_virtual_id_picker = {};
window.iot_mode_setup_change_virtual_id_init = function(params) {
    const guid = params.ref;
    const setting_type = params.obj.attr("setting-type");
    const button_group = params.obj.attr("button-group");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    console.log("led mode");
    const command = {
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
        "6": "6",
        "7": "7",
        "8": "8",
        "9": "9",
        "10": "10",
        "11": "11",
        "12": "12",
        "13": "13",
        "14": "14",
        "15": "15",
        "16": "16",
        "17": "17",
        "18": "18",
        "19": "19",
        "20": "20",
        "21": "21",
        "22": "22",
        "23": "23",
        "24": "24",
        "25": "25",
        "26": "26",
        "27": "27",
        "28": "28",
        "29": "29",
        "30": "30",
        "31": "31",
        "32": "32"
    };
    let rcuDevices = [];
    let devices = cloneDeep(erp.info.profile.profile_subdevice);
    devices.forEach(device => {
        if(device.device_mode == "RCU Controller" && device.device_button_group == "ONOFF GANG1"){
            rcuDevices.push({
                title: tran(device.title),
                guid: device.device,
            });
        }
    });
    console.log(rcuDevices);
    const inputEl = params.obj.find("input[name=link_virtual_id]");

    iot_mode_setup_virtual_id_picker = app.picker.create({
        inputEl: inputEl,
        rotateEffect: true,
        cols: [
            {
                textAlign: "center",
                values: rcuDevices.map(e => e.guid),
                displayValues: rcuDevices.map((e) => e.title)
            },
            {
                textAlign: "center",
                values: Object.keys(command),
                displayValues: Object.keys(command).map((e) => _(e))
            }
        ],
        formatValue: (values) => {
            return values[0];
        },
        renderToolbar: () => {
            return `
            <div class="toolbar">
                <div class="toolbar-inner">
                    <div class="left"></div>
                    <div class="right">
                        <a href="#" class="link toolbar-save-link">${_("Save")}</a>
                    </div>
                </div>
            </div>
            `;
        },
        on: {
            open: (picker) => {
                iot_mode_setup_virtual_id_picker.setValue([params.obj.attr("setting-value")]);

                $(picker.$el).find(".toolbar-save-link").on("click", () => {
                    iot_mode_setup_virtual_id_picker.close();

                    //const selected = inputEl.val();
                    const selectedList = iot_mode_setup_virtual_id_picker.getValue();
                    console.log(iot_mode_setup_virtual_id_picker.getValue());
                    let rcuGuid = selectedList[0];
                    let virtualId = selectedList[1];
                    app.preloader.show();
                    if(!rcuGuid || rcuGuid == "undefined"){
                        app.preloader.hide(); 
                        app.dialog.alert(_("Please select a RCU device!"));               
                        return;
                    }
                    iot_ble_check_enable()
                    .then(() => {
                        return window.peripheral[guid].connect();
                    })
                    .then(() => {
                        let data = '';
                        if (virtualId) {
                            let gang = 1;
                            if(button_group.startsWith("ONOFF GANG")){
                                gang = button_group.replace("ONOFF GANG","")*1;
                            }
                            
                            let rcuMac = core_utils_get_mac_address_from_guid(rcuGuid, true);
                            
                            data = `8f32${parseInt(gang).toString(16).pad('00')}00${rcuMac}13${parseInt(virtualId).toString(16).pad('00')}00`;
                            debugger
                            return window.peripheral[guid].write([
                                {
                                  service: 'ff80',
                                  characteristic: 'ff81',
                                  data: data,
                                },
                              ]);
                            //return iot_ble_write(guid, "ff80", "ff81", data, false);
                        } else {
                            return Promise.reject(new Error("Unsupport option!"));
                        }
                    }).then(() => {
                        return iot_device_setting_sync_server(guid, setting_type, virtualId);
                    }).then(() => {
                        params.obj.attr("setting-value", virtualId);
                        params.obj.find(".setting-value").html(_(virtualId));

                        app.preloader.hide();
                    }).catch((err) => {
                        app.preloader.hide();
                        app.dialog.alert(_(erp.get_log_description(err)));
                    });

                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_virtual_id_picker.open();
    });
}
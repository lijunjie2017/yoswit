window.iot_mode_setup_push_interval_picker = {};
window.iot_mode_setup_push_interval_init = function(params) {
    const TAG = ">>>> iot_mode_setup_push_interval_picker";

    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=push_interval]");

    iot_mode_setup_push_interval_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: ['1times','1min','2min','5min','10min','15min','30min','45min','1h','2h','4h','8h','12h','1day','1week'],
                displayValues: ['1times','1min','2min','5min','10min','15min','30min','45min','1h','2h','4h','8h','12h','1day','1week']
            }
        ],
        formatValue: function(values) {
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
                iot_mode_setup_push_interval_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", async() => {
                    iot_mode_setup_push_interval_picker.close();

                    const selected = inputEl.val();
                    app.dialog.preloader();
                    let typeIndexList = [0,1,2,5,10,15,30,45,60,120,240,480,720,1440,10080];
                    let displayValues = ['1times','1min','2min','5min','10min','15min','30min','45min','1h','2h','4h','8h','12h','1day','1week'];
                    //iot write
                    try{
                        let sceneIdMap = await get_battery_threshold_scene_id("Geomagnetic Scene",guid);
                        let sceneId = sceneIdMap.id;
                        if(sceneId){
                            let data = `8f2e0000${parseInt(sceneId).toString(16).pad("00")}${parseInt(displayValues.indexOf(selected)).toString(16).pad("00")}`;
                            console.log(data);
                            await window.peripheral[guid].write([{
                                service: 'ff80',
                                characteristic: 'ff81',
                                data: data,
                            }]);
                            await iot_device_setting_sync_server(guid, setting_type, displayValues[parseInt(displayValues.indexOf(selected))]);
                            params.obj.attr("setting-value", selected);
                            params.obj.find(".setting-value").html(_(displayValues[parseInt(displayValues.indexOf(selected))]));
                            await ha_profile_ready();
                            app.dialog.close();
                            app.dialog.alert(_("Save Successfully"));
                        }else{
                            app.dialog.close();
                            app.dialog.alert(_("Battery threshold has not been set yet."));
                        }
                    }catch(error){
                        app.dialog.close();
                        app.dialog.alert(_(erp.get_log_description(error)));
                    }
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_push_interval_picker.open();
    });
}
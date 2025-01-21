window.iot_mode_setup_notification_interval_picker = {};
window.iot_mode_setup_notification_interval_init = function(params) {
    const TAG = ">>>> iot_mode_setup_notification_interval_picker";

    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=notification_interval]");

    iot_mode_setup_notification_interval_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: ['1min','10min','20min','30min','40min','50min','1h','2h','4h','8h','12h','1day','1week'],
                displayValues: ['1min','10min','20min','30min','40min','50min','1h','2h','4h','8h','12h','1day','1week']
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
                iot_mode_setup_notification_interval_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", async() => {
                    iot_mode_setup_notification_interval_picker.close();

                    const selected = inputEl.val();
                    app.dialog.preloader();
                    let typeIndexList = [60,600,1200,1800,2400,3000,3600,7200,14400,28800,43200,86400,604800];
                    let displayValues = ['1min','10min','20min','30min','40min','50min','1h','2h','4h','8h','12h','1day','1week'];
                    //iot write
                    try{
                        let data = `9353000004${iot_utils_to_little_endian_hex(typeIndexList[parseInt(displayValues.indexOf(selected))],4)}`;
                        debugger
                        await window.peripheral[guid].write([{
                            service: 'ff80',
                            characteristic: 'ff81',
                            data: data,
                        }]);
                        await iot_device_setting_sync_server(guid, setting_type, selected);
                        params.obj.attr('setting-value', selected);
                        params.obj.find('.setting-value').html(_(selected));
                        app.dialog.close();
                    }catch(error){
                        app.dialog.close();
                        app.dialog.alert(_(erp.get_log_description(error)));
                    }
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_notification_interval_picker.open();
    });
}
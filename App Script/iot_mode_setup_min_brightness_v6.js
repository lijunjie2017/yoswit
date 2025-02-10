window.iot_mode_setup_min_brightness_picker = {};
window.iot_mode_setup_min_brightness_init = function(params) {
    const TAG = ">>>> iot_mode_setup_min_brightness_init";

    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=min_brightness]");

    iot_mode_setup_min_brightness_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: [5,6,7,8,9,10,11,12,13,14,15],
                displayValues: ['5%','6%','7%','8%','9%','10%','11%','12%','13%','14%','15%']
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
                iot_mode_setup_min_brightness_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", () => {
                    iot_mode_setup_min_brightness_picker.close();

                    const selected = parseInt(inputEl.val());
                    app.preloader.show();
                    //iot write
                    try{
                        let data = `8911${parseInt(selected*255/100).toString(16).pad("00")}${parseInt(selected*255/100).toString(16).pad("00")}`;
                        if(button_group.startsWith("RCU")){
                            data = `971f${slot_index}${data}`;
                        }
                        console.log(data);
                        window.peripheral[guid].write([{
                            service: 'ff80',
                            characteristic: 'ff81',
                            data: data,
                        }])
                        .then((res)=>{
                            let key = `${setting_type}_${button_group}`;
                            return iot_device_setting_sync_server(guid, key, selected);
                        })
                        .catch((error)=>{
                            app.preloader.hide();
                            app.dialog.alert(error);
                        })
                        .then(()=>{
                            
                            params.obj.attr("setting-value", selected);
                            params.obj.find(".setting-value").html(_(selected+'%'));
                            app.preloader.hide();
                        })
                        .catch((err) => {
                            app.preloader.hide();
                            app.dialog.alert(err);
                        })
                    }catch(error){
                        app.preloader.hide();
                        app.dialog.alert(error);
                    }
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_mode_setup_min_brightness_picker.open();
    });
}
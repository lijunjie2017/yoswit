window.iot_mode_setup_check_device_connection = function(params) {
    const TAG = "iot_mode_setup_check_device_connection";
    const guid = params.ref;
    const rootEl = $("#mode-setup");
    const rootE2 = $("#mode-setup-v5");
    const page_el = $(".view .page");
    $(".bluetooth-icons").attr("ref", 2);
    console.log(TAG);
    rootEl.find(".button").addClass("disabled");
    rootEl.find(".toggle").addClass("disabled");
    console.log("rootE2",rootE2);
    rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".button").addClass("disabled");
    rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".toggle").addClass("disabled");
    //check if bluethooth is connect
    console.log("window.peripheral[guid].getProp()",window.peripheral[guid].getProp());
    debugger
    if(isset(window.peripheral[guid].getProp().rssi) && window.peripheral[guid].getProp().rssi != 0){
        window.peripheral[guid].prop.firmwareNo = '';
        window.peripheral[guid].prop.firmware = '';
    }
    // if(window.peripheral[guid].getProp().connected){
    //     $(".bluetooth-icons").attr("ref", 1);
    //     page_el.find('.iot-tip').remove();
    //     //page_el.find('.ptr-preloader').css('opacity', 0);
    //     rootEl.find(".button").removeClass("disabled");
    //     rootEl.find(".toggle").removeClass("disabled");
    //     setTimeout(()=>{
    //         rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".button").removeClass("disabled");
    //         rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".toggle").removeClass("disabled");
    //     },1000)
    // }else{
        peripheral[guid].connect().then((rs)=>{
            // ignore
            $(".bluetooth-icons").attr("ref", 1);
            page_el.find('.iot-tip').remove();
            //page_el.find('.ptr-preloader').css('opacity', 0);
            rootEl.find(".button").removeClass("disabled");
            rootEl.find(".toggle").removeClass("disabled");
            setTimeout(()=>{
                rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".button").removeClass("disabled");
                rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".toggle").removeClass("disabled");
                $('.read-firmware-box-text').text(window.peripheral[guid].prop.firmware);
            },1000)
        }).catch((error)=>{
            $(".bluetooth-icons").attr("ref", 0);
            let doms = $(".iot-tip")
            if(doms.length > 0){
                doms.remove();
            }
            if(error == 7200){
                erp.script.iot_entry_class_password_verify(guid).then(()=>{
                    $(".bluetooth-icons").attr("ref", 1);
                    rootEl.find(".button").removeClass("disabled");
                    rootEl.find(".toggle").removeClass("disabled");
                    setTimeout(()=>{
                        rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".button").removeClass("disabled");
                        rootE2.find(`.card[dependencies="Network and Bluetooth"]`).find(".toggle").removeClass("disabled");
                    },1000)
                })
            }else{
                app.dialog.alert(_(erp.get_log_description(error)));
            }
            
        })
        // iot_ble_check_enable().then(() => {
        //     return iot_ble_do_pre_action(guid);
        // }).then(() => {
            
        // }).catch(() => {
        //     $(".bluetooth-icons").attr("ref", 0);
        //     let doms = $(".iot-tip")
        //     if(doms.length > 0){
        //         doms.remove();
        //     }
        //     $('#mode-setup-v5').parent().prepend(`
        //     <div class="block-strong medium-inset iot-tip" style="background-color: rgb(257, 237, 238);text-align: center;z-index: 700;">
        //         <i class="icon material-icons info-icon" style="color: rgb(250, 83, 85);margin-right:10px;">info</i>
        //         <span>${ _('Device is out of setup range.') }</span>
        //     </div>`);
        //     //app.dialog.alert(_("Device is not here!"), runtime.appInfo.name, () => {});
        // });
    // }
}
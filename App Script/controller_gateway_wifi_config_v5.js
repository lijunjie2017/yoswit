window.gateway_wifi_vm = null;
window.controller_gateway_wifi_config = (guid,device_name)=>{
    console.log(guid)
    let ssid = tran("SSID");
    let password_name = tran("Password");
    let email = tran("Email");
    let server_url = tran("Server URI");
    let port = tran("Server Port");
    let username = tran("Server Username");
    let server_password = tran("Server Password");
    let wifi_tip = tran("Device supports 2.4 GHz Wi-Fi only.")
    try {
        if (window.gateway_wifi_vm) {
          window.gateway_wifi_vm.$destroy();
          window.gateway_wifi_vm = null;
        }
      } catch (err) {
        // ignore
    }
    window.gateway_wifi_vm = new Vue({
        el : '#gateway-wifi-config',
        components: {
            DeviceGatewaySettingComponent: window.device_gateway_setting_component,
            DeviceNetworkComponent: window.device_network_component
        },
        template:/*html*/`
        <div v-cloak>
        <a ref="sureChecked" href="#" class="link icon-only" @click="postToIotSsid">
            <i class="icon material-icons">done</i>
        </a>
        <a ref="iotChecked" href="#" class="link icon-only" @click="checkIotStatus">
            <i class="icon material-icons" :ref="bluetooth_status">bluetooth</i>
        </a>
            <div class="block mx-3 margin-top">
                <p class="segmented segmented-strong">
                    <button class="button step-one" :class="index == 1?'button-active button':'button'" @click="toTab(1)">Step 1</button>
                    <button class="button step-two" :class="index == 2?'button-active button':'button'" @click="toTab(2)">Step 2</button>
                    <button class="button step-three" :class="index == 3?'button-active button':'button'" @click="toTab(3)" v-if="loadindex">Step 3</button>
                    <span class="segmented-highlight"></span>
                </p>
            </div>
            <div class="tabs">
                <div id="step-1" class="view tab view-main" :class="[index == 1 ? 'tab-active' : '']" v-if="index == 1">
                    <div class="card">
                        <div class="card-header">
                            <div class="row ">
                                <div class="col-100">
                                    <h5 lang="en">Wi-Fi</h5>
                                </div>
                            </div>
                        </div>
                        <div class="card-content card-content-padding" style="padding-top:0;">
                            <div>
                                <div class="list">
                                    <ul>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="text"
                                                        name="ssid" 
                                                        v-model="setting.ssid"
                                                        :placeholder="ssid" 
                                                        required 
                                                        validate
                                                    />
                                                    <div class="item-input-info">{{wifi_tip}}</div>
                                                </div>
                                            </div>
                                        </li>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="text"
                                                        name="password" 
                                                        v-model="setting.ssid_password"
                                                        :placeholder="password_name"
                                                        required
                                                        validate
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-title item-label">{{email}}</div>
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        v-model="setting.email"
                                                        :placeholder="email" 
                                                        required 
                                                        validate
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card" style="display:none;">
                        <div class="card-header">
                            <div class="row ">
                                <div class="col-100">
                                    <h5 lang="en">Server Configuration</h5>
                                </div>
                            </div>
                        </div>
                        <div class="card-content card-content-padding">
                            <div>
                                <div class="list">
                                    <ul>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-title item-label">{{email}}</div>
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        v-model="setting.email"
                                                        :placeholder="email" 
                                                        required 
                                                        validate
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-title item-label">{{server_url}}</div>
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="text"
                                                        name="server_url" 
                                                        v-model="setting.server_url"
                                                        :placeholder="server_url" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-title item-label">{{port}}</div>
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="number"
                                                        name="port" 
                                                        v-model="setting.port"
                                                        :placeholder="port" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-title item-label">{{username}}</div>
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="text"
                                                        name="username" 
                                                        v-model="setting.username"
                                                        :placeholder="username"
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                        <li class="item-content item-input no-padding-left">
                                            <div class="item-inner no-padding-right">
                                                <div class="item-title item-label">{{server_password}}</div>
                                                <div class="item-input-wrap">
                                                    <input 
                                                        type="text"
                                                        name="server_password" 
                                                        v-model="setting.server_password"
                                                        :placeholder="server_password" 
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row" style="margin-bottom:15px;">
                        <div class="col">
                            <div class="button button-fill button-save" @click="toTab(2)">
                                NEXT STEP
                            </div>
                        </div>
                    </div>
                </div>
                <div id="step-2" class="view tab view-main" :class="[index == 2 ? 'tab-active' : '']" v-else-if="index == 2">
                <device-gateway-setting-component :gateway="\`\${mac_address}-\${setting.email}\`" :guid="guid"></device-gateway-setting-component>
                </div>
                <div id="step-3" class="view tab view-main" :class="[index == 3 ? 'tab-active' : '']" v-else-if="index == 3">
                    <device-network-component></device-network-component>
                </div>
            </div>
        </div>
        `,
        data : {
            loadindex : false,
            bluetooth_status : 1,
            index : 1,
            ssid : ssid,
            password_name : password_name,
            wifi_tip : wifi_tip,
            email : email,
            server_url : server_url,
            port : port,
            username : username,
            server_password : server_password,
            setting : {
                ssid : '',
                ssid_password : '',
                email : '',
                server_url : '',
                port : '',
                username : '',
                server_password : ''
            },
            mac_address : '',
            guid: guid,
        },
        mounted:function(){
            _emitter.off('loadindex');
            _emitter.on('loadindex',()=>{
                this.loadindex = true;
                this.toTab(3);
            })
            this.checkIotStatus();
            try {
                document.querySelector('.page-current .frappe-detail-right').appendChild(this.$refs.sureChecked);
            } catch (err) {
                // ignore
            }
            this.getDataFormErp();
            this.getServerData();
        },
        watch: {
            index: function (index) {
                if (index === 1) {
                    try {
                        this.$nextTick(() => {
                            document.querySelector('.page-current .frappe-detail-right').appendChild(this.$refs.sureChecked);
                        })
                    } catch (err) {
                        // ignore
                    }
                } else {
                    try {
                        $(this.$refs.sureChecked).remove();
                    } catch (err) {
                        // ignore
                    }
                }

                if (index === 2) {
                    this.$nextTick(() => {
                        const div = document.createElement('div')
                        div.id = 'device-network-group'

                        this.$refs.step2.innerHTML = ''
                        this.$refs.step2.appendChild(div)

                        setTimeout(() => {
                            window.controller_device_network_v3();
                        }, 0);
                    })
                } else {
                    try {
                        window.device_network_vm.$destroy();
                        window.device_network_vm = null;
                    } catch (err) {
                        // ignore
                    }
                }
            }
        },
        methods:{
            async checkIotStatus(){
                iot_ble_check_enable()
                .then(() => {
                    try {
                        $(this.$refs.iotChecked).remove();
                    } catch (err) {
                        // ignore
                    }
                    return iot_ble_do_pre_action(guid);
                })
                .then(()=>{
                    try {
                        document.querySelector('.page-current .frappe-detail-right').appendChild(this.$refs.sureChecked);
                    } catch (err) {
                        // ignore
                    }
                })
                .catch((err)=>{
                    this.bluetooth_status = 0;
                    try {
                        $(this.$refs.sureChecked).remove();
                    } catch (err) {
                        // ignore
                    }
                    try {
                        document.querySelector('.page-current .frappe-detail-right').appendChild(this.$refs.iotChecked);
                    } catch (err) {
                        // ignore
                    }
                })
            },
            async getDataFormErp(){
                let url = encodeURI(`/api/resource/Device/${guid}`);
                let device = await http.request(url,{
                    method: 'GET',
                    responseType: 'json',
                });
                let device_settings = [];
                try{
                    if(device.data){
                        device_settings = device.data.data.settings;
                        this.mac_address = device.data.data.mac_address;
                    }
                    let setting_type = [];
                    device_settings.forEach((setting_item)=>{
                        setting_type.push(setting_item.setting_type)
                        if(setting_item.setting_type == 'Wifi SSID'){
                            this.setting.ssid = setting_item.setting;
                        }
                        if(setting_item.setting_type == 'Wifi Password'){
                            this.setting.ssid_password = setting_item.setting;
                        }
                        if(setting_item.setting_type == 'Email Address'){
                            this.setting.email = setting_item.setting;
                        }
                        if(setting_item.setting_type == 'Server URI'){
                            this.setting.server_url = setting_item.setting;
                        }
                        if(setting_item.setting_type == 'Server Port'){
                            this.setting.port = setting_item.setting;
                        }
                        if(setting_item.setting_type == 'Server Username'){
                            if(setting_item.setting != 'null'){
                                this.setting.username = setting_item.setting;
                            }
                        }
                        if(setting_item.setting_type == 'Server Password'){
                            if(setting_item.setting != 'null'){
                                this.setting.server_password = setting_item.setting;
                            }
                        }
                        
                    })
                    if(setting_type.indexOf("Wifi SSID") == -1){
                       let wifi_config = await WifiWizard2.getConnectedSSID();
                       this.setting.ssid = wifi_config;
                    }
                }catch(err){

                }
            },
            getServerData(){
                if(!this.setting.email){
                    this.setting.email = frappe.user.data.username;
                }
                if(!this.setting.server_url){
                    this.setting.server_url = "mqtt://" + runtime.appConfig.mqtt_server;
                }
                if(!this.setting.port){
                    this.setting.port = runtime.appConfig.mqtt_port;
                }
            },
            getPrintFormatData(){
                iot_ble_check_enable()
                .then(() => {
                    return iot_ble_do_pre_action(guid);
                }).catch((err)=>{

                })
            },
            postToIotSsid(){
                console.log('comming');
                //save data to iot-wifi
                if(!this.setting.ssid || !this.setting.ssid_password){
                    return
                }
                iot_ble_check_enable()
                .then(() => {
                    return iot_ble_do_pre_action(guid);
                })
                .then(() => {
                    this.totastTool(tran("Upload Wi-Fi Data..."))
                    // ssid
                    const data = '932000' + this.setting.ssid.length.toString(16).pad('0000') + this.setting.ssid.convertToHex();
                    return iot_ble_write(guid, 'ff80', 'ff81', data, false);
                })
                .then(() => {
                    const data = '932100' + this.setting.ssid_password.length.toString(16).pad('0000') + this.setting.ssid_password.convertToHex();
                    return iot_ble_write(guid, 'ff80', 'ff81', data, false);
                })
                .then(() => {
                    return iot_device_setting_sync_server(guid, null, null, true, {
                      'Wifi SSID': this.setting.ssid,
                      'Wifi Password': this.setting.ssid_password,
                    });
                })
                .then(() => {
                    this.totastTool(tran("Upload Wi-Fi Data Successful."))
                    this.postToIotServer();
                })
                .catch((err) => {
                    app.preloader.hide();
                    if (!iot_ble_exception_message(err, false) && !core_server_exception_message(err)) {
                      app.dialog.alert(err, runtime.appInfo.name);
                    }
                });
            },
            postToIotServer(){
                this.totastTool(tran("Upload Email Data..."))
                const data = "932200" + (this.setting.email.length.toString(16).pad("0000")) + this.setting.email.convertToHex();
                iot_ble_write(guid, "ff80", "ff81", data, false)
                .then(()=>{
                    return iot_device_setting_sync_server(guid, 'Email Address', this.setting.email || "null");
                })
                .then(()=>{
                    let mac = core_utils_get_mac_address_from_guid(guid,false);
                    //update profile device
                    let url = `/api/resource/Profile%20Device/${device_name}`;
                    let method = "PUT";
                    let data = {
                        parenttype:'Profile',
                        parent:frappe.user.data.app_profile_id,
                        parentfield:'profile_device',
                        gateway : `${mac.toLowerCase()}-${frappe.user.data.currentUsername}`
                    }
                    return http.request(url,{
                        method: method,
                        dataType: 'json',
                        serializer: "json",
                        data:data,
                        contentType:'application/json',
                    });
                })
                .then(()=>{
                    this.totastTool(tran("Upload Server Port..."))
                    const data = "9301000002" + (this.setting.port * 1).toString(16).pad("0000");
                    return iot_ble_write(guid, "ff80", "ff81", data, false);
                })
                .then(()=>{
                    return iot_device_setting_sync_server(guid, 'Server Port', this.setting.port || null);
                })
                .then(()=>{
                    this.totastTool(tran("Upload Server URI..."))
                    const data = "930000" + (this.setting.server_url.length.toString(16).pad("0000")) + this.setting.server_url.convertToHex();
                    return iot_ble_write(guid, "ff80", "ff81", data, false);
                })
                .then(()=>{
                    return iot_device_setting_sync_server(guid, 'Server URI', this.setting.server_url || null);
                })
                .then(()=>{
                    const data = "930200" + (this.setting.username.length.toString(16).pad("0000")) + this.setting.username.convertToHex();
                    return iot_ble_write(guid, "ff80", "ff81", data, false);
                })
                .then(()=>{
                    return iot_device_setting_sync_server(guid, 'Server Username', this.setting.username || 'null');
                })
                .then(()=>{
                    const data = "930300" + (this.setting.server_password.length.toString(16).pad("0000")) + this.setting.server_password.convertToHex();
                    return iot_ble_write(guid, "ff80", "ff81", data, false);
                })
                .then(()=>{
                    return iot_device_setting_sync_server(guid, 'Server Password', this.setting.server_password || 'null');
                })
                .then(()=>{
                    this.totastTool(tran("Upload Successful!"));
                    return iot_ble_write(guid, "ff80", "ff81", "810E");
                })
                .catch((err) => {
                    this.totastTool(tran("Upload Failed!"));
                    app.preloader.hide();
        
                   if (!iot_ble_exception_message(err, false) && !core_server_exception_message(err)) {
                        app.dialog.alert(err, runtime.appInfo.name);
                   }
                })
            },
            totastTool(load_text){
                //let icon = success_icon?'done':'hourglass_top';
                toastIcon = window.app.toast.create({
                    text: load_text,
                    position: 'center',
                    closeTimeout: 2000,
                });
                toastIcon.open();
            },
            toTab(index){
                this.index = index;
            }
        }
    })
}
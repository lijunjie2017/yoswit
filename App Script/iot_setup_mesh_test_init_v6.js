window.iot_setup_mesh_test_init_picker = {};
window.iot_mesh_config = null;
window.iot_setmesh_current_step = 0;
window.iot_setmesh_current_guid = '';
window.iot_setmesh_processing = false;
window.iot_setmesh_produce_timer = null;
window.iot_setmesh_scan_count = 0;
window.iot_mesh_selected_id = '';
window.iot_mesh_current_guid = '';
window.iot_setup_mesh_test_init = async function(params) {
    const TAG = ">>>> iot_setup_mesh_test_init";

    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=mesh_test]");
    iot_mesh_current_guid = guid;
    
    
    function exportNetwork(){
    	return new Promise((resolve, reject) => {
            ble.exportNetwork((rs)=>{
                resolve(JSON.parse(rs));
            }, ()=>{
                reject();
            })
    	});
    }
    
    function importNetwork(config){
    	return new Promise((resolve, reject) => {
            ble.importNetwork(config, (rs)=>{
                resolve();
            }, ()=>{
                reject();
            })
    	});
    }
    
    try{
        iot_mesh_config = JSON.parse(erp.info.profile.mesh_config);
        // debugger
        if(!isset(iot_mesh_config.networks)){
            let network_config = JSON.parse(erp.info.profile.mesh_config);
            iot_mesh_config = {networks:{}};
            
            if(isset(network_config.meshUUID)){
                iot_mesh_config.networks[network_config.meshUUID] = network_config;
            }
            // debugger
        }
    }catch(error){
        iot_mesh_config = {networks:{}};
        
        // let network_config = await exportNetwork();
        // if(isset(network_config.meshUUID)){
        //     iot_mesh_config.networks[network_config.meshUUID] = network_config;
        // }
    }
    

    let meshNetworks = [[], []];
    let count = 0;
    for(let i in iot_mesh_config.networks){
        meshNetworks[0].push(i);
        meshNetworks[1].push("Network "+(++count));
    }
    meshNetworks[0].push(-1);
    meshNetworks[1].push("+ New Network");
    
    iot_setup_mesh_test_init_picker = app.picker.create({
        inputEl: inputEl,
        cols: [
            {
                textAlign: "center",
                values: meshNetworks[0],
                displayValues: meshNetworks[1]
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
                iot_setup_mesh_test_init_picker.setValue([params.obj.attr("setting-value")]);
                $(picker.$el.find(".toolbar-save-link")).on("click", async() => {
                    iot_setup_mesh_test_init_picker.close();

                    const selected = inputEl.val();
                    
                    app.sheet.create({
                        content: `
                            <div class="sheet-modal" style="height:auto">
                            	<div class="sheet-modal-inner">
                            		<div class="swipe-handler"></div>
                            		<div class="page-content">
                            			<div class="list list-strong list-outline list-dividers-ios">
                            				<ul class="setmesh-steps-list">
                            					<li class="setmesh-steps setmesh-step1">
                            						<div class="item-content">
                            							<div class="item-inner">
                            								<div class="item-title">${_("Step 1: Initialising mesh network")}</div>
                            								<div class="item-after">
                            									<i class="icon material-icons">watch_later</i>
                            								</div>
                            							</div>
                            						</div>
                            					</li>
                            					<li class="setmesh-steps setmesh-step2">
                            						<div class="item-content">
                            							<div class="item-inner">
                            								<div class="item-title">${_("Step 2: Identifing Node")}</div>
                            								<div class="item-after">
                            									<i class="icon material-icons">watch_later</i>
                            								</div>
                            							</div>
                            						</div>
                            					</li>
                            					<li class="setmesh-steps setmesh-step3">
                            						<div class="item-content">
                            							<div class="item-inner">
                            								<div class="item-title">${_("Step 3: Start Provisioning")}</div>
                            								<div class="item-after">
                            									<i class="icon material-icons">watch_later</i>
                            								</div>
                            							</div>
                            						</div>
                            					</li>
                            					<li class="setmesh-steps setmesh-step4">
                            						<div class="item-content">
                            							<div class="item-inner">
                            								<div class="item-title">${_("Step 4: Scanning Provisioned Node")}</div>
                            								<div class="item-after">
                            									<i class="icon material-icons">watch_later</i>
                            								</div>
                            							</div>
                            						</div>
                            					</li>
                            					<li class="setmesh-steps setmesh-step5">
                            						<div class="item-content">
                            							<div class="item-inner">
                            								<div class="item-title">${_("Step 5: Bind App Key")}</div>
                            								<div class="item-after">
                            									<i class="icon material-icons">watch_later</i>
                            								</div>
                            							</div>
                            						</div>
                            					</li>
                            				</ul>
                            			</div>
                        			<div class="block setmesh-remaining-time" style="text-align:center;">
                            				${_("Remaining time: ")}<font>30</font>${_("s")}
                        			</div>
                            		</div>
                            	</div>
                            </div>
                        `,
                        on: {
                            closed: function () {
                                // clearTimeout(manufacturing_produce_timer);
                                if(iot_setmesh_processing){
                                    app.dialog.alert(_("Set mesh interrupted, please reset mesh and restart the process!"));
                                }
                                iot_setmesh_processing = false;
                            }
                        },
                        swipeToClose: true,
                        push: true,
                        backdrop: true,
                    }).open();
                    
                    
                    
                    iot_setmesh_processing = true;
                    iot_mesh_retry = 0;
                    iot_setmesh_current_step = 0;
                    iot_setup_mesh_update_step(1);
                    setmesh_start_produce_timer(40);
                    if(selected == '-1' || !isset(iot_mesh_config['networks'][selected])){
                        window.iot_mesh_selected_id = selected;
                        console.log("ble.createNetwork");
                        
                        const provisionerUUid = generateUUIDv4();
                        console.log("provisionerUUid="+provisionerUUid);
                        const newNetworkConfig = `{
                        	"$schema": "http://json-schema.org/draft-04/schema#",
                        	"id": "https://www.bluetooth.com/specifications/specs/mesh-cdb-1-0-1-schema.json#",
                        	"version": "1.0.1",
                        	"meshUUID": "${generateUUIDv4()}",
                        	"meshName": "nRF Mesh Network",
                        	"timestamp": "${getCurrentISOFormat()}",
                        	"partial": false,
                        	"netKeys": [
                        		{
                        			"name": "Network Key 1",
                        			"index": 0,
                        			"key": "${generateMeshKey()}",
                        			"phase": 0,
                        			"minSecurity": "insecure",
                        			"timestamp": "${getCurrentISOFormat()}"
                        		}
                        	],
                        	"appKeys": [
                        		{
                        			"name": "Application Key 1",
                        			"index": 0,
                        			"boundNetKey": 0,
                        			"key": "${generateMeshKey()}"
                        		}
                        	],
                        	"provisioners": [
                        		{
                        			"provisionerName": "nRF Mesh Provisioner",
                        			"UUID": "${provisionerUUid}",
                        			"allocatedUnicastRange": [
                        				{
                        					"lowAddress": "0001",
                        					"highAddress": "199A"
                        				}
                        			],
                        			"allocatedGroupRange": [
                        				{
                        					"lowAddress": "C000",
                        					"highAddress": "CC9A"
                        				}
                        			],
                        			"allocatedSceneRange": [
                        				{
                        					"firstScene": "0001",
                        					"lastScene": "3333"
                        				}
                        			]
                        		}
                        	],
                        	"nodes": [
                        		{
                        			"UUID": "${provisionerUUid}",
                        			"name": "nRF Mesh Provisioner",
                        			"deviceKey": "${generateMeshKey()}",
                        			"unicastAddress": "0001",
                        			"security": "insecure",
                        			"configComplete": false,
                        			"cid":"004C",
                        			"configComplete":true,
                        			"crpl":"7FFF",
                        			"features": {
                        				"friend": 2,
                        				"lowPower": 2,
                        				"proxy": 2,
                        				"relay": 2
                        			},
                        			"defaultTTL": 5,
                        			"netKeys": [
                        				{
                        					"index": 0,
                        					"updated": false
                        				}
                        			],
                        			"appKeys": [],
                        			"elements": [
                        				{
                        					"name": "Element: 0x0001",
                        					"index": 0,
                        					"location": "0000",
                        					"models": [
                        						{
                        							"modelId": "0001",
                        							"bind": [],
                        							"subscribe": []
                        						}
                        					]
                        				}
                        			],
                        			"excluded": false
                        		}
                        	],
                        	"groups": [],
                        	"scenes": [],
                        	"networkExclusions": []
                        }`;
                        console.log("newNetworkConfig="+newNetworkConfig);
                        
                        iot_setmesh_scan_count = 0;
                        ble.importNetwork(newNetworkConfig, function(){
                            // setTimeout(function(){
                            //     iot_set_mesh_step1(guid, 0);
                            // }, 500);
                            // alert("ble.createNetwork successfully");
                            
                            bleManager.scan(async (p)=>{
                                if(p.id==window.peripheral[guid].getProp().id){
                                    iot_setmesh_scan_count++; 
                                    if(iot_setmesh_scan_count>=6){ 
                                        await bleManager.stopScan(); 
                                        bleManager.clear();
                                        iot_setup_mesh_update_step(2, guid); 
                                    }
                                }
                            });
                        }, function(e){
                            alert("E2:"+e);
                        });
                    }else{
                        console.log("ble.importNetwork");
                        window.iot_mesh_selected_id = selected;
                        let nodearray = [];
                        let nodedetail = {};
                        
                        iot_mesh_config['networks'][selected]['nodes'][0]['cid'] = "004C"
                        iot_mesh_config['networks'][selected]['nodes'][0]['configComplete'] = true
                        iot_mesh_config['networks'][selected]['nodes'][0]['crpl'] = "7FFF"

                        for(let nnn in iot_mesh_config['networks'][selected]['nodes']){
                            const node = iot_mesh_config['networks'][selected]['nodes'][nnn];
                            console.log(JSON.stringify(node));
                            if(!isset(nodedetail[node.UUID]))
                                nodearray.push(node.UUID)
                            nodedetail[node.UUID] = node;
                        }
                        let newnodearray = [];
                        for(let nnn in nodearray){
                            newnodearray.push(nodedetail[nodearray[nnn]])
                        }
                        iot_mesh_config['networks'][selected]['nodes'] = newnodearray;
                        
                        iot_setmesh_scan_count = 0;
                        ble.importNetwork(JSON.stringify(iot_mesh_config['networks'][selected]), function(){
                            // iot_setup_mesh_update_step(2, guid);
                            // setTimeout(function(){
                            //     iot_set_mesh_step1(guid, 0);
                            // }, 500);
                            // alert("ble.importNetwork successfully");
                            bleManager.scan(async (p)=>{
                                if(p.id==window.peripheral[guid].getProp().id){
                                    iot_setmesh_scan_count++; 
                                    if(iot_setmesh_scan_count>=6){ 
                                        await bleManager.stopScan(); 
                                        bleManager.clear();
                                        iot_setup_mesh_update_step(2, guid); 
                                    }
                                }
                            });
                        }, function(e){
                            alert("E2:"+e);
                        });
                    }
                    let network_id = get_mesh_network_id(selected);
                    params.obj.attr("setting-value", 'Mesh Network '+network_id);
                    params.obj.find(".setting-value").html(_('Mesh Network '+network_id));
                    return;
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_setup_mesh_test_init_picker.open();
    });
}



window.iot_setup_mesh_update_step = (step, guid) => {
    if(step==6){
        clearTimeout(setmesh_produce_timer);
        iot_setmesh_processing = false;
        
        $('.setmesh-remaining-time').attr('style','text-align:center;color:green;');
        $('.setmesh-remaining-time').html(_("Set mesh completed!"));
    }else if(step==2){ //import/create network successfully
        iot_setmesh_current_step = 2;
        clearTimeout(setmesh_produce_timer);
        iot_setmesh_processing = false;
        
        iot_setmesh_current_guid = guid;
        $('.setmesh-remaining-time').html(`Network init successfully.<br /><a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_identify" ref="${guid}">${_("Identify")}</a>`);
    }else if(step==3){ //
        iot_setmesh_current_step = 3;
        clearTimeout(iot_setup_mesh_identify_timeout)
        if(isset(setmesh_produce_timer)){
            clearTimeout(setmesh_produce_timer);
        }else{
            emitter.emit("mesh/identify",{code:200})
        }
        iot_setmesh_processing = false;
        
        iot_setmesh_current_guid = guid;
        $('.setmesh-remaining-time').html(`Identify successfully.<br /><a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_provisioning" ref="${guid}">${_("Start Provisioning")}</a>`);
    }
    for(let i=1; i<=5; i++){
        if(i<step){
            $('.setmesh-step'+i).addClass('done');
            $('.setmesh-step'+i).find('.icon').removeClass('spin_icon').attr('style','font-weight:bold;color:green').html('done');
        }else if(i==step){
            $('.setmesh-step'+i).removeClass('done');
            $('.setmesh-step'+i).find('.icon').addClass('spin_icon').attr('style','').html('autorenew');
        }else{
            $('.setmesh-step'+i).removeClass('done');
            $('.setmesh-step'+i).find('.icon').removeClass('spin_icon').attr('style','').html('watch_later');
        }
    }
};


window.setmesh_start_produce_timer = (second, e, retry) => {
    if(second==0){
        clearTimeout(setmesh_produce_timer);
    }
    $('.setmesh-remaining-time').find('font').html(second);
    if(second>0){
        setmesh_produce_timer = setTimeout(function(){
            setmesh_start_produce_timer(second-1);
        }, 1000);
    }else{
        if(iot_setmesh_current_step==2){
            $('.setmesh-remaining-time').html(`Identify failed, you can reset this device or click below button<br /><a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_identify" ref="${iot_setmesh_current_guid}">${_("Retry")}</a>  <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
        }else if(iot_setmesh_current_step==3){
            $('.setmesh-remaining-time').html(`Provisioning timeout, you must reset it before you set mesh again.  <a class="button button-raised button-fill" style="margin:10px 20px 0px 20px color-red" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
        }
        
        $('.setmesh-steps').each(function(){
            if($(this).hasClass('done')) return;
            
            $(this).find('.icon').removeClass('spin_icon').attr('style','font-weight:bold;color:red').html('close')
        });
        // if(iot_setmesh_processing){
        //     iot_setmesh_processing = false;
        //     $('.setmesh-remaining-time').attr('style','text-align:center;color:red;');
        //     if(isset(e)){
        //         if(!isset(retry) || retry){
        //             $('.setmesh-remaining-time').html(_(e)+`<br /><br /><a href="#" func="setmesh_retry">Retry</a>`);
        //         }else{
        //             $('.setmesh-remaining-time').html(_(e));
        //         }
        //     }else{
        //         $('.setmesh-remaining-time').html(_("Set mesh failed, please try again."));
        //     }
        //     $('.setmesh-steps').each(function(){
        //         if($(this).hasClass('done')) return;
                
        //         $(this).find('.icon').removeClass('spin_icon').attr('style','font-weight:bold;color:red').html('close')
        //     });
        // }
    }
}


window.setmesh_retry = () => {
    iot_setmesh_processing = true;
    $('.setmesh-remaining-time').attr('style','text-align:center;');
    $('.setmesh-remaining-time').html(`${_("Remaining time: ")}<font>30</font>${_("s")}`);
    iot_setup_mesh_update_step(2);
    setmesh_start_produce_timer(40);
    iot_set_mesh_step1(iot_mesh_selected_guid, 0);
};



window.generateUUIDv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0; // 生成 0-15 的随机整数
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // 对 'y' 设置固定高位为 1000（符合 UUID v4 规范）
    return v.toString(16);
  });
};


window.generateMeshKey = () => {
  return Array.from({length: 32}, () => 
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
}


window.getCurrentISOFormat = () => {
  const date = new Date();
  
  // 补零函数
  const pad = (n) => String(n).padStart(2, '0');
  
  // 获取日期时间组件
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  // 计算时区偏移
  const timezoneOffset = -date.getTimezoneOffset(); // 转换为正数偏移
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);
  const offsetSign = timezoneOffset >= 0 ? '+' : '-';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
};


window.iot_setup_mesh_identify_timeout = null;
window.iot_setup_mesh_identify = async (params) => {
    $('.setmesh-remaining-time').html(`<a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#">${_("Identifying")} (<font></font>) ...</a>`);
    setmesh_start_produce_timer(15);
    const guid = params.ref;
    
    console.log("Identify disconnect");
    window.peripheral[guid].disconnect().then(()=>{
        setTimeout(function(){
            window.peripheral[guid].identify().then(()=>{
                console.log("Identify success");
                iot_setup_mesh_identify_timeout = setTimeout(()=>{
                    clearTimeout(setmesh_produce_timer);
                    $('.setmesh-remaining-time').html(`Identify failed, you can reset this device or click below button<br /><a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_identify" ref="${guid}">${_("Retry")}</a> <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
                }, 3000);
            }, (e)=>{
                console.log(e);
                clearTimeout(setmesh_produce_timer);
                if(e=='Found 2ade'){
                    $('.setmesh-remaining-time').html(`Char 2ade is found. Seem this device's mesh setup is done, please reset it if you set mesh again. <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
                }else{
                    $('.setmesh-remaining-time').html(`This device is not support mesh or mesh setup is done, please reset it before you set mesh again. <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
                }
            });
        }, 1000)
    }, ()=>{
        setTimeout(function(){
            window.peripheral[guid].identify().then(()=>{
                console.log("Identify success");
                iot_setup_mesh_identify_timeout = setTimeout(()=>{
                    clearTimeout(setmesh_produce_timer);
                    $('.setmesh-remaining-time').html(`Identify failed, you can reset this device or click below button<br /><a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_identify" ref="${guid}">${_("Retry")}</a>`);
                }, 3000);
            }, (e)=>{
                console.log(e);
                clearTimeout(setmesh_produce_timer);
                if(e=='Found 2ade'){
                    $('.setmesh-remaining-time').html(`Char 2ade is found. Seem this device's mesh setup is done, please reset it if you set mesh again. <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
                }else{
                    $('.setmesh-remaining-time').html(`This device is not support mesh or mesh setup is done, please reset it before you set mesh again. <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
                }
            });
        }, 1000)
    });
};


window.iot_setup_mesh_provisioning = async (params) => {
    $('.setmesh-remaining-time').html(`<a class="button button-raised button-fill" style="margin:10px 20px 0px 20px" href="#">${_("Provisioning")} (<font></font>) ...</a>`);
    setmesh_start_produce_timer(60);
    const uuid = params.ref
    
    ble.startProvisioning(
		uuid, 0,
		async (rs) => {
            //update the profile device
            let profile_device = cloneDeep(erp.info.profile.profile_device);
            //get the selected network id
            let network_id = get_mesh_network_id(window.iot_mesh_selected_id);
            profile_device.forEach(item=>{
                if(item.device == iot_mesh_current_guid){
                    item.network_id = parseInt(network_id)+100;
                }
            })
            // debugger
		    console.log("====> network = "+rs)
		    rs = JSON.parse(rs);
		    iot_mesh_config['networks'][rs.meshUUID] = rs
            await http.request(encodeURI('/api/resource/Profile/' + erp.info.profile.name), {
                method: 'PUT',
                serializer: 'json',
                data: {
                    mesh_config:JSON.stringify(iot_mesh_config),
                    profile_device:profile_device
                }
            });
            
            erp.info.profile.mesh_config = JSON.stringify(iot_mesh_config);
            await iot_device_setting_sync_server(iot_mesh_current_guid, 'Mesh Test', 'Mesh Network '+network_id);
            app.preloader.hide();
            await ha_profile_ready();
            iot_setup_mesh_update_step(6);
		}, (e) => {
		 //   app.preloader.hide();
		 
            clearTimeout(setmesh_produce_timer);
            // setmesh_start_produce_timer(0, "Provisioning failed");
            $('.setmesh-remaining-time').html(`Provisioning failed, you must reset it before you set mesh again. <a class="button button-raised button-fill color-red" style="margin:10px 20px 0px 20px" href="#" func="iot_setup_mesh_reset" ref="">${_("Reset")}</a>`);
		}
	);
};

window.get_mesh_network_id = (mesh_id) => {
    let network_id = 0;
    let count = 0;
    for(let i in iot_mesh_config.networks){
        ++count
        if(i == mesh_id){
            network_id = count;
            break;
        }
    }
    if(mesh_id == '-1'){
        let num = 0;
        for(let i in iot_mesh_config.networks){
            num++;
        }
        return num+1;
    }else{
        return network_id;
    }
    
}

window.iot_setup_mesh_reset = async () => {
    app.sheet.close();
    $("*[func=iot_device_reset]").trigger('click')
};

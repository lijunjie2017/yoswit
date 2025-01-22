window.iot_setup_mesh_test_init_picker = {};
window.iot_mesh_config = null;
window.iot_setmesh_current_step = 0;
window.iot_setmesh_processing = false;
window.iot_setmesh_produce_timer = null;
window.iot_setup_mesh_test_init = async function(params) {
    const TAG = ">>>> iot_setup_mesh_test_init";

    const guid = params.ref;
    const button_group = params.obj.attr("button-group");
    const setting_type = params.obj.attr("setting-type");
    const slot_index = params.obj.attr("slot-index")?params.obj.attr("slot-index"):0;
    const inputEl = params.obj.find("input[name=mesh_test]");
    
    // // // alert(erp.info.profile.mesh_config)
    // if(erp.info.profile.name=='5a5628f34b'){
    //     // alert(erp.info.profile.mesh_config);
    //     const mesh_config = JSON.parse(erp.info.profile.mesh_config);
    //     alert(mesh_config['$schema']);
    // }
    
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
        if(!isset(iot_mesh_config.networks)){
            let network_config = JSON.parse(erp.info.profile.mesh_config);
            iot_mesh_config = {networks:{}};
            
            if(isset(network_config.meshUUID)){
                iot_mesh_config.networks[network_config.meshUUID] = network_config;
            }
        }
    }catch(error){
        iot_mesh_config = {networks:{}};
        
        let network_config = await exportNetwork();
        if(isset(network_config.meshUUID)){
            iot_mesh_config.networks[network_config.meshUUID] = network_config;
        }
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
                    // if(selected == 'Network Key'){
                    //     window.network_key_fun_test();
                    // }else if(selected == 'App Key'){
                    //     window.app_key_fun_test();
                    // }else if(selected == 'Provision'){
                    //     window.provision_fun_test();
                    // }
                    
                    
                    
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
                        console.log("ble.createNetwork");
                        ble.createNetwork(function(rs){
                            iot_setup_mesh_update_step(2);
                            setTimeout(function(){
                                iot_set_mesh_step1(guid, 0);
                            }, 2000);
                        }, function(e){
                            alert("E1:"+e);
                        });
                    }else{
                        console.log("ble.importNetwork");
                        ble.importNetwork(JSON.stringify(iot_mesh_config['networks'][selected]), function(){
                            iot_setup_mesh_update_step(2);
                            setTimeout(function(){
                                iot_set_mesh_step1(guid, 0);
                            }, 500);
                        }, function(e){
                            alert("E2:"+e);
                        });
                    }
                    params.obj.attr("setting-value", selected);
                    params.obj.find(".setting-value").html(_(selected));
                    return;
                });
            }
        }
    });

    params.obj.find("#action").on("click", () => {
        iot_setup_mesh_test_init_picker.open();
    });
}



window.iot_setup_mesh_update_step = (step) => {
    if(step==6){
        clearTimeout(setmesh_produce_timer);
        iot_setmesh_processing = false;
        
        $('.setmesh-remaining-time').attr('style','text-align:center;color:green;');
        $('.setmesh-remaining-time').html(_("Set mesh completed!"));
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
    $('.setmesh-remaining-time').find('font').html(second);
    if(second>0){
        setmesh_produce_timer = setTimeout(function(){
            setmesh_start_produce_timer(second-1);
        }, 1000);
    }else{
        if(iot_setmesh_processing){
            iot_setmesh_processing = false;
            $('.setmesh-remaining-time').attr('style','text-align:center;color:red;');
            if(isset(e)){
                if(!isset(retry) || retry){
                    $('.setmesh-remaining-time').html(_(e)+`<br /><br /><a href="#" func="setmesh_retry">Retry</a>`);
                }else{
                    $('.setmesh-remaining-time').html(_(e));
                }
            }else{
                $('.setmesh-remaining-time').html(_("Set mesh failed, please try again."));
            }
            $('.setmesh-steps').each(function(){
                if($(this).hasClass('done')) return;
                
                $(this).find('.icon').removeClass('spin_icon').attr('style','font-weight:bold;color:red').html('close')
            });
        }
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


















window.iot_setup_mesh_test_init_picker = {};
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
    
    let mesh_config = null;
    try{
        mesh_config = JSON.parse(erp.info.profile.mesh_config);
        await importNetwork(erp.info.profile.mesh_config);
    }catch(error){
        mesh_config = await exportNetwork();
    }
    

    let meshNetworks = [[], []];
    for(let i in mesh_config.netKeys){
        let n = mesh_config.netKeys[i];
        meshNetworks[0].push(i);
        meshNetworks[1].push(n.name.replaceAll(" Key ", " "));
    }
    meshNetworks[0].push(-1);
    meshNetworks[1].push("+ New Network");
    // if(erp.info.profile.name=='5a5628f34b'){
    //     alert(JSON.stringify(meshNetworks));
    // }
    
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
                    iot_mesh_retry = 0;
                    iot_set_mesh_step1(guid, selected);
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
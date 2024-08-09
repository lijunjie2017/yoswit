window.controller_home_device_click = function(params){
    const TAG = "ERP >>> controller_home_device_click";
    l(TAG, params.obj.attr('config'));
    let configString = params.obj.attr('config');
    let ip = params.obj.closest('li').attr('ip');
    
    if(configString!=""){
        let config = configString.split("|");
        let temp = config[0].split(".");
        let deviceCode = temp[0];
        let tagCode = temp[1];
        
        l(TAG, tagCode);
        if(configString.includes("Lighting Scene")){
            controller_home_device_control_bacnet_lighting_scene(params);
        }else if(configString.includes("AS-P_")){
            controller_home_device_control_bacnet_air_conditioner(params);
        }else if(configString.startsWith("johnson_controls|")) {
            controller_home_device_control_johnson_control(params);
        }else if(configString.startsWith("intesis|")) {
            controller_home_device_control_intesis(params);
        }
    }
};
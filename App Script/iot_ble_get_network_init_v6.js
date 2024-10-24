window.iot_ble_get_network_init = (guid)=>{
    //get the network info,this guid is oldguid
    let command = [];
    let profile_device = cloneDeep(erp.info.profile.profile_device);
    let network_id = '';
    let network_position = '';
    profile_device.forEach(item=>{
        if(item.device == guid){
            network_id = item.network_id;
            network_position = item.network_position;
        }
    });
    if(network_id){
        let networkIdList = profile_device.filter((e)=>e.network_id == network_id && e.network_id != 0).sort((a,b)=>{
			return a.network_position-b.network_position;
		});
        let headBytes = '';
		let tailBytes = '';
        if(network_position == 0){
			headBytes= `8500010000000000000000000000`;
			tailBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position)+1].device,true).toLowerCase()}0100000000`;
		}else if(network_position == networkIdList.length-1){
			headBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position)-1].device,true).toLowerCase()}0000000000`;
			tailBytes = `8500010000000000000100000000`;
		}else{
			headBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position)-1].device,true).toLowerCase()}0000000000`;
			tailBytes = `850001${core_utils_get_mac_address_from_guid(networkIdList[parseInt(network_position)+1].device,true).toLowerCase()}0100000000`;
		}
        let meshCommands = ['85000000', '850200', tailBytes, '850201', headBytes, '850200'];
        command = meshCommands;
    }
    return command;
}
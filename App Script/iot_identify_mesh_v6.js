window.iot_mesh_retry = 0;
window.iot_mesh_current_step = 0;
window.iot_mesh_selected_appKeyIndex = -1;
window.iot_mesh_selected_guid = "";
window.iot_set_mesh_step1 = async (guid, appKeyIndex)=>{
    iot_mesh_selected_guid = guid;
    iot_mesh_selected_appKeyIndex = appKeyIndex;
    let uuid = window.peripheral[guid].prop.id;
    iot_mesh_current_step = 1;
    // await bleManager.stopScan(()=>{});
    
    //app.preloader.show();
    console.log("identify disconnect 2");
    window.peripheral[guid].disconnect().then(()=>{
        window.peripheral[guid].identify().then(()=>{
        }, ()=>{
            setmesh_start_produce_timer(0, "There is a problem in setting mesh, please reset the mesh and retry", false);
        });
    }, ()=>{
        window.peripheral[guid].identify().then(()=>{
        }, ()=>{
            setmesh_start_produce_timer(0, "There is a problem in setting mesh, please reset the mesh and retry", false);
        });
    });
//     try{
// 		setTimeout(async ()=>{
//             // //reset mesh
//             // let data = `931200000101`;
//             // await window.peripheral[guid].write([{
//             //     service: 'ff80',
//             //     characteristic: 'ff81',
//             //     data: data,
//             // }]);
            
//             function identifyNode(){
//                 var identify_timer = setTimeout(() => {
//                     console.log("identify_timer");
//                     ble.identifyNode(
//                         uuid,
//                         () => {
                            
//                         },
//                         (e) => {
//                             alert("E:"+e);
//                         }
//                     );
//                 }, 2000);
            
//     //             console.log("startNotification");
//     // 			ble.startNotification(uuid, "1827", "2adc", function(rs){
//     // 			    console.log("startNotification="+rs)
//     // 				if(rs=='03010100010000000000000000'){
//     // 				    setTimeout(()=>{
//     //                         iot_setup_mesh_update_step(3);
//     // 						ble.startProvisioning(
//     // 							uuid, appKeyIndex,
//     // 							async (rs) => {
//     // 							    rs = JSON.parse(rs);
//     // 							    iot_mesh_config['networks'][rs.meshUUID] = rs
//     //                                 await http.request(encodeURI('/api/resource/Profile/' + erp.info.profile.name), {
//     //                                     method: 'PUT',
//     //                                     serializer: 'json',
//     //                                     data: {
//     //                                         mesh_config:JSON.stringify(iot_mesh_config)
//     //                                     }
//     //                                 });
//     //                                 erp.info.profile.mesh_config = JSON.stringify(iot_mesh_config);
//     //                                 app.preloader.hide();
//     //                                 iot_setup_mesh_update_step(6);
//     // 							},
//     // 							(e) => {
//     // 							 //   iot_set_mesh_retry(guid, appKeyIndex, e);
//     // 							 //   iot_mesh_retry++
//     // 							 //   if(iot_mesh_retry<3){
//     // 							 //       window.peripheral[guid].disconnect(()=>{});
//     // 							 //       if(iot_mesh_current_step==1){
//     // 							 //           iot_set_mesh_step1(guid, appKeyIndex);
//     // 							 //       }else{
//     // 							 //           iot_set_mesh_step2(guid, appKeyIndex);
//     // 							 //       }
//     // 							 //   }else{
//     // 							 //       window.peripheral[guid].disconnect(()=>{});
//     // 							 //       alert("E2:"+e);
//     // 							 //   }
//     // 							}
//     // 						);
//     // 				    }, 1000);
//     // 				}else if(rs=='030903'){
//     // 				    console.log("Receive notification = 030903");
//     //                     iot_set_mesh_retry(guid, appKeyIndex, "Identifing failed");
//     // 				}else  if(rs=='0308'){
//     // 				    console.log("startNotification 0308")
//     // 					ble.stopNotification(
//     // 						uuid, '1827', '2adc',
//     // 						() => {
//     // 							window.peripheral[guid].disconnect(()=>{});
//     // 							setTimeout(()=>{
//     // 								iot_set_mesh_step2(guid, appKeyIndex);
//     // 							},1000);
//     // 						},
//     // 						(e) => {
//     // 							console.log('stopNotification error', e)
//     // 						}
//     // 					);
//     // 				}
//     // 			}, (error) => {
// 				//     console.log("Receive error: "+error);
//     // 			    iot_set_mesh_retry(guid, appKeyIndex, "Identifing failed");
//     // 			 //   app.preloader.hide();
//     // 			 //   console.log("startNotification error="+error);
//     // 			 //   clearTimeout(identify_timer);
//     // 				// window.peripheral[guid].disconnect(()=>{});
//     // 			});
//             }

// 			if(window.peripheral[guid].getProp().connected){
// 			    identifyNode();
// 			}else{
// 			 //   ble.connect(uuid, function(){
//     // 			    ble.requestMtu(uuid, 515, ()=>{
//     // 			        identifyNode();
//     // 			    }, (e)=>{
//     // 			        app.preloader.hide();
//     // 			        alert("E3:"+e); 
//     // 				    // iot_mesh_retry++
//     // 				    // if(iot_mesh_retry<3){
//     // 				    //     window.peripheral[guid].disconnect(()=>{});
// 				// 	       // if(iot_mesh_current_step==1){
// 				// 	       //     iot_set_mesh_step1(guid, appKeyIndex);
// 				// 	       // }else{
// 				// 	       //     iot_set_mesh_step2(guid, appKeyIndex);
// 				// 	       // }
//     // 				    // }else{
//     // 				    //     window.peripheral[guid].disconnect(()=>{});
//     // 				    //     alert(e);
//     // 				    // }
//     // 			    });
//     // 			}, (error)=>{
//     // 			    app.preloader.hide();
//     // 			    alert("E4:"+error);
// 				//     // iot_mesh_retry++
// 				//     // if(iot_mesh_retry<3){
// 				//     //     window.peripheral[guid].disconnect(()=>{});
// 				//     //     if(iot_mesh_current_step==1){
// 				//     //         iot_set_mesh_step1(guid, appKeyIndex);
// 				//     //     }else{
// 				//     //         iot_set_mesh_step2(guid, appKeyIndex);
// 				//     //     }
// 				//     // }else{
// 				//     //     window.peripheral[guid].disconnect(()=>{});
// 				//     //     alert(e);
// 				//     // }
//     // 			});
// 			}
// 		}, 500);
//     }catch(error){
//         app.preloader.hide();
//         app.dialog.alert("E5:"+_(erp.get_log_description(error)));
// 	   // iot_mesh_retry++
// 	   // if(iot_mesh_retry<3){
// 	   //     window.peripheral[guid].disconnect(()=>{});
// 	   //     if(iot_mesh_current_step==1){
// 	   //         iot_set_mesh_step1(guid, appKeyIndex);
// 	   //     }else{
// 	   //         iot_set_mesh_step2(guid, appKeyIndex);
// 	   //     }
// 	   // }else{
// 	   //     window.peripheral[guid].disconnect(()=>{});
// 	   //     app.preloader.hide();
//     //         app.dialog.alert(_(erp.get_log_description(error)));
// 	   // }
//     }
};

window.iot_set_meshed = false;
window.iot_set_target = null;
window.iot_set_mesh_step2 = async (guid, appKeyIndex) => {
    iot_mesh_selected_guid = guid;
    iot_mesh_selected_appKeyIndex = appKeyIndex;
    
    iot_setup_mesh_update_step(4);
    emitter.emit("mesh/bindAppKey",{code:202})
    setTimeout(function(){
        iot_setup_mesh_update_step(5);
        emitter.emit("mesh/bindAppKey",{code:203})
        window.peripheral[guid].bindAppKey();    
    }, 5000);
    
//     iot_setup_mesh_update_step(4);
//     let uuid = window.peripheral[guid].prop.id;
    
//     iot_set_meshed = false;
//     iot_set_target = uuid;
//     iot_mesh_current_step = 2;
    
//     try{
//         //refresh cache
//         console.log("iot_set_mesh_step2: refresh cache");
//         ble.refreshDeviceCache(uuid, 0, ()=>{}, ()=>{});
//         var scanTimer = null;
        
//         setTimeout(async function(){
//             console.log("iot_set_mesh_step2: connect: "+uuid);
// 			ble.connect(uuid, function(){
// 			    iot_setup_mesh_update_step(5);
// 				// ble.startNotification(
// 				// 	uuid, '1828', '2ade',
// 				// 	(raw) => {
// 				// 		console.log('[MESH NOTIFY]', raw);
// 				// 	},
// 				// 	(error) => {
// 		  //              app.preloader.hide();
// 				// 		alert("startNotification error")
// 				// 		alert(error);
// 				// 	}
// 				// );
				
// 			}, (err) => {
// 				alert('requestMtu error')
// 				alert(err);
// 			})
//         }, 5000);
//     }catch(error){
//         app.preloader.hide();
//         app.dialog.alert("E6:"+_(erp.get_log_description(error)));
// 	   // iot_mesh_retry++
// 	   // if(iot_mesh_retry<3){
// 	   //     window.peripheral[guid].disconnect(()=>{});
// 	   //     if(iot_mesh_current_step==1){
// 	   //         iot_set_mesh_step1(guid, appKeyIndex);
// 	   //     }else{
// 	   //         iot_set_mesh_step2(guid, appKeyIndex);
// 	   //     }
// 	   // }else{
// 	   //     window.peripheral[guid].disconnect(()=>{});
// 	   //     app.preloader.hide();
//     //         app.dialog.alert(_(erp.get_log_description(error)));
// 	   // }
//     }
};



window.iot_set_mesh_retry_timer = null;
window.iot_set_mesh_retry = async (guid, appKeyIndex, e) => {
    clearTimeout(iot_set_mesh_retry_timer);
    iot_set_mesh_retry_timer = setTimeout(function(){
	    iot_mesh_retry++
	    if(iot_mesh_retry<3){
	        let uuid = window.peripheral[guid].prop.id;
	        
	        
            console.log("identify disconnect 3");
	        ble.disconnect(uuid, ()=>{
	            console.log("iot_set_mesh_step1 1");
                iot_set_mesh_step1(guid, appKeyIndex);
	        }, ()=>{
	            console.log("iot_set_mesh_step1 2");
	            iot_set_mesh_step1(guid, appKeyIndex);
	        })
	    }else{
	        app.preloader.hide();
	        alert(e);
	    }
    }, 5000);
};


window.iot_set_mesh_on_identify_success_timer = null;
window.iot_set_mesh_on_identify_success = (uuid) => {
    clearTimeout(iot_set_mesh_on_identify_success_timer);
    iot_set_mesh_on_identify_success_timer = setTimeout(()=>{
        iot_setup_mesh_update_step(3, uuid);
    }, 1000);
//     iot_set_mesh_on_identify_success_timer = setTimeout(()=>{
//         iot_setup_mesh_update_step(3);
// 		ble.startProvisioning(
// 			uuid, iot_mesh_selected_appKeyIndex,
// 			async (rs) => {
// 			    rs = JSON.parse(rs);
// 			    iot_mesh_config['networks'][rs.meshUUID] = rs
//                 await http.request(encodeURI('/api/resource/Profile/' + erp.info.profile.name), {
//                     method: 'PUT',
//                     serializer: 'json',
//                     data: {
//                         mesh_config:JSON.stringify(iot_mesh_config)
//                     }
//                 });
//                 erp.info.profile.mesh_config = JSON.stringify(iot_mesh_config);
//                 app.preloader.hide();
//                 iot_setup_mesh_update_step(6);
// 			}, (e) => {
// 			 //   app.preloader.hide();
			 
//                 clearTimeout(setmesh_produce_timer);
//                 setmesh_start_produce_timer(0, "Provisioning failed");
// 			}
// 		);
//     }, 2000);
};

window.iot_set_mesh_on_identify_fail = (uuid) => {
    clearTimeout(iot_set_mesh_on_identify_success_timer);
    // app.preloader.hide();
    if(isset(setmesh_produce_timer)){
        clearTimeout(setmesh_produce_timer);
    }else{
        emitter.emit("mesh/identify",{code:7300})
    }
    
    setmesh_start_produce_timer(0, "Identifing failed");
};

window.iot_set_mesh_on_provisioning_success_timer = null;
window.iot_set_mesh_on_provisioning_success = (guid) => {
    clearTimeout(iot_set_mesh_on_provisioning_success_timer);
    iot_set_mesh_on_provisioning_success_timer = setTimeout(()=>{
		iot_set_mesh_step2(guid, iot_mesh_selected_appKeyIndex);
	},1000);
};




window.manufacturing_periperal_inner_template = `
<div class="item-content" lastDiscoverDate="{{lastDiscoverDate}}" rssi="{{rssi}}" model="{{model}}">
	<div class="item-inner">
		<div class="item-title-row">
		    <div class="item-title" lang="en">{{model}}-{{name}}</div>
		</div>
		<div class="item-subtitle">ID: {{id}}</div>
        <div class="item-subtitle">RSSI: {{rssi}}</div>
	</div>
	<a class="button button-raised" func="manufacturing_start_produce" ref="{{id}}" style="float:right;line-height:50px;width:85px;padding:0px;margin-right:10px;background-color:#fff;font-size:12px;">{{_("Produce")}}</a>
</div>
`;
window.manufacturing_periperal_outer_template = `
<li class="manufacturing-peripheral device" uuid="{{id}}" style="max-height:75px;padding:10px 5px;">
    ${manufacturing_periperal_inner_template}
</li>
`;

window.manufacturing_periperals = {};
window.sta_mac_address = "";
window.lan_mac_address = "";
window.ap_mac_address = "";
window.manufacturing_scan_timer = null;
window.manufacturing_new_guid = "";
window.controller_toggle_manufacturing = function(params){
    let batch = $("select[name='manufacturing-batch']").val();
    let model = $("select[name='manufacturing-model']").val();
    
    let error = "";
    if(batch==""){
        error = _("Please Select Batch");
    }
    if(model==""){
        error = error=="" ? _("Please Select Model") : _("Please Select Batch and Model");
    }
    if(error!=""){
        app.dialog.alert(error);
        return;
    }

    if(params.obj.text()==_("Start")){
        params.obj.html(_("Stop"));
        $(".button.back").hide();
        $("select[name='manufacturing-batch']").prop('disabled',true);
        $("select[name='manufacturing-model']").prop('disabled',true);
        
        ble.stopScan(function(){
            manufacturing_scan_timer = setInterval(function(){
                let now = new Date();
                now.setSeconds(now.getSeconds() - 10);
                $(".manufacturing-peripheral").each(function(){
                    let ld = new Date($(this).find('.item-content').attr('lastDiscoverDate'));
                    // console.log("guid ld="+ld.getTime());
                    // console.log("guid now="+now.getTime());
                    if(ld.getTime() < now.getTime()){
                        $(this).remove()
                    }
                });
            }, 5000);
            is_ble_scanning = true;
            ble.startScanWithOptions(["fff0","ff70","ffB0","ff80","1827","1828"],
                { reportDuplicates: true, scanMode:"lowLatency" }, function(peripheral) {
                    //console.log(peripheral.id);
                    if(peripheral.id == "DCCDA9F1-0B97-A5DE-12FB-AEF8DD77461"){
                        console.log("peripheral",peripheral);
                    }
                    if(peripheral.hexModel == "011A"){
                        //console.log("peripheral",peripheral);
                    }
                manufacturing_did_found(peripheral);
            }, function(){
                l("Manufacturing", "[Need check] Start BLE scan fail");
            });
        }, function(){
        });
    }else{
        params.obj.html(_("Start"));
        $(".button.back").show();
        $("select[name='manufacturing-batch']").prop('disabled',false);
        $("select[name='manufacturing-model']").prop('disabled',false);
        $('.manufacturing-peripheral').remove();
        
        clearInterval(manufacturing_scan_timer);
        ble.stopScan(function(){
        }, function(){
        });
    }
};

window.manufacturing_did_found = (peripheral) => {
    if(!$('input[name="checkbox-manufacturing-show-done"]').is(':checked')){
        let pmodel = (isset(ble_model[peripheral.hexModel.toLowerCase()])) ? ble_model[peripheral.hexModel.toLowerCase()].name : 'BG000';
        if(pmodel.toLowerCase()!='bg000'){
            return;
        }
    }
    if(!$('input[name="checkbox-manufacturing-show-all"]').is(':checked')){
        if(peripheral.rssi < -60){
            return;
        }
    }
    
    if(!isset(peripheral.id)) return;
    
    if(isset(manufacturing_periperals[peripheral.id])){
        manufacturing_periperals[peripheral.id] = app.utils.extend(manufacturing_periperals[peripheral.id], peripheral);
    }else{
        manufacturing_periperals[peripheral.id] = peripheral;
        //console.log(JSON.stringify(peripheral));
    }
    
    let args = {}
    args.id = peripheral.id;
    args.name = peripheral.name.substring(0,12);
    args.guid = peripheral.guid;
    args.rssi = peripheral.rssi;
    args.lastDiscoverDate = peripheral.lastDiscoverDate;
    args.model = (isset(ble_model[peripheral.hexModel.toLowerCase()])) ? ble_model[peripheral.hexModel.toLowerCase()].name : 'BG000'
    
    let innerHtml = jinja2.render(manufacturing_periperal_inner_template, args);
    let outerHtml = jinja2.render(manufacturing_periperal_outer_template, args);
    if(isset($('.manufacturing-peripheral[uuid="'+peripheral.id+'"]').attr('uuid'))){
        $('.manufacturing-peripheral[uuid="'+peripheral.id+'"]').html(innerHtml);
    }else{
        $('.manufacturing-found-list ul').append(outerHtml);
    }
};

window.manufacturing_processing = false;
window.manufacturing_current_step = 0;
window.manufacturing_produce_timer = null;
window.manufacturing_password = '000000';
window.manufacturing_default_password = '000000';
window.manufacturing_start_produce = (params) => {
    // Icons
    // 	<i class="icon material-icons" style="font-weight:bold;color:green">done</i>
    // 	<i class="icon material-icons">watch_later</i>
    // 	<i class="icon material-icons spin_icon">autorenew</i>
    
    if($('.manufacturing-btn-start').html()==_("Start")){
        app.dialog.alert(_("Please set the batch and model first, and then begin production after starting!"));
        return;
    }
    
    manufacturing_current_step = 0;
    //let testButton = ha_control_template_render('6430326561623565353434651201791b','YO825k','On Off IR');
    app.sheet.create({
        content: `
            <div class="sheet-modal" style="height:auto">
            	<div class="sheet-modal-inner">
            		<div class="swipe-handler"></div>
            		<div class="page-content" style="height:600px;">
            			<div class="list list-strong list-outline list-dividers-ios">
            				<ul class="manufacturing-steps-list">
            					<li class="manufacturing-steps manufacturing-step1">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 1: Connect the device.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step2">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 2: Mac address")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step3">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 3: Version Number")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step4">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 4: Enter the key.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step5">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 5: Update the settings name and configuration.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step6">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 6: Restarting.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step7">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 7: Confirm the updated settings name.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step8">
            						<div class="item-content">
            							<div class="item-inner">
            								<div class="item-title">${_("Step 8: Upload to the my.mob-mob.com server.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            					<li class="manufacturing-steps manufacturing-step9">
            						<div class="item-content">
            							<div class="item-inner">
            								    <div class="item-title">${_("Step 9: Upload to the ERP server.")}</div>
            								<div class="item-after">
            									<i class="icon material-icons">watch_later</i>
            								</div>
            							</div>
            						</div>
            					</li>
            				</ul>
            			</div>
            			<div class="block manufacturing-remaining-time" style="text-align:center;">
                				${_("Remaining production time: ")}<font>30</font>${_("s")}
            			</div>
            		</div>
            	</div>
            </div>
        `,
        on: {
            closed: function () {
                clearTimeout(manufacturing_produce_timer);
                if(manufacturing_processing){
                    app.dialog.alert(_("Production interrupted, please restart the process!"));
                }
                manufacturing_processing = false;
            }
        },
        swipeToClose: true,
        push: true,
        backdrop: true,
    }).open();


    let args = {},
        p = manufacturing_periperals[params.ref],
        id = p.id,
        batch = $("select[name='manufacturing-batch']").val(),
        model = $("select[name='manufacturing-model']").val(),
        batchText = $("select[name='manufacturing-batch'] option[value='" + batch + "']").text(),
        modelText = $("select[name='manufacturing-model'] option[value='" + model + "']").text();
	
    manufacturing_password = '000000';
    manufacturing_default_password = '000000';
    
	let cmd = [];
	// connect
	cmd.push({action:"connect", pre:"manufacturing_update_step", post:"manufacturing_update_step"});
	// read mac address 2a23
	cmd.push({action:"read",serv:'180a',char:'2a23', pre:"manufacturing_update_step", post:"manufacturing_update_step"});
	// read firmware version 2a26
	cmd.push({action:"read",serv:'180a',char:'2a26', pre:"manufacturing_update_step", post:"manufacturing_update_step"});
	// write serial number 
    cmd.push({action:"write",data:('88014B{{macs[3]}}{{macs[0]}}A16E95').toLowerCase(), pre:"manufacturing_update_step"}); 
	// write super password 
    cmd.push({action:"write",data:('880083{{macs[2]}}{{macs[5]}}543e15').toLowerCase()}); 
	// write flash led
	cmd.push({action:"write",data:('812c01').toLowerCase(), post:"manufacturing_update_step"}); 
	// write new name
    cmd.push({action:"write",data:('8100{{machexs[0]}}{{machexs[1]}}{{machexs[2]}}{{machexs[3]}}{{machexs[4]}}{{machexs[5]}}12' + model + batch).toLowerCase(), pre:"manufacturing_update_step"});  // device name 
    manufacturing_new_guid = '{{machexs[0]}}{{machexs[1]}}{{machexs[2]}}{{machexs[3]}}{{machexs[4]}}{{machexs[5]}}12' + model + batch;
    //write ble name 
    if(isset(ble_model[model.toLowerCase()])){
        let model_hex = Array.from([...new TextEncoder().encode(ble_model[model.toLowerCase()].name)])
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
        debugger
        let command = `93570000${parseInt(model_hex.length/2).toString(16).padStart(2, '0')}${model_hex}`;
        cmd.push({action:"write",data:command.toLowerCase()});
    }
    
    /* default config of model and batch */
    //debugger
    if(isset(ble_model[model.toLowerCase()]) && isset(ble_model[model.toLowerCase()]['default']) && ble_model[model.toLowerCase()]['default'].length){
        for(let k in ble_model[model.toLowerCase()]['default']){
            console.log(k);
            console.log(ble_model[model.toLowerCase()]['default'][k]);
            if(ble_model[model.toLowerCase()]['default'][k].startsWith('9358')){
                cmd.push({action:"write",data:ble_model[model.toLowerCase()]['default'][k].toLowerCase()});
                cmd.push({action:"write",data:("810e").toLowerCase()}); 
                cmd.push({action:"connect"});
            }else{
                cmd.push({action:"write",data:ble_model[model.toLowerCase()]['default'][k].toLowerCase()});
            
                
                if(ble_model[model.toLowerCase()]['default'][k].startsWith('82')){
                    manufacturing_password = ble_model[model.toLowerCase()]['default'][k].substring(14).convertToAscii();
                }
                if(ble_model[model.toLowerCase()]['default'][k].startsWith('88038354')){
                    manufacturing_default_password = ble_model[model.toLowerCase()]['default'][k].substring(8).convertToAscii();
                }
            }
            
        }
    }
    let hexBatch = batch.toUpperCase();
    if(isset(ble_batch[hexBatch]) && isset(ble_batch[hexBatch]['default']) && ble_batch[hexBatch]['default'].length){
        for(let k in ble_batch[hexBatch]['default']){
            cmd.push({action:"write",data:ble_batch[hexBatch]['default'][k].toLowerCase()});
            
            if(ble_batch[hexBatch]['default'][k].startsWith('82')){
                manufacturing_password = ble_batch[hexBatch]['default'][k].substring(14).convertToAscii();
            }
            if(ble_batch[hexBatch]['default'][k].startsWith('88038354')){
                manufacturing_default_password = ble_batch[hexBatch]['default'][k].substring(8).convertToAscii();
            }
        }
    }
    /* default config of device firmware */
    // let device_firmware_list = cloneDeep(erp.doctype.device_firmware);
    // let device_model_map = cloneDeep(erp.doctype.device_model);
    // let this_model_firmware = device_model_map[model.toUpperCase()].latest_firmware;
    // debugger
    // if(this_model_firmware){
    //     let device_firmware = device_firmware_list[this_model_firmware];
    //     if(isset(device_firmware)){
    //         let default_config = device_firmware.default_config;
    //         for(let k in default_config){
    //             if(default_config[k].description.startsWith('9358')){
    //                 cmd.push({action:"write",data:(default_config[k].description).toLowerCase()});
    //                 cmd.push({action:"write",data:("810e").toLowerCase()}); 
    //                 cmd.push({action:"connect"});

    //             }else{
    //                 cmd.push({action:"write",data:(default_config[k].description).toLowerCase()});
    //             }
                
    //         }
    //     }
    // }
	// read manufacturer 2a29
	cmd.push({action:"read",serv:'180a',char:'2a29'});
	// write resume led
	cmd.push({action:"write",data:('812c00').toLowerCase(), post:"manufacturing_update_step"}); 
    
// 	// read manufacturer 2a29
// 	cmd.push({action:"read",serv:'180a',char:'2a29', post:"manufacturing_update_step"});
// 	// write resume led
// 	cmd.push({action:"write",data:('812c00').toLowerCase(), pre:"manufacturing_update_step"}); 
// 	cmd.push({action:"write",data:('8000ff').toLowerCase()}); 
// 	cmd.push({action:"write",data:('8900ff').toLowerCase()}); 
// 	cmd.push({action:"delay",delay:3}); 
// 	cmd.push({action:"write",data:('800000').toLowerCase()}); 
// 	cmd.push({action:"write",data:('890000').toLowerCase()}); 
// 	cmd.push({action:"delay",delay:2, post:"manufacturing_update_step"}); 

    //get the mac address
    cmd.push({action:"notify",serv:'ff80',char:'ff82'});
    cmd.push({action:"write",data:'932d'});
	// write restart
	cmd.push({action:"write",data:("810e").toLowerCase(), pre:"manufacturing_update_step"}); 
	// end command, no need to write
	cmd.push({action:"connect", post:"manufacturing_update_step"});
	cmd.push({action:"read",serv:'180a',char:'2a29', pre:"manufacturing_update_step"});
	cmd.push({action:"disconnect"});
	cmd.push({action:"connect"});
	cmd.push({action:"read",serv:'180a',char:'2a29'});
	cmd.push({action:"disconnect", post:"manufacturing_update_step"});
	cmd.push({action:"other", post:"manufacturing_upload_to_my_mobmob"});
	cmd.push({action:"other", post:"manufacturing_upload_to_erp"});
	
    
    // app.preloader.show();
    manufacturing_processing = true;
    manufacturing_start_produce_timer(30);
    manufacturing_process_periperal(id, cmd);
};

window.manufacturing_start_produce_timer = (second) => {
    $('.manufacturing-remaining-time').find('font').html(second);
    if(second>0){
        manufacturing_produce_timer = setTimeout(function(){
            manufacturing_start_produce_timer(second-1);
        }, 1000);
    }else{
        if(manufacturing_processing){
            manufacturing_processing = false;
            $('.manufacturing-remaining-time').attr('style','text-align:center;color:red;');
            $('.manufacturing-remaining-time').html(_("Production failed, please try again."));
            $('.manufacturing-steps').each(function(){
                if($(this).hasClass('done')) return;
                
                $(this).find('.icon').removeClass('spin_icon').attr('style','font-weight:bold;color:red').html('close')
            });
        }
    }
}

window.manufacturing_process_periperal = (id, cmd) => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    //debugger
    (function loop(i, repeat) {
        if (i >= cmd.length) return;
        if (!manufacturing_processing){
            return;
        }
        delay(100).then(() => {
            if(!isset(repeat) && isset(cmd[i].pre) && isset(window[cmd[i].pre])){
                window[cmd[i].pre](id, 'start', null);
            }
            if(cmd[i].action=="connect"){
                debugger
                console.log("Manufacturing: Connect");
                manufacturing_periperals[id].reconnect = true;
                ble.connect(id, function(rs){
                    manufacturing_periperals[id].reconnect = false;
                    console.log("Manufacturing: Connect Successfully");
                    if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                        window[cmd[i].post](id, 'done', null);
                    }
                    loop(i+1);
                }, function(rs){
                    if(manufacturing_periperals[id].reconnect){
                        console.log("Manufacturing: ReConnect");
                        loop(i, true);
                    }
                });
            }else if(cmd[i].action=="disconnect"){
                console.log("Manufacturing: Disonnect");
                ble.disconnect(id, function(rs){
                    console.log("Manufacturing: Disonnect Successfully");
                    if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                        window[cmd[i].post](id, 'done', null);
                    }
                    loop(i+1);
                }, function(){
                    loop(i+1);
                });
            }else if(cmd[i].action=="write"){
                if(cmd[i].data=="810e"){
                    console.log("Manufacturing: Restart "+cmd[i].data);
                    ble.write(id, "ff80", "ff81", cmd[i].data.convertToBytes(), function(){
                        console.log("Manufacturing: Restart "+cmd[i].data+" Successfully.");
                        if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                            window[cmd[i].post](id, 'done', null);
                        }
                        loop(i+1);
                    }, function(error){
                        debugger
                        console.log("Manufacturing: Restart "+cmd[i].data+" Failed (Successfully).");
                        if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                            window[cmd[i].post](id, 'done', null);
                        }
                        loop(i+1);
                    });
                }else{
                    console.log("Manufacturing: Write "+cmd[i].data);
                    ble.write(id, "ff80", "ff81", cmd[i].data.convertToBytes(), function(){
                        console.log("Manufacturing: Write "+cmd[i].data+" Successfully.");
                        if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                            window[cmd[i].post](id, 'done', null);
                        }
                        loop(i+1);
                    }, function(){
                        loop(i, true);
                    });
                }
            }else if(cmd[i].action=="read"){
                console.log("Manufacturing: Read "+cmd[i].serv+" -> "+cmd[i].char);
                ble.read(id, cmd[i].serv, cmd[i].char, function(rs){
                    console.log("Manufacturing: Read "+cmd[i].serv+" -> "+cmd[i].char+" = "+rs+" Successfully");
                    if(cmd[i].char=="2a23"){//read macaddress
                        rs = ((rs.substring(0, 12).match(/.{1,2}/g)).reverse().join(":")).toUpperCase();
                        manufacturing_periperals[id].mac_address = rs;
                        
                        let macs = rs.split(":");
                        let machexs = rs.split(":");
                        for(let j in machexs){
                            machexs[j] = machexs[j].toLowerCase().convertToHex();
                        }
                        for(let j=0; j<cmd.length; j++){
                            if(isset(cmd[j].data)){
                                cmd[j].data = jinja2.render(cmd[j].data, {macs:macs,machexs:machexs});
                            }
                        }
                        manufacturing_new_guid = jinja2.render(manufacturing_new_guid, {macs:macs,machexs:machexs});
                        manufacturing_new_guid = manufacturing_new_guid.toLowerCase();
                    }else if(cmd[i].char=="2a26"){
                        rs = parseFloat(rs.substring(2).convertToAscii());
                        manufacturing_periperals[id].firmware = rs;
                    }else{
                        //debugger
                        rs = null;
                    }
                    if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                        window[cmd[i].post](id, 'done', rs);
                    }
                    loop(i+1);
                }, function(){
                    loop(i, true);
                });
            }else if(cmd[i].action=="delay"){
                setTimeout(function(){
                    if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                        window[cmd[i].post](id, 'done', null);
                    }
                    loop(i+1);
                }, cmd[i].delay*1000);
            }else if(cmd[i].action=="notify"){
                console.log("Manufacturing: Notify Start");
                ble.startNotification(id, cmd[i].serv, cmd[i].char, function(rs){
                    console.log("Manufacturing: Notify "+cmd[i].serv+" Successfully");
                    //get the sta_mac_address,lan_mac_address,ap_mac_address
                    if(rs.startsWith("932d000018")){
                        window.sta_mac_address = rs.substring(10,22);
                        window.ap_mac_address = rs.substring(22,34);
                        //window.ble_mac_address = rs.substring(34,46);
                        window.lan_mac_address = rs.substring(46,58);
                        console.log("sta_mac_address = "+window.sta_mac_address);
                        console.log("ap_mac_address = "+window.ap_mac_address);
                        console.log("lan_mac_address = "+window.lan_mac_address);
                    }
                },(error)=>{
                    console.log("Manufacturing: Notify "+cmd[i].data+" Failed");
                    loop(i+1);
                });
                loop(i+1);
            }else{
                if(isset(cmd[i].post) && isset(window[cmd[i].post])){
                    debugger
                    window[cmd[i].post](id, 'done', null).then(() => {
                        manufacturing_update_step(id, 'done', null);
                        loop(i+1);
                    });
                }else{
                    loop(i+1);
                }
            }
        });
    })(0);
};

window.manufacturing_update_step = (id, flag, info) => {
    if(flag=='start'){
        manufacturing_current_step++;
        $('.manufacturing-step'+manufacturing_current_step).find('.icon').addClass('spin_icon').html('autorenew');
        if(manufacturing_current_step==7){
            // alert(manufacturing_current_step);
            // alert(manufacturing_new_guid);
            // debugger
            //get the device template
            let p = manufacturing_periperals[id];
            manufacturing_periperals[id].guid = manufacturing_new_guid;
            manufacturing_periperals[id].connected = false;
            manufacturing_periperals[id].connecting = false;
            //debugger
            let template = ha_control_template_render(manufacturing_new_guid, erp.doctype.device_model[$("select[name='manufacturing-model']").val().toUpperCase()].model_code,'',id);
            //alert(template);
            $('.manufacturing-steps-list').append(template);
        }
    }else if(flag=='done'){
        $('.manufacturing-step'+manufacturing_current_step).addClass('done');
        $('.manufacturing-step'+manufacturing_current_step).find('.icon').removeClass('spin_icon').attr('style','font-weight:bold;color:green').html('done');
        
    }
    if(isset(info)){
        $('.manufacturing-step'+manufacturing_current_step).find('.item-title').append(": "+info);
    }
    if($('.manufacturing-steps').length == $('.manufacturing-steps.done').length){
        // app.preloader.hide();
        // $('.summary-icon').removeClass('spin_icon').attr('style','font-weight:bold;color:green;font-size:50px;').html('done')
        manufacturing_processing = false;
        clearTimeout(manufacturing_produce_timer);
        $('.manufacturing-remaining-time').attr('style','text-align:center;color:green;');
        $('.manufacturing-remaining-time').html(_("Production completed!"));
    }
    console.log("Manufacturing: "+flag+" manufacturing-step"+manufacturing_current_step);
};

window.manufacturing_upload_to_my_mobmob = (id, args) => {
    manufacturing_update_step(id, 'start', null);
    //debugger
    
    if(!isset(manufacturing_periperals[id])) return;
    
    let p = manufacturing_periperals[id];
    
    //debugger
    let parameters = [];
    parameters.push('mac_address='+p.mac_address);
    parameters.push('uuid='+id);
    parameters.push('hex_model='+p.hexModel);
    parameters.push('hex_batch='+p.hexBatch);
    parameters.push('current_name='+manufacturing_new_guid);
    parameters.push('date_manufacture='+p.lastDiscoverDate);
    parameters.push('version=v'+p.firmware);
    parameters.push('updatedname='+1);
    
    url = 'https://my.mob-mob.com/manufacturer/sync.php?'+(parameters.join("&")).replace(" ", "%20");
    console.log("Manufacturing: GET "+url);
    return http.request(url, {
		method: "GET"
	});
};
window.formatMAC = (input, separator = ':') => {
    const cleaned = input.toLowerCase().replace(/[^0-9a-f]/g, '');
    if (cleaned.length !== 12) throw new Error('Invalid input');
    return Array.from({length: 6})
        .map((_, i) => cleaned.substr(10 - i*2, 2))
        .join(separator);
    
}
window.manufacturing_upload_to_erp = (id, args) => {
    manufacturing_update_step(id, 'start', null);

    if(!isset(manufacturing_periperals[id])) return;
    
    let p = manufacturing_periperals[id];
    let url = "/api/resource/Device/"+manufacturing_new_guid;
	let method = "GET";
    let batch = $("select[name='manufacturing-batch']").val(),
        model = $("select[name='manufacturing-model']").val(),
        batchText = $("select[name='manufacturing-batch'] option[value='" + batch + "']").text(),
        modelText = $("select[name='manufacturing-model'] option[value='" + model + "']").text();
	
	console.log("Manufacturing: manufacturing_password = "+manufacturing_password);
	console.log("Manufacturing: manufacturing_default_password = "+manufacturing_default_password);
	let deviceData = {
	    guid:manufacturing_new_guid,
	    mac_address:p.mac_address.toLowerCase(),
	    password:manufacturing_password,
	    device_model:modelText,
	    batch:batchText,
	    firmware:p.firmware,
        wifi_mac_address:formatMAC(window.sta_mac_address),
        lan_mac_address:formatMAC(window.lan_mac_address),
        ap_mac_address:formatMAC(window.ap_mac_address),
	    manufacture_date:p.lastDiscoverDate,
	    settings:[{
	        setting_type:'default_password',
	        setting:manufacturing_default_password
	    }]
	};
        
	return new Promise(function(resolve, reject) {
        http.request(url, {
    	    method: method
    	}).then((rs)=>{
    	    method = "PUT";
    	    return http.request(url, {
        		method: method,
        		serializer: 'json',
        		data:{data:deviceData},
        	})
    	}, (error)=>{
    	    url = "/api/resource/Device";
    	    method = "POST";
    	    return http.request(url, {
        		method: method,
        		serializer: 'json',
        		data:{data:deviceData},
        	});
    	}).then((rs)=>{
    		resolve();
    	})
	});
};

window.manufacturing_clean_discovery_list = () => {
    $('.manufacturing-peripheral').remove();
};


window.manufacturing_toggle_show_done = (params) => {
    if(params.obj.is(':checked')){
    }else{
        $('.manufacturing-peripheral.device').each(function(){
            if($(this).find('.item-content').attr('model').toLowerCase()!='bg000'){
                $(this).remove();
            } 
        });
    }
};


window.manufacturing_toggle_show_all = (params) => {
    if(params.obj.is(':checked')){
    }else{
        $('.manufacturing-peripheral.device').each(function(){
            if($(this).find('.item-content').attr('rssi')*1 < -60){
                $(this).remove();
            } 
        });
    }
};
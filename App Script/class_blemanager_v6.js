window.BleManager = (function() {
    function BleManager(ble) {
        this.manager = ble;
        this.timer = [];
    }
    
    BleManager.prototype.stopScan = function(){
        const self = this;
    	return new Promise((resolve) => {
    		self.manager.stopScan(resolve, resolve);
    	});
    };
    
    BleManager.prototype.scan = function(success, failure, services=['fff0', 'ff70', 'ffb0', 'ff80', '1827', '1828']){
        const self = this;
        
        self.manager.startScanWithOptions(
            services,
            {
                reportDuplicates: true,
                scanMode: 'lowLatency',
            },
            success,
            failure
        )
        self.timer.push(setTimeout(async ()=>{
            for(let guid in peripheral){
                const p = peripheral[guid].getProp();
                if(isset(p.lastDiscoverDate) && !p.disappear){
                    let currentDate = new Date();
                    let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;
                    
                    //console.log('disappear: '+timeDifference);
                    if (timeDifference >= 18) {
                        peripheral[guid].update({rssi:1000});
                    }
                }
            }
            
            await self.stopScan();
            await self.wait(200);
            self.scan(success, failure, services);
        }, 20000));
		// self.manager.isEnabled(()=>{
		//     if (deviceInfo.operatingSystem === 'ios') {
        //     	self.manager.startScanWithOptions(
        // 			services,
        // 			{
        // 				reportDuplicates: true,
        // 				scanMode: 'lowLatency',
        // 			},
        // 			success,
        // 			failure
        // 		)
        		
        // 		self.timer.push(setTimeout(async ()=>{
        // 		    for(let guid in peripheral){
        // 		        const p = peripheral[guid].getProp();
        // 		        if(isset(p.lastDiscoverDate) && !p.disappear){
        // 		            let currentDate = new Date();
        //                     let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;
                            
        //                     //console.log('disappear: '+timeDifference);
        //                     if (timeDifference >= 18) {
        //                     	peripheral[guid].update({rssi:1000});
        //                     }
        // 		        }
        // 		    }
        		    
        // 		    await self.stopScan();
        // 		    await self.wait(200);
        // 		    self.scan(success, failure, services);
        // 		}, 20000));
		//     }else{
        //         self.manager.isLocationEnabled(()=>{
        //         	self.manager.startScanWithOptions(
        //     			services,
        //     			{
        //     				reportDuplicates: true,
        //     				scanMode: 'lowLatency',
        //     			},
        //     			success,
        //     			failure
        //     		)
            		
        //     		self.timer.push(setTimeout(async ()=>{
        //     		    for(let guid in peripheral){
        //     		        const p = peripheral[guid].getProp();
        //     		        if(isset(p.lastDiscoverDate) && !p.disappear){
        //     		            let currentDate = new Date();
        //                         let timeDifference = (currentDate - new Date(p.lastDiscoverDate)) / 1000;
                                
        //                         //console.log('disappear: '+timeDifference);
        //                         if (timeDifference >= 18) {
        //                         	peripheral[guid].update({rssi:1000});
        //                         }
        //     		        }
        //     		    }
            		    
        //     		    await self.stopScan();
        //     		    await self.wait(200);
        //     		    self.scan(success, failure, services);
        //     		}, 20000));
        //         }, ()=>{
        //             //alert("FFFFF2");
        //             failure(bleError.BLE_MOBILE_LOCATION_SERVICE_NOT_ENABLED);
        //         });
		//     }
		// }, ()=>{
        //     if (deviceInfo.operatingSystem === 'ios'){
        //         failure(bleError.BLE_MOBILE_BLUETOOTH_NOT_ENABLED);
        //     }else{
        //         ble.enable(()=>{},()=>{});
        //     }
		// });
    };
    
    BleManager.prototype.wait = function(ms){
        const self = this;
    	
    	return new Promise((resolve) => {
    		self.timer.push(setTimeout(resolve, ms));
    	});
    };
    
    
    BleManager.prototype.clear = function(ms){
        const self = this;
        
    	for(let i in self.timer){
    	    clearTimeout(self.timer[i]);
    	}
    };
    
    return BleManager;
})();

if(isset(window.bleManager)){
    bleManager.clear();
    bleManager = null;
}
window.bleManager = new BleManager(ble);


window.bleHelper = {
    getGangId: function(button_group){
        // 0 and 5-7 are not used
        
        if(button_group.startsWith('ONOFF GANG')){ //1 to 4, 0 is not used
            return button_group.replaceAll('ONOFF GANG', '')*1; 
            
        }else if(button_group.startsWith('DIMMING')){ // 8 to 11, 5-7 are not used
            if(button_group=='DIMMING')
                return 8;
            else
                return button_group.replaceAll('DIMMING', '')*1 + 7;
                
        }else if(button_group.startsWith('GV DIMMING')){
            return button_group.replaceAll('GV DIMMING', '')*1 + 7;
        }else if(button_group.startsWith('RCU ONOFF GANG')){ // rcu onoff 1-20, id are from 12 - 31
            return button_group.replaceAll('RCU ONOFF GANG', '')*1 + 11;
            
        }else if(button_group.startsWith('RCU DIMMING')){ // rcu dimming 1-10, id are from 32 - 41
            return button_group.replaceAll('RCU DIMMING', '')*1 + 31;
            
        }else if(button_group.startsWith('OPENCLOSE GANG')){ // OPENCLOSE, no status, but for control, gang 1= 1_2, gang 2= 2_2, gang 3= 3_4, gang 4= 4_3
            // let gang = button_group.replaceAll('OPENCLOSE GANG', '');
            // let nature_gang = 12
            // if(gang = '1_2'){
            //     nature_gang = 12;
            // }else if(gang = '2_1'){
            //     nature_gang = 13;
            // }else if(gang = '3_4'){
            //     nature_gang = 14;
            // }else if(gang = '4_3'){
            //     nature_gang = 15;
            // }
            // return nature_gang;
            return button_group.replaceAll('OPENCLOSE GANG', '');
        }else if(button_group.startsWith('RCU OPENCLOSE GANG')){ // OPENCLOSE, no status, but for control, gang 1= 1_2, gang 2= 2_2, gang 3= 3_4, gang 4= 4_3
            return button_group.replaceAll('RCU OPENCLOSE GANG', '');
            
        }else if(button_group.startsWith('Thermostat')){
            return 42;
        }else if(button_group.startsWith('RCU OUTPUT')){
            return button_group.replaceAll('RCU OUTPUT', '')*1 + 49;
        }else if(button_group.startsWith('RCU INPUT')){
            return button_group.replaceAll('RCU INPUT', '')*1 + 49;
        }else if(button_group.startsWith('OPENCLOSE UART')){
            return 48;
        }else if(button_group.startsWith('4in1 Sensor')){
            return 49;
        }else{
            return 1;
        }
    },
    openBluetooth: function(){
        while (true) {
            try {
                const dialog = app.dialog.close();
                if (!dialog) {
                    break;
                }
            } catch (e) {
                break;
            }
        }
        if(deviceInfo.operatingSystem === 'ios'){
            app.dialog.confirm(_('Please open bluetooth in settings or toolbar, and then refresh.'),()=>{
                PermissionRequestSheet.openSettings();
            },()=>{});
        }else{
            ble.enable(()=>{},()=>{});
            setTimeout(()=>{
                mainView.router.refreshPage();
            }, 2000);
        }
    },
    getControlSource: function(device){
        return new Promise((resolve)=>{

            peripheral[device].findRoute().then((route)=>{
                let control_source = route;
                if(control_source == 'bluetooth'){
                    control_source = 'Bluetooth';
                }else if(control_source == 'mobmob'){
                    control_source = 'MobMob';
                }else{
                    control_source = 'Bluetooth';
                }
                resolve(control_source);
            });
        });
    },
    parseTimeString:function(timeStr){
        if(!timeStr) return {timestamp: 0, microsec: 0};
        const [datePart, timePart] = timeStr.split(' ');
        const [hours, minutes, seconds] = timePart.split(':');
        const [sec, microsec] = seconds.split('.');
        const dateTime = dayjs(`${datePart} ${hours}:${minutes}:${sec}`);
        return {
        timestamp: dateTime.valueOf(), 
            microsec: microsec ? parseInt(microsec, 10) : 0 
        };
    }
};








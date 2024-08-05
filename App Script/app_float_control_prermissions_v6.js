window.app_float_control_prermissions = function(){
  console.log('comming')
  let list0 = []
   list0.push(cordova.plugins.permissions.SYSTEM_ALERT_WINDOW)
   cordova.plugins.permissions.checkPermission(list0, function success( status ) {
     console.log(status)
     cordova.plugins.permissions.requestPermissions(
       list0,
       function(status) {
         console.log("request")
         console.log(status)
       },
       function(error){
         console.log(error)
       }
     );
   }, function(e){
     console.log(e)
   })
}
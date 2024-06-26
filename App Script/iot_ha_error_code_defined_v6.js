window.iot_ha_error_code_defined = (errorCode)=>{
    //defined iot error code in this script,if need to load the erp code ,run this fun
    //6001,Failed to connect   7200 Password is not correct   6300 BLE_PERIPHERAL_NOT_FOUND  6006 BLE_PERIPHERAL_DISCONNECT_FAIL
    //7001 Timeout
    let errorStr = errorCode;
    switch(errorCode){
      case 7001:
        errorStr = 'Bluetooth connection timed out';
      break;
      case 6001:
        errorStr = 'Bluetooth connection failed';
      break;
      case 6300:
        errorStr = 'Device is not here';
      break;
      case 7200:
        errorStr = 'Password is not correct';
      break;
    }
    return errorStr;
}
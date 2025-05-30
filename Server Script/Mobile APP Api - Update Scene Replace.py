scene_list = frappe.get_all(
	doctype='Scene',
	filters=[
		['device', '=', frappe.form_dict.raw_device]
	],
	fields='name'
)



device_model_map = frappe.get_doc('Device Model',frappe.form_dict.device_model)

hexid_list = ['0371','0374','0370','0369','0368','0367','0372']

rcu_list = ['0346']

device_hexid = device_model_map.hexid

response_map = []

raw_device = frappe.form_dict.raw_device
replace_device = frappe.form_dict.replace_device
replace_mac = frappe.form_dict.replace_mac

if device_hexid in hexid_list:
    # Update Scene Device Location
    for scene_item in scene_list:
        scene_map = frappe.get_doc('Scene', scene_item.name)
        update_list = [
            item for item in scene_map.scene_device_location
            if item.device == raw_device
        ]
        for item in update_list:
            if not frappe.db.exists("Scene Device Location", item.name):
                continue
            try:
                new_name = f"{replace_device}-{item.storage_id}"
                frappe.rename_doc("Scene Device Location", item.name, new_name)
                doc = frappe.get_doc("Scene Device Location", new_name)
                doc.device = replace_device
                doc.save(ignore_permissions=True)
            except Exception as e:
                response_map.append(str(e))
                frappe.log_error(title="update error", message=str(e))
        scene_map.reload()
        try:
            trigger_json_data = json.loads(scene_map.trigger)
        except json.JSONDecodeError:
            trigger_json_data = []
        updated = False
        for trigger_item in trigger_json_data:
                if trigger_item.get('guid') == raw_device:
                    trigger_item['guid'] = replace_device
                    trigger_item['mac_address'] = replace_mac
                    updated = True
        if updated:
            scene_map.trigger = json.dumps(
                    trigger_json_data, 
                    ensure_ascii=False, 
                    separators=(',', ':')
                )
            scene_map.save(ignore_permissions=True)
    frappe.db.commit()


# Scene Virtual Button

# Scene Subscribe Address

# Trigger

# Action

# Condition

# UI Configuration

frappe.response['message'] = response_map
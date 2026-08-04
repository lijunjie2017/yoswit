device_command_name = frappe.form_dict.get("device_command_name")

if not device_command_name:
    frappe.response["status"] = "error"
    frappe.response["code"] = 400
    frappe.response["message"] = "Missing parameter: device_command_name"
    frappe.response["data"] = None
else:
    try:
        device_command = frappe.get_doc("Device Command", device_command_name)
        data = device_command.as_dict()

        app_script_name = device_command.get("app_script")
        if app_script_name:
            try:
                app_script_command = frappe.get_doc("App Script", app_script_name)
                data["app_script_command"] = app_script_command.as_dict()
            except Exception as e:
                data["app_script_command"] = None
                data["app_script_command_error"] = {
                    "message": "Failed to load App Script",
                    "app_script": app_script_name,
                    "error": str(e),
                }

        frappe.response["status"] = "success"
        frappe.response["code"] = 200
        frappe.response["message"] = "OK"
        frappe.response["data"] = data
    except Exception as e:
        frappe.response["status"] = "error"
        frappe.response["code"] = 500
        frappe.response["message"] = "Failed to load Device Command: " + str(e)
        frappe.response["data"] = None
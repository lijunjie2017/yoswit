if frappe.db.exists('Flat', frappe.form_dict.flat):
    flat_res = frappe.get_doc('Flat',frappe.form_dict.flat)
    if flat_res:
        web_list = flat_res.links
        obj = {}
        obj["page_list"] = []
        for i in web_list:
            webpage = frappe.get_doc('Web Page',i.link_name)
            obj["page_list"].append(webpage)
        frappe.response["data"] = obj
    else:
        frappe.response["data"] = {}
else:
    flat_res = frappe.get_doc('Flat','Management Office')
    if flat_res:
        web_list = flat_res.links
        obj = {}
        obj["page_list"] = []
        for i in web_list:
            webpage = frappe.get_doc('Web Page',i.link_name)
            obj["page_list"].append(webpage)
        frappe.response["data"] = obj
    else:
        frappe.response["data"] = {}

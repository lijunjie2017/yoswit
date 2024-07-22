profile = frappe.get_all("Profile", filters={"name":frappe.form_dict.name}, fields=["*"])
for p in profile:
  profile_room = []
  profileItem = frappe.get_doc('Profile',p.name)
  room = profileItem.profile_room
  for r in room:
    if r.title == '[en]Office[/en]':
      profile_room.append(r)
      profileItem.profile_room = profile_room
      profileItem = profileItem.save()
      frappe.db.commit()

frappe.response["editCode"] = 200


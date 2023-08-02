/*
Credit to notus: https://discord.com/channels/265400368765075456/741214091741364245/1068665550424780831

Issue: when you remove your custom 3D objects, after that newly joined players still can see old "removed" objects.

Fix: add this code to your mod before you set any objects:
*/

if (!game.setObject.old) {
  const setObject = function(t) {
    if (t && t.id != null) { // jshint ignore:line
      setObject.old.apply(this, arguments);
      if (this.objects_by_id[t.id] == null) { // jshint ignore:line
        this.objects_by_id[t.id] = this.objects_by_id.undefined;
      }
      delete this.objects_by_id.undefined;
    }
  };
  setObject.old = game.setObject;
  game.setObject = setObject;
}

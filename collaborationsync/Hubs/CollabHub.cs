using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Drawing;
using System.Threading.Tasks;

namespace collaborationsync.Hubs
{
    public class CollabHub : Hub
    {
        public async Task SetEditableRegionSync(EditableRegionSync editableRegionSync)
        {
            await Clients.All.SendAsync("ReceiveRegionSync", editableRegionSync);
        }
    }

    public class EditableRegionSync
    {
        public string User { get; set; }
        public int RegionId { get; set; }
        public string Document { get; set; }
    }
}
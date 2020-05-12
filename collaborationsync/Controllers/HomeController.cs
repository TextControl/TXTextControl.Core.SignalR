using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using collaborationsync.Models;
using TXTextControl;

namespace collaborationsync.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            string userName = ((string)Request.Query["username"] != null) ? (string)Request.Query["username"] : "Unknown";

            EditorView view = new EditorView() { Username = userName };

            using (TXTextControl.ServerTextControl tx = new TXTextControl.ServerTextControl())
            {
                tx.Create();
                tx.Load("App_Data/document.tx", StreamType.InternalUnicodeFormat);

                int i = 100;

                foreach (EditableRegion region in tx.EditableRegions)
                {
                    region.ID = i++;
                }

                tx.Save("App_Data/document_final.tx", StreamType.InternalUnicodeFormat);
            }

            return View(view);
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

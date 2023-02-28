using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Struct.Umbraco.StructPimPicker._Base;
using Struct.Umbraco.StructPimPicker.Models.Collection;
using Umbraco.Cms.Web.Common.Attributes;

namespace Struct.Umbraco.StructPimPicker.ApiControllers
{
    [PluginController("StructUmbracoStructPimPicker")]
    public class CollectionApiController : StructPIMApiController
    {
        public CollectionApiController(IOptions<StructPIMSettings> pimSettings) : base(pimSettings) { }

        [HttpPost]
        public IActionResult GetCollectionsTree(CollectionTreeRequestModel model)
        {
            var folders = PIMClient().Collections.GetCollectionFolders();
            var collections = PIMClient().Collections.GetCollections();

            var result = new List<CollectionTreeModel>();

            foreach (var folder in folders.Where(x => x.ParentUid == model.ParentUid))
            {
                result.Add(new CollectionTreeModel
                {
                    Uid = folder.Uid,
                    ParentUid = folder.ParentUid,
                    Name = folder.Name,
                    Type = "Folder",
                    HasChildren = collections.Any(x => x.FolderUid == folder.Uid) || folders.Any(x => x.ParentUid == folder.Uid)
                });
            }

            foreach (var collection in collections.Where(x => x.FolderUid == model.ParentUid && model.CollectionTypes.Any(y => y == x.QuerySetup.EntityType.ToString())))
            {
                result.Add(new CollectionTreeModel
                {
                    Uid = collection.Uid,
                    ParentUid = collection.FolderUid,
                    Name = collection.Alias,
                    Type = collection.QuerySetup.EntityType.ToString(),
                    HasChildren = false
                });
            }

            return Ok(new { Items = result });
        }
    }
}
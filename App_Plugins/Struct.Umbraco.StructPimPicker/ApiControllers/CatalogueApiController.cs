using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Struct.Umbraco.StructPimPicker._Base;
using Struct.Umbraco.StructPimPicker.Models.Catalogue;
using Umbraco.Cms.Web.Common.Attributes;

namespace Struct.Umbraco.StructPimPicker.ApiControllers
{
    [PluginController("StructUmbracoStructPimPicker")]
    public class CatalogueApiController : StructPIMApiController
    {
        public CatalogueApiController(IOptions<StructPIMSettings> pimSettings) : base(pimSettings) { }

        [HttpPost]
        public IActionResult GetCategoryChildren(CategoryRequestModel model)
        {
            var categories = PIMClient().Catalogues.GetCategoryChildren(model.CategoryId);
            //var categoryPaths = client.Catalogues.GetCategoryPath(categories.Select(x => x.Id), UmbracoHelper.GetCurrentContentLanguageId());
            var catalogueUids = categories.Select(x => x.CatalogueUid).ToHashSet();
            var catalogues = PIMClient().Catalogues.GetCatalogues().Where(x => catalogueUids.Contains(x.Uid)).ToDictionary(x => x.Uid);
            
            var models = categories.Select(x => new CategoryModel
            {
                Id = x.Id,
                CatalogueUid = x.CatalogueUid,
                HasChildren = x.HasChildren,
                Name = x.Name.ContainsKey(_pimSettings.DefaultLanguage) ? x.Name[_pimSettings.DefaultLanguage] : x.Name.FirstOrDefault(x => !string.IsNullOrEmpty(x.Value)).Value,
                SortOrder = x.SortOrder,
                //CategoryPath = categoryPaths[x.Id],
                CatalogueLabel = catalogues[x.CatalogueUid].Label,
                Dynamic = x.Dynamic
            }).OrderBy(x => x.SortOrder).ToList();

            return Ok(models);
        }

        [HttpPost]
        public IActionResult GetCatalogueChildren(CategoryRequestModel model)
        {
            var categories = PIMClient().Catalogues.GetCatalogueChildren(model.CatalogueUid);
            //var categoryPaths = CatalogueFacade.Instance.GetCategoryPath(categories.Select(x => x.Id), UmbracoHelper.GetCurrentContentLanguageId());
            var catalogueUids = categories.Select(x => x.CatalogueUid).ToHashSet();
            var catalogues = PIMClient().Catalogues.GetCatalogues().Where(x => catalogueUids.Contains(x.Uid)).ToDictionary(x => x.Uid);

            var models = categories.Select(x => new CategoryModel
            {
                Id = x.Id,
                CatalogueUid = x.CatalogueUid,
                HasChildren = x.HasChildren,
                Name = x.Name.ContainsKey(_pimSettings.DefaultLanguage) ? x.Name[_pimSettings.DefaultLanguage] : x.Name.FirstOrDefault(x => !string.IsNullOrEmpty(x.Value)).Value,
                SortOrder = x.SortOrder,
                //CategoryPath = categoryPaths[x.Id],
                CatalogueLabel = catalogues[x.CatalogueUid].Label,
                Dynamic = x.Dynamic
            }).OrderBy(x => x.SortOrder);

            return Ok(models);
        }

        [HttpPost]
        public IActionResult GetBasicCatalogues(CategoryRequestModel model)
        {
            var catalogues = PIMClient().Catalogues.GetCatalogues().OrderBy(x => x.SortOrder);
            return Ok(catalogues);
        }
    }
}

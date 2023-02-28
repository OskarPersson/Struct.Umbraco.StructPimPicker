using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Struct.PIM.Api.Models.Catalogue;
using Struct.PIM.Api.Models.DataConfiguration;
using Struct.PIM.Api.Models.Product;
using Struct.PIM.Api.Models.Shared;
using Struct.PIM.Api.Models.Variant;
using Struct.PIM.Api.Models.VariantGroup;
using Struct.Umbraco.StructPimPicker._Base;
using Struct.Umbraco.StructPimPicker.Models.Shared;
using Umbraco.Cms.Web.Common.Attributes;

namespace Struct.Umbraco.StructPimPicker.ApiControllers
{
    [PluginController("StructUmbracoStructPimPicker")]
    public class PimSearchApiController : StructPIMApiController
    {
        public PimSearchApiController(IOptions<StructPIMSettings> pimSettings) : base(pimSettings) { }

        public IActionResult GetAvailableFields(EntityType entityType)
        {
            List<QueryableField> availableFields = new List<QueryableField>();
            if (entityType == EntityType.Product)
                availableFields = PIMClient().Products.GetQueryableFields();
            else if (entityType == EntityType.Variant)
                availableFields = PIMClient().Variants.GetQueryableFields();
            else if (entityType == EntityType.Category)
                availableFields = PIMClient().Catalogues.GetQueryableFields();
            else if (entityType == EntityType.VariantGroup)
                availableFields = PIMClient().VariantGroups.GetQueryableFields();

            return Ok(availableFields);
        }

        [HttpPost]
        public IActionResult Search(Models.Shared.SearchModel model)
        {
            var result = new SearchResultModel();
            
            if (model.SearchDefinition.EntityType == EntityType.Product)
            {
                result = PIMClient().Products.SearchPaged(new Struct.PIM.Api.Models.Shared.SearchPagedModel
                {
                    IncludeArchived = false,
                    QueryModel = model.SearchDefinition.Query,
                    Page = model.SearchDefinition.Page,
                    PageSize = model.SearchDefinition.PageSize,
                    SortByFieldUid = model.SearchDefinition.SortByFieldUid,
                    SortDescending = model.SearchDefinition.SortDescending,
                    FieldUids = model.ListConfiguration.DataFieldUids
                });
            }
            else if (model.SearchDefinition.EntityType == EntityType.Variant)
            {
                result = PIMClient().Variants.SearchPaged(new Struct.PIM.Api.Models.Shared.SearchPagedModel
                {
                    IncludeArchived = false,
                    QueryModel = model.SearchDefinition.Query,
                    Page = model.SearchDefinition.Page,
                    PageSize = model.SearchDefinition.PageSize,
                    SortByFieldUid = model.SearchDefinition.SortByFieldUid,
                    SortDescending = model.SearchDefinition.SortDescending,
                    FieldUids = model.ListConfiguration.DataFieldUids
                });
            }
            else if (model.SearchDefinition.EntityType == EntityType.VariantGroup)
            {
                result = PIMClient().VariantGroups.SearchPaged(new Struct.PIM.Api.Models.Shared.SearchPagedModel
                {
                    IncludeArchived = false,
                    QueryModel = model.SearchDefinition.Query,
                    Page = model.SearchDefinition.Page,
                    PageSize = model.SearchDefinition.PageSize,
                    SortByFieldUid = model.SearchDefinition.SortByFieldUid,
                    SortDescending = model.SearchDefinition.SortDescending,
                    FieldUids = model.ListConfiguration.DataFieldUids
                });
            }

            return Ok(result);
        }

        [HttpGet]
        public IActionResult GetCurrentListConfiguration(EntityType entityType, string scope)
        {
            var listConfiguration = LoadDefaultListConfiguration(entityType, scope);

            List<QueryableField> availableFields = new List<QueryableField>();
            if (entityType == EntityType.Product)
                availableFields = PIMClient().Products.GetQueryableFields();
            else if (entityType == EntityType.Variant)
                availableFields = PIMClient().Variants.GetQueryableFields();
            else if (entityType == EntityType.Category)
                availableFields = PIMClient().Catalogues.GetQueryableFields();
            else if (entityType == EntityType.VariantGroup)
                availableFields = PIMClient().VariantGroups.GetQueryableFields();

            var detailedListConfiguration = DetailedListConfigurationModel.Build(listConfiguration, availableFields);

            return Ok(detailedListConfiguration);
        }
        
        private ListConfigurationModel LoadDefaultListConfiguration(EntityType entityType, string scope)
        {
            var language = PIMClient().Languages.GetLanguages().FirstOrDefault(x => x.CultureCode.Equals(_pimSettings.DefaultLanguage, StringComparison.InvariantCultureIgnoreCase));

            var listConfiguration = new ListConfigurationModel
            {
                EntityType = entityType,
                DataFieldUids = new List<string> { "Id", "PIM_Name_" + language.Id },
                Scope = scope,
                Uid = Guid.NewGuid()
            };
            
            return listConfiguration;
        }
    }
}
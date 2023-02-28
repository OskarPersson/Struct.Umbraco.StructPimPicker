using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Struct.PIM.Api.Models.Product;
using Struct.Umbraco.StructPimPicker._Base;
using Struct.Umbraco.StructPimPicker.Models.Catalogue;
using Struct.Umbraco.StructPimPicker.Models.Collection;
using Umbraco.Cms.Web.Common.Attributes;

namespace Struct.Umbraco.StructPimPicker.ApiControllers
{
    [PluginController("StructUmbracoStructPimPicker")]
    public class ProductApiController : StructPIMApiController
    {
        public ProductApiController(IOptions<StructPIMSettings> pimSettings) : base(pimSettings) { }

        [HttpPost]
        public IActionResult GetProductNames(List<int> productIds)
        {
            var tmp = PIMClient().Products.GetProducts(productIds);
            
            var names = new Dictionary<int, string>();
            foreach (var n in tmp)
            {
                var name = n.Name.GetValue(_pimSettings.DefaultLanguage);

                if (string.IsNullOrEmpty(name))
                    name = n.Name.FirstOrDefault(x => !string.IsNullOrEmpty(x.Value)).Value;

                names.Add(n.Id, name);
            }
            return Ok(names);
        }

        [HttpPost]
        public IActionResult GetVariantNames(List<int> variantIds)
        {
            var tmp = PIMClient().Variants.GetVariants(variantIds);

            var names = new Dictionary<int, string>();
            foreach (var n in tmp)
            {
                var name = n.Name.GetValue(_pimSettings.DefaultLanguage);

                if (string.IsNullOrEmpty(name))
                    name = n.Name.FirstOrDefault(x => !string.IsNullOrEmpty(x.Value)).Value;

                names.Add(n.Id, name);
            }

            return Ok(names);
        }

        [HttpPost]
        public IActionResult GetCategoryNames(CategoryRequestModel model)
        {
            var tmp = PIMClient().Catalogues.GetCategories(model.CategoryIds);
            
            var names = new Dictionary<int, string>();
            foreach (var n in tmp)
            {
                var name = n.Name.GetValue(_pimSettings.DefaultLanguage);

                if(string.IsNullOrEmpty(name))
                    name = n.Name.FirstOrDefault(x => !string.IsNullOrEmpty(x.Value)).Value;

                names.Add(n.Id, name);
            }
            return Ok(names);
        }

        [HttpPost]
        public IActionResult GetCollectionNames(CollectionRequestModel model)
        {
            var names = PIMClient().Collections.GetCollections(model.CollectionUids.Select(x => Guid.Parse(x))).ToDictionary(x => x.Uid, x => x.Alias);
            return Ok(names);
        }

        //[HttpPost]
        //public IActionResult GetProductThumbnails(List<int> productIds)
        //{
        //    var products = PIMClient().Products.GetProducts(productIds);
        //    var structureByProduct = products.ToDictionary(x => x.Id, x => x.ProductStructureUid);
        //    var structureUids = products.Select(x => x.ProductStructureUid).ToHashSet();
        //    var productStructures = PIMClient().ProductStructures.GetProductStructures().Where(x => structureUids.Contains(x.Uid)).ToDictionary(x => x.Uid);

        //    var thumbnails = new Dictionary<int, string>();

        //    foreach (var productStructureGroup in structureByProduct.GroupBy(x => x.Value).ToDictionary(x => x.Key, x => x.Select(y => y.Key).ToList()))
        //    {
        //        var productStructure = productStructures[productStructureGroup.Key];
        //        var ids = productStructureGroup.Value.Distinct();
        //        var attributeRef = productStructure.ProductConfiguration.ThumbnailReference;

        //        if (string.IsNullOrEmpty(attributeRef))
        //        {
        //            foreach (var productId in productStructureGroup.Value)
        //            {
        //                thumbnails.Add(productId, null);
        //            }
        //            continue;
        //        }

        //        var attributeUid = new Guid(attributeRef.Split('_')[1]);
        //        var entityType = attributeRef.Split('_')[0];

        //        if (entityType == "Product")
        //        {
        //            var productAndMediaValues = PIMClient().Products.GetProductAttributeValues(new ProductValuesRequestModel
        //            {
        //                ProductIds = ids.ToList(), 
        //                Uids = new List<Guid> { attributeUid },
        //                IncludeValues = Struct.PIM.Api.Models.Shared.ValueIncludeMode.Uids
        //            });
        //            foreach (var productAndMediaValue in productAndMediaValues)
        //            {
        //                var tmp = productAndMediaValue.Values.First().Value;
        //                string mediaReference = null;
        //                if (tmp is JArray)
        //                {
        //                    mediaReference = (tmp as JArray).ToObject<List<string>>()?.FirstOrDefault();
        //                }
        //                else if (tmp is JObject)
        //                {
        //                    mediaReference = (tmp as JObject).ToObject<string>();
        //                }

        //                thumbnails.Add(productAndMediaValue.ProductId, mediaReference);
        //            }
        //        }
        //        else if (entityType == "Variant")
        //        {
        //            var productToVariantMap = GetFirstVariantIdForProduct(productStructureGroup.Value.Distinct());
        //            var variantAndMediaValues = VariantFacade.Instance.GetAttributeValues(productToVariantMap.Select(x => x.Value).ToList(), new List<Guid> { attributeUid });

        //            foreach (var variantAndMediaValue in variantAndMediaValues)
        //            {
        //                var tmp = variantAndMediaValue.Values.First().Value;
        //                string mediaReference = null;
        //                if (tmp is JArray)
        //                {
        //                    mediaReference = (tmp as JArray).ToObject<List<string>>()?.FirstOrDefault();
        //                }
        //                else if (tmp is JObject)
        //                {
        //                    mediaReference = (tmp as JObject).ToObject<string>();
        //                }

        //                var productId = productToVariantMap.Single(x => x.Value == variantAndMediaValue.Key).Key;
        //                thumbnails.Add(productId, mediaReference);
        //            }
        //        }
        //        else if (entityType == "VariantGroup")
        //        {
        //            var productToVariantGroupMap = GetFirstVariantGroupIdForProduct(productStructureGroup.Value.Distinct());
        //            var variantGroupAndMediaValues = VariantGroupFacade.Instance.GetAttributeValues(productToVariantGroupMap.Select(x => x.Value).ToList(), new List<Guid> { attributeUid });

        //            foreach (var variantGroupAndMediaValue in variantGroupAndMediaValues)
        //            {
        //                var tmp = variantGroupAndMediaValue.Values.First().Value;
        //                string mediaReference = null;
        //                if (tmp is JArray)
        //                {
        //                    mediaReference = (tmp as JArray).ToObject<List<string>>()?.FirstOrDefault();
        //                }
        //                else if (tmp is JObject)
        //                {
        //                    mediaReference = (tmp as JObject).ToObject<string>();
        //                }

        //                var productId = productToVariantGroupMap.Single(x => x.Value == variantGroupAndMediaValue.Key).Key;
        //                thumbnails.Add(productId, mediaReference);
        //            }
        //        }
        //    }

        //    return Ok(thumbnails);
        //}

        //[HttpPost]
        //public HttpResponseMessage GetVariantThumbnails(List<int> variantIds)
        //{
        //    var thumbnails = VariantFacade.Instance.GetVariantThumbnails(variantIds).Where(x => x.Value != null).ToDictionary(x => x.Key, x => x.Value);
        //    return UmbracoHelper.CreateHttpResponse(Request, HttpStatusCode.OK, thumbnails);
        //}
    }
}
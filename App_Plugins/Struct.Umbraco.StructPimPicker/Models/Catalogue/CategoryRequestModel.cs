using Struct.Umbraco.StructPimPicker.Models.Shared;

namespace Struct.Umbraco.StructPimPicker.Models.Catalogue
{
    public class CategoryRequestModel : BaseRequestModel
    {
        public int CategoryId { get; set; }
        public Guid CatalogueUid { get; set; }
        public List<int> CategoryIds { get; set; }
    }
}
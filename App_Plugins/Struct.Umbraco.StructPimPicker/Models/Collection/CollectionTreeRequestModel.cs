using Struct.Umbraco.StructPimPicker.Models.Shared;

namespace Struct.Umbraco.StructPimPicker.Models.Collection
{
    public class CollectionTreeRequestModel : BaseRequestModel
    {
        public List<string> CollectionTypes { get; set; }
        public Guid? ParentUid { get; set; }
    }
}
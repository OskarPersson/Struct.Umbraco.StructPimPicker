using Struct.Umbraco.StructPimPicker.Models.Shared;

namespace Struct.Umbraco.StructPimPicker.Models.Collection
{
    public class CollectionRequestModel : BaseRequestModel
    {
        public List<string> CollectionUids { get; set; }
    }
}
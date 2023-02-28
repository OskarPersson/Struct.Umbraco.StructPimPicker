using Struct.PIM.Api.Models.DataConfiguration;

namespace Struct.Umbraco.StructPimPicker.Models.Shared
{
    public class ListConfigurationModel
    {
        public EntityType EntityType { get; set; }
        public Guid Uid { get; set; }
        public List<string> DataFieldUids { get; set; }
        public string Scope { get; set; }
    }
}

namespace Struct.Umbraco.StructPimPicker.Models
{
    public class PimItemReference
    {
        public string ItemId { get; set; }
        public Struct.PIM.Api.Models.DataConfiguration.EntityType ReferenceType { get; set; }
    }
}

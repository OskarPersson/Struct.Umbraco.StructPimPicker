using Newtonsoft.Json;
using Struct.Umbraco.StructPimPicker.Models;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace Struct.Umbraco.StructPimPicker._Base.Editors
{
    public class StructPimPickerValueConverter : PropertyValueConverterBase
    {
        public StructPimPickerValueConverter()
        {
        }

        public override bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorAlias.Equals("Struct.Umbraco.StructPimPicker");

        public override PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Snapshot;

        public override Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(List<PimItemReference>);

        public override object ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object source, bool preview)
        {
            if (source == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(source?.ToString()))
                return JsonConvert.DeserializeObject<List<PimItemReference>>(source.ToString());

            return null;
        }
    }
}

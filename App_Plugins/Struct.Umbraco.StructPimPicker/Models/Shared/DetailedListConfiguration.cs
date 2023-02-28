using Struct.PIM.Api.Models.Shared;

namespace Struct.Umbraco.StructPimPicker.Models.Shared
{
    public class DetailedListConfigurationModel : ListConfigurationModel
    {
        public List<QueryableField> DataFields { get; set; }

        private DetailedListConfigurationModel() { }

        public static DetailedListConfigurationModel Build(ListConfigurationModel basicListConfiguration, List<QueryableField> availableFields)
        {
            var dataFields = new List<QueryableField>();
            var dic = availableFields.ToDictionary(x => x.Uid);

            foreach (var dataFieldUid in basicListConfiguration.DataFieldUids)
            {
                var dataField = dic.ContainsKey(dataFieldUid) ? dic[dataFieldUid] : null;
                if (dataField != null)
                {
                    dataFields.Add(dataField);
                }
            }

            return new DetailedListConfigurationModel
            {
                Uid = basicListConfiguration.Uid,
                EntityType = basicListConfiguration.EntityType,
                DataFieldUids = basicListConfiguration.DataFieldUids,
                DataFields = dataFields,
                Scope = basicListConfiguration.Scope
            };
        }
    }
}

using Struct.PIM.Api.Models.DataConfiguration;
using Struct.PIM.Api.Models.Shared;

namespace Struct.Umbraco.StructPimPicker.Models.Shared
{
    public class SearchDefinition
    {
        public Guid Uid { get; set; }
        public EntityType EntityType { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string SortByFieldUid { get; set; }
        public bool SortDescending { get; set; }
        public QueryModel Query { get; set; }
    }
}

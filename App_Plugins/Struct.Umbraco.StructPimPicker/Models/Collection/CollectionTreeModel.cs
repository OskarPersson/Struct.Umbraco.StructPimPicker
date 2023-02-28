namespace Struct.Umbraco.StructPimPicker.Models.Collection
{
    public class CollectionTreeModel
    {
        public Guid Uid { get; set; }
        public string Name { get; set; }
        public Guid? ParentUid { get; set; }
        public string Type { get; set; }
        public bool HasChildren { get; set; }
    }
}
namespace Struct.Umbraco.StructPimPicker.Models.Catalogue
{
    public class CategoryModel
    {
        public int Id { get; set; }
        public int SortOrder { get; set; }
        public Guid CatalogueUid { get; set; }
        public string Name { get; set; }
        public bool HasChildren { get; set; }
        public string CatalogueLabel { get; set; }
        //public List<CategoryPathItem> CategoryPath { get; set; }
        public bool Dynamic { get; set; }
    }
}
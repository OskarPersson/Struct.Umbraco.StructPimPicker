using Umbraco.Cms.Core.Composing;

namespace Struct.Umbraco.StructPimPicker._Base
{
    public class StructPimComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services
                .AddOptions<StructPIMSettings>()
                .Bind(builder.Config.GetSection("StructPIM"));
        }
    }
}
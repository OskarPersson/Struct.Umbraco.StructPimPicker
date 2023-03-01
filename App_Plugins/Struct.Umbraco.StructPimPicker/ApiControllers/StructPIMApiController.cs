using Microsoft.Extensions.Options;
using Struct.Umbraco.StructPimPicker._Base;
using Umbraco.Cms.Web.BackOffice.Controllers;

namespace Struct.Umbraco.StructPimPicker.ApiControllers
{
    public class StructPIMApiController : UmbracoAuthorizedJsonController
    {
        protected StructPIMSettings _pimSettings;

        public StructPIMApiController(IOptions<StructPIMSettings> pimSettings)
        {
            _pimSettings = pimSettings.Value;
        }

        protected Struct.PIM.Api.Client.StructPIMApiClient PIMClient()
        {
            if (string.IsNullOrEmpty(_pimSettings.ApiUrl))
                throw new InvalidOperationException("StructPIM.ApiUrl must be set in settings to use Struct PIM Item Picker");

            if (string.IsNullOrEmpty(_pimSettings.ApiKey))
                throw new InvalidOperationException("StructPIM.ApiKey must be set in settings to use Struct PIM Item Picker");

            if (string.IsNullOrEmpty(_pimSettings.DefaultLanguage))
                throw new InvalidOperationException("StructPIM.DefaultLanguage must be set in settings to use Struct PIM Item Picker");

            return new Struct.PIM.Api.Client.StructPIMApiClient(_pimSettings.ApiUrl, _pimSettings.ApiKey);
        }
    }
}
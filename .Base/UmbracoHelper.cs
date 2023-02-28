using System.Net;

namespace Struct.Umbraco.StructPimPicker._Base
{
    public static class UmbracoHelper
    {        
        public static HttpResponseMessage CreateHttpResponse<T>(HttpRequestMessage request, HttpStatusCode httpStatusCode, T data)
        {
            #region --Guard--
            if ((int) httpStatusCode >= 400)
            {
                throw new ArgumentException("HttpStatusCode " + (int)httpStatusCode + " is an error code. Use CreateErrorHttpResponse instead");
            }
            #endregion
            return request.CreateResponse(httpStatusCode, data);
        }

        public static HttpResponseMessage CreateErrorHttpResponse(HttpRequestMessage request, HttpStatusCode httpStatusCode, Exception e = null, string message = null)
        {
            #region --Guard--
            if ((int)httpStatusCode < 400)
            {
                throw new ArgumentException("HttpStatusCode " + (int)httpStatusCode + " is a success code. Use CreateHttpResponse instead");
            }
            #endregion
            return request.CreateErrorResponse(httpStatusCode, message ?? e?.Message, e);
        }

        public static HttpResponseMessage CreateHttpResponse(HttpRequestMessage request, HttpStatusCode httpStatusCode)
        {
            #region --Guard--
            if ((int)httpStatusCode >= 400)
            {
                throw new ArgumentException("HttpStatusCode " + (int)httpStatusCode + "is an error code. Use CreateErrorHttpResponse instead");
            }
            #endregion

            return request.CreateResponse(httpStatusCode);
        }
    }
}
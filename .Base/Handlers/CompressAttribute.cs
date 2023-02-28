using System.Web.Http.Filters;

namespace Struct.Umbraco.StructPimPicker._Base.Handlers
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class CompressAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext context)
        {
            if (context.Response != null && context.Response.Content != null)
            {
                var acceptedEncoding = context.Response.RequestMessage.Headers.AcceptEncoding.First().Value;

                if (!acceptedEncoding.Equals("gzip", StringComparison.InvariantCultureIgnoreCase)
                    && !acceptedEncoding.Equals("deflate", StringComparison.InvariantCultureIgnoreCase))
                {
                    return;
                }

                context.Response.Content = new CompressedContent(context.Response.Content, acceptedEncoding);
            }
        }
    }
}
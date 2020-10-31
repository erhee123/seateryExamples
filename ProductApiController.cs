using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Products;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductApiController : BaseApiController
    {
        private IProductService _service = null;
        private IAuthenticationService<int> _authService = null;
        public ProductApiController(IProductService service,
            ILogger<ProductApiController> logger,
            IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
        }
        [HttpGet("paginate")]
        public ActionResult<ItemResponse<Paged<Product>>> GetAll(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetAll(pageIndex, pageSize);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
        [HttpGet("current")]
        public ActionResult<ItemResponse<Paged<Product>>> GetCurrent(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;
            try
            { 
                int userId = _authService.GetCurrentUserId();
                Paged<Product> list = _service.GetByCreatedBy(pageIndex, pageSize, userId);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<Product>> Get(int id)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Product product = _service.Get(id);
                if (product == null)
                {
                    code = 404;
                    response = new ErrorResponse("Product not found");
                }
                else
                {
                    response = new ItemResponse<Product> { Item = product };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: {ex.Message}");
            }


            return StatusCode(code, response);
        }
        [HttpGet("search")]
        public ActionResult<ItemResponse<Paged<Product>>> GetBySearch(int pageIndex, int pageSize, string query)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetBySearch(pageIndex, pageSize, query);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
        [HttpGet("search/vendor/type")]
        public ActionResult<ItemResponse<Paged<Product>>> GetByVendorAndType (int pageIndex, int pageSize, int vendorId, int typeId)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetByVendorAndProductType(pageIndex, pageSize, vendorId, typeId);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
        [HttpGet("search/vendor")]
        public ActionResult<ItemResponse<Paged<Product>>> GetByVendor(int pageIndex, int pageSize, int vendorId)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetByVendor(pageIndex, pageSize, vendorId);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpGet("vendor")]
        public ActionResult<ItemResponse<Paged<Product>>> GetByVendorId(int pageIndex, int pageSize, int vendorId)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetByVendorId(pageIndex, pageSize, vendorId);

                if(list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpGet("search/type")]
        public ActionResult<ItemResponse<Paged<Product>>> GetByProductType(int pageIndex, int pageSize, int typeId)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetByType(pageIndex, pageSize, typeId);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
        [HttpGet("search/VendorOrType")]
        public ActionResult<ItemResponse<Paged<Product>>> GetByVendorOrType(int pageIndex, int pageSize, int? vendorId = null, int? typeId = null)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Paged<Product> list = _service.GetByVendorOrType(pageIndex, pageSize, vendorId, typeId);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemResponse<Paged<Product>> { Item = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
        [HttpGet("details/{id:int}")]
        public ActionResult<ItemResponse<Product>> GetDetailById(int id)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                Product product = _service.GetDetail(id);
                if (product == null)
                {
                    code = 404;
                    response = new ErrorResponse("Product not found");
                }
                else
                {
                    response = new ItemResponse<Product> { Item = product };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: {ex.Message}");
            }


            return StatusCode(code, response);
        }
        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                _service.Delete(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
        [HttpPost]
        public ActionResult<ItemResponse<Product>> Create(ProductAddRequest model)
        {
            int code = 200;
            ObjectResult result = null;
            try
            {
                int userId = _authService.GetCurrentUserId();

                int id = _service.Add(model, userId);
                ItemResponse<int> response = new ItemResponse<int>() { Item = id };
                result = Created201(response);
            }
            catch (Exception ex)
            {
                code = 500;
                ErrorResponse response = new ErrorResponse(ex.Message);
                result = StatusCode(code, response);
            }
            return result;
        }
        [HttpPut("{id:int}")]
        public ActionResult<ItemResponse<int>> Update(ProductUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                _service.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
        [HttpGet("types")]
        public ActionResult<ItemsResponse<ProductType>> GetAll()
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                List<ProductType> list = _service.GetAllTypes();

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemsResponse<ProductType> { Items = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpGet("vendor/{vendorId:int}")]
        public ActionResult<ItemsResponse<ProductType>> GetTypeByVendorId(int vendorId)
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                List<ProductType> list = _service.GetTypeByVendorId(vendorId);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App resource not found");
                }
                else
                {
                    response = new ItemsResponse<ProductType> { Items = list };
                };
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.StripeModels;
using Sabio.Models.Requests.Stripe;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Core.Configs;
using Sabio.Web.Models.Responses;
using Stripe;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/stripe")]
    [ApiController]
    public class StripeApiController : BaseApiController
    {
        private readonly StripeConfig _options;
        private IStripeService _service = null;
        private IAuthenticationService<int> _authService = null;
        public StripeApiController(IStripeService service,
            ILogger<StripeApiController> logger,
            IOptions<StripeConfig> options,
            IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
            _options = options.Value;
        }
        [HttpPost("paymentintent")]
        public async Task<IActionResult> PaymentIntent(PaymentIntentCreateOptions options)
        {
            int code = 200;
            StripeConfiguration.ApiKey = _options.SecretKey;
            ObjectResult result = null;
            try
            {
                var service = new PaymentIntentService();

                var paymentIntent = await service.CreateAsync(options);
                Logger.LogInformation(paymentIntent.ToString());
                var paymentIntentModel = new PaymentIntentModel
                {
                    Id = paymentIntent.Id,
                    ClientSecretKey = paymentIntent.ClientSecret,
                    Amount = paymentIntent.Amount,
                    MetaData = paymentIntent.Metadata,
                    Charges = paymentIntent.Charges
                };
                ItemResponse<PaymentIntentModel> response = new ItemResponse<PaymentIntentModel>() { Item = paymentIntentModel };
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

        [HttpPost("setupintent")]
        public async Task<IActionResult> SetupIntent(SetupIntentCreateOptions options)
        {
            int code = 200;
            StripeConfiguration.ApiKey = _options.SecretKey;
            ObjectResult result = null;
            try
            {
                var service = new SetupIntentService();
                var intent = await service.CreateAsync(options);

                var setupIntentModel = new SetupIntentModel
                {
                    ClientSecret = intent.ClientSecret,
                    Id = intent.Id
                };
                ItemResponse<SetupIntentModel> response = new ItemResponse<SetupIntentModel>() { Item = setupIntentModel };
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

        [HttpGet("paymentmethod")]
        public ActionResult<ItemResponse<StripeList<PaymentMethod>>> GetPaymentMethod(string customer, string type)
        {
            int code = 200;
            StripeConfiguration.ApiKey = _options.SecretKey;
            BaseResponse response = null;
            try
            {
                var options = new PaymentMethodListOptions
                {
                    Customer = customer,
                    Type = type
                };
                var service = new PaymentMethodService();
                StripeList<PaymentMethod> paymentMethods = service.List(options);

                if (paymentMethods == null)
                {
                    code = 404;
                    response = new ErrorResponse("Payment Method not found");
                }
                else
                {
                    response = new ItemResponse<StripeList<PaymentMethod>> { Item = paymentMethods };
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

        [HttpPost("customer")]
        public async Task<IActionResult> AddCustomer(CustomerCreateOptions options)
        {
            int code = 200;
            StripeConfiguration.ApiKey = _options.SecretKey;
            ObjectResult result = null;
            try
            {
                var service = new CustomerService();
                var customer = await service.CreateAsync(options);
                var customerModel = new Customer
                {
                    Id = customer.Id,
                    Name = customer.Name,
                    Description = customer.Description,
                    Email = customer.Email,
                    Phone = customer.Phone
                };
                int userId = _authService.GetCurrentUserId();
                var model = new CustomerAddRequest
                {
                    CustomerId = customer.Id,
                    PhoneNumber = customer.Phone,
                    Email = customer.Email
                };
                _service.InsertUserInfo(model, userId);
                ItemResponse<object> response = new ItemResponse<object>() { Item = model };
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
        
        [HttpGet("customer")]
        public ActionResult<ItemResponse<StripeCustomer>> GetCurrentCustomer()
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                StripeCustomer customer = _service.GetCustomerInfo(userId);
                if (customer == null)
                {
                    code = 404;
                    response = new ErrorResponse("Customer not found");
                }
                else
                {
                    response = new ItemResponse<StripeCustomer> { Item = customer };
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

    }
}

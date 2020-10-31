/*eslint-disable camelcase */
import logger from "sabio-debug";
import React from "react";
import "simple-line-icons";
import PropTypes from "prop-types";
import CheckoutForm from "./CheckoutForm";
import StripeRegisterModal from "./StripeRegisterModal";
import * as cartService from "../../services/cartService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as stripeService from "../../services/stripeService";
import * as twoFactorAuthService from "../../services/twoFactorAuthService";
import styles from "./checkout.module.css";
import swal from "sweetalert";
import LocationsModal from "../../components/locations/LocationsModal";
import { Label } from "reactstrap";
import { Accordion, Card } from "react-bootstrap";

const _logger = logger.extend("checkout");

//tax/tip/delivery fee calculations were not provided so subTotal is a stand in for Total
class Checkout extends React.Component {
  state = {
    registerFormData: {
      name: "",
      email: "",
      phone: "",
    },
    cartItems: [],
    subTotal: 0,
    isCalculated: false,
    customerId: "",
    phoneNumber: "",
    email: "",
    formIsOpen: false,
    formData: {
      locationId: 0,
    },
    locationData: {
      city: "City",
      latitude: 33.6973536,
      lineOne: "Address",
      lineTwo: "",
      locationTypeId: 1,
      longitude: -117.7132361,
      stateId: "State",
      zip: "Zip Code",
    },
    locationEventKey: "0",
    paymentEventKey: "1",
    hasLocation: false,
  };
  componentDidMount() {
    this.getCartItems();
    this.getCustomerInfo();
    _logger("didMount");
  }
  getCustomerInfo = () => {
    stripeService
      .getCustomerInfo()
      .then(this.onGetInfoSuccess)
      .catch(this.onGetInfoFailure);
  };
  onGetInfoSuccess = (response) => {
    let customerInfo = response.data.item;
    _logger(customerInfo);
    this.setState(() => {
      return {
        customerId: customerInfo.customerId,
        phoneNumber: customerInfo.phoneNumber,
        email: customerInfo.email,
      };
    });
  };
  onGetInfoFailure = (response) => {
    _logger(response);
    toast.error(
      "No stripe account detected, please create an account to use express checkout or save payment info"
    );
  };
  getCartItems = () => {
    cartService
      .getUserCart()
      .then(this.onGetCartSuccess)
      .catch(this.onGetCartFailure);
  };
  onGetCartSuccess = (response) => {
    let cartItems = response.data.item;
    this.setState(() => {
      return {
        mappedItems: cartItems.map(this.mapItems),
        cartItems,
        subTotal: this.getCartTotal(cartItems),
        isCalculated: true,
      };
    });
  };
  mapItems = (cartItem) => {
    return (
      <div className="card-body d-flex" key={cartItem.id}>
        <span className="col-8" style={{ textAlign: "left" }}>
          {cartItem.productName}
        </span>
        <span className="col-4 " style={{ textAlign: "right" }}>
          ${cartItem.itemCost.toFixed(2)} x {cartItem.quantity}
        </span>
      </div>
    );
  };
  onGetCartFailure = (response) => {
    _logger(response);
    toast.error("Failed to retrieve items, did you add items?");
  };
  backToCart = () => {
    this.props.history.push("/mycart");
  };
  getTotal = (cartItem) => {
    let itemTotal = cartItem.itemCost * cartItem.quantity;
    return itemTotal;
  };
  getCartTotal = (cartItems) => {
    var sum = cartItems.reduce(
      (result, cartItem) => result + this.getTotal(cartItem),
      0
    );
    let total = sum.toFixed(2);
    return Number(total);
  };
  goToCardRegister = (e) => {
    e.preventDefault();
    if (this.state.customerId.length > 0) {
      var customerId = {
        type: "CUSTOMER",
        payload: { customerId: this.state.customerId, email: this.state.email },
      };
      this.props.history.push("/checkout/registercard", customerId);
    } else {
      swal({
        title: "You're not registered with Stripe!",
        text: "Would you like to create a customer account?",
        icon: "info",
        buttons: true,
      }).then((register) => {
        if (register) {
          this.toggleStripeModal();
        } else {
          swal("Please enter card details normally, info will NOT be saved");
        }
      });
    }
  };
  toggleStripeModal = () => {
    this.setState(() => {
      if (!this.state.formIsOpen) {
        return {
          formIsOpen: true,
        };
      } else {
        return {
          formIsOpen: false,
        };
      }
    });
  };
  expressCheckout = (e) => {
    e.preventDefault();
    if (this.state.customerId.length) {
      let customer = this.state.customerId;
      let type = "card";
      stripeService
        .getPaymentMethod(customer, type)
        .then(this.onGetPaymentSuccess)
        .catch(this.onGetPaymentFailure);
    } else {
      this.toggleStripeModal();
    }
  };
  onGetPaymentSuccess = (response) => {
    _logger(response);
    if (response.data.item.length > 0) {
      twoFactorAuthService
        .sendAuthCode(this.state.phoneNumber)
        .then(this.onSendSuccess)
        .catch(this.onSendFailure);
    } else {
      swal({
        title: "No saved payment method detected!",
        text: "Would you like to save a card for express checkout?",
        icon: "info",
        buttons: true,
      }).then((saveInfo) => {
        if (saveInfo) {
          var customerId = {
            type: "CUSTOMER",
            payload: {
              customerId: this.state.customerId,
              email: this.state.email,
            },
          };
          this.props.history.push("/checkout/registercard", customerId);
        } else {
          swal("Please enter card details in step 2.");
        }
      });
    }
  };
  onGetPaymentFailure = (response) => {
    _logger(response);
    toast.error("No payment method detected!");
  };
  onSendSuccess = (response) => {
    _logger(response, "____SUCCESS____");
    let customerPayload = {
      type: "CUSTOMER_CHECKOUT_EXPRESS",
      payload: {
        customerId: this.state.customerId,
        subTotal: this.state.subTotal,
        phoneNumber: this.state.phoneNumber,
        email: this.state.email,
      },
    };
    this.props.history.push("/checkout/express", customerPayload);
  };
  onSendFailure = (response) => {
    _logger(response, "ERROR");
    toast.error("Code not sent!");
  };
  handleSubmitRegister = (values) => {
    _logger(values);
    stripeService
      .createCustomer(values)
      .then(this.onAddCustomerSuccess)
      .catch(this.onAddCustomerError);
  };
  onAddCustomerSuccess = (response) => {
    let customerInfo = response.data.item;
    _logger(customerInfo);
    toast.success("Customer account created!");
    this.toggleStripeModal();
    this.setState(() => {
      return {
        customerId: customerInfo.customerId,
        phoneNumber: customerInfo.phoneNumber,
      };
    });
  };
  onAddCustomerError = (response) => {
    _logger(response);
    toast.error("Account not created! Please try again");
    this.toggleStripeModal();
  };

  onSaveAddress = (id, address, selectedState) => {
    this.toggleModal();
    this.setState((prevState) => {
      return {
        ...(prevState.formData.locationId = id),
        locationData: address,
        selectedState,
        hasLocation: true,
      };
    });
  };

  toggleModal = () => {
    this.setState((prevState) => {
      return {
        isOpen: !prevState.isOpen,
      };
    });
  };
  changeEventKey = () => {
    this.setState(() => {
      if (this.state.locationEventKey === "0") {
        return { locationEventKey: "1", paymentEventKey: "0" };
      } else {
        return { locationEventKey: "0", paymentEventKey: "1" };
      }
    });
  };

  render() {
    _logger("rendering");
    return (
      <div className="rag-fadeIn-enter-done">
        <div
          className="content-wrapper"
          style={{ fontFamily: "Saira Semi Condensed" }}
        >
          <div className="row">
            <div className="col-lg-5">
              <div
                className={`${styles.cartCard} b mb-2 card text-bold text-dark`}
              >
                <div className="bb card-body d-inline-flex justify-content-between">
                  <h4
                    className="card-title pt-2 ml-3"
                    style={{ color: "#4696EC" }}
                  >
                    Your Order
                  </h4>
                  <button
                    className="btn btn-outline-primary"
                    onClick={this.backToCart}
                    style={{ marginRight: "10px" }}
                  >
                    <i className="icon-arrow-left pr-1" />
                    Back To Cart
                  </button>
                </div>
                {this.state.mappedItems}
                <div className="bt card-body d-flex py-0">
                  <span className="col-8" style={{ textAlign: "left" }}>
                    <strong>Subtotal</strong>
                  </span>
                  <span className="col-4" style={{ textAlign: "right" }}>
                    ${this.getCartTotal(this.state.cartItems).toFixed(2)}
                  </span>
                </div>
                <div className="card-body d-flex py-0">
                  <span className="col-8" style={{ textAlign: "left" }}>
                    Estimated Tax
                  </span>
                  <span className="col-4" style={{ textAlign: "right" }}>
                    $2.56
                  </span>
                </div>
                <div className="card-body d-flex py-0">
                  <span className="col-8" style={{ textAlign: "left" }}>
                    Tip
                  </span>
                  <span className="col-4" style={{ textAlign: "right" }}>
                    $3.56
                  </span>
                </div>
                <div className="bb card-body d-flex py-0">
                  <span className="col-8" style={{ textAlign: "left" }}>
                    Delivery
                  </span>
                  <span className="col-4" style={{ textAlign: "right" }}>
                    $4.34
                  </span>
                </div>
                <div className="card-body d-flex text-bold text-dark">
                  <span className="col-8" style={{ textAlign: "left" }}>
                    ORDER TOTAL
                  </span>
                  <span className="col-4" style={{ textAlign: "right" }}>
                    $40.44
                  </span>
                </div>
                <div className="card-body">
                  <p>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={this.expressCheckout}
                    >
                      EXPRESS CHECKOUT
                    </button>
                  </p>
                  <small className="text-muted">
                    * To use this method you must be registered and have saved
                    payment method
                  </small>
                  <button
                    className="btn btn-outline-primary pl-3 mt-4"
                    onClick={this.goToCardRegister}
                    style={{ float: "right" }}
                  >
                    Add a payment method
                  </button>
                  <StripeRegisterModal
                    isOpen={this.state.formIsOpen}
                    handleSubmit={this.handleSubmitRegister}
                    toggleModal={this.toggleStripeModal}
                    formData={this.state.registerFormData}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="container-md">
                <Accordion defaultActiveKey="0">
                  <div className="card b mb-2">
                    <Accordion.Toggle
                      as={Card.Header}
                      eventKey={this.state.locationEventKey}
                    >
                      <h4 className="card-title">
                        <a style={{ color: "#4696EC" }}>1. Billing details</a>
                      </h4>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={this.state.locationEventKey}>
                      <div id="collapse01" className="card-body">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="card-body">
                              Please enter your Billing Information by clicking
                              below (if you saved a payment method please
                              proceed with express checkout)
                            </div>
                            {/* Start Location Code */}
                            <div className="text-center">
                              <em
                                className="fa-2x mr-2 ml-3  far fa-compass"
                                style={{ color: "#4696ec" }}
                                onClick={this.toggleModal}
                              >
                                Add Billing Details
                              </em>
                              {this.state.isOpen && (
                                <LocationsModal
                                  onSaveAddress={this.onSaveAddress}
                                  toggleModal={this.toggleModal}
                                  locationId={this.state.formData.locationId}
                                />
                              )}
                            </div>

                            {this.state.locationData && (
                              <div className="col venueForm-locationIdField my-4">
                                <Label
                                  className=" col-form-label"
                                  style={{ color: "#161616" }}
                                >
                                  <b>Location:</b>
                                </Label>
                                <div>
                                  {this.state.locationData.lineOne}{" "}
                                  {this.state.locationData.lineTwo}
                                </div>
                                <div>
                                  {this.state.locationData.city},{" "}
                                  {this.state.selectedState}{" "}
                                  {this.state.locationData.zip}
                                </div>
                              </div>
                            )}
                            {/* End Location Code */}
                            <button
                              className="btn btn-outline-primary"
                              onClick={this.changeEventKey}
                              disabled={this.state.hasLocation === false}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    </Accordion.Collapse>
                  </div>
                  <div className="card b mb-2">
                    <Accordion.Toggle
                      as={Card.Header}
                      eventKey={this.state.paymentEventKey}
                    >
                      <h4 className="card-title">
                        <a style={{ color: "#4696EC" }}>2. Payment Method</a>
                      </h4>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={this.state.paymentEventKey}>
                      <div id="collapse01" className="card-body">
                        <div className="row">
                          <div className="col-lg-8">
                            {this.state.subTotal > 0 &&
                              this.state.hasLocation && (
                                <CheckoutForm
                                  isCalculated={this.state.isCalculated}
                                  subTotal={this.state.subTotal}
                                  customerId={this.state.customerId}
                                  email={this.state.email}
                                  history={this.props.history}
                                  cartItems={this.state.cartItems}
                                  locationData={this.state.locationData}
                                  selectedState={this.state.selectedState}
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    </Accordion.Collapse>
                  </div>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Checkout.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      type: PropTypes.string,
      payload: PropTypes.shape({
        subTotal: PropTypes.number,
        phoneNumber: PropTypes.string,
      }),
    }),
  }),
};
export default Checkout;

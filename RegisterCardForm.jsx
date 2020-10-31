/*eslint-disable camelcase */
import React from "react";
import logger from "sabio-debug";
import {
  Elements,
  ElementsConsumer,
  CardElement,
} from "@stripe/react-stripe-js";
import PropTypes from "prop-types";
import CardSection from "./CardSection";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import "react-toastify/dist/ReactToastify.css";
import * as stripeService from "../../services/stripeService";

const Stripe_Key = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(Stripe_Key);
const _logger = logger.extend("registerCard");

class RegisterCardForm extends React.Component {
  state = {
    clientSecret: "",
    locationData: this.props.locationData,
    selectedState: this.props.selectedState,
    email: this.props.email,
  };

  componentDidMount() {
    const data = {
      customer: this.props.customerId,
      usage: "on_session",
    };
    this.createSetupIntent(data);
  }
  createSetupIntent = (data) => {
    stripeService
      .createSetupIntent(data)
      .then(this.onCreateSuccess)
      .catch(this.onCreateFailure);
  };
  onCreateSuccess = (response) => {
    _logger("success");
    let setupIntent = response.data.item;
    this.setState(() => {
      return { clientSecret: setupIntent.clientSecret };
    }, _logger("11111111111111", setupIntent));
  };
  onCreateFailure = (response) => {
    _logger(response);
    toast.error("Card not saved");
  };
  handleSubmit = async (event) => {
    event.preventDefault();

    const { stripe, elements } = this.props;

    if (!stripe || !elements) {
      _logger("Stripe.js has not yet loaded.");
      return;
    }
    const paymentMethodRQ = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: {
        address: {
          city: this.state.locationData.city,
          line1: this.state.locationData.lineOne,
          line2: this.state.locationData.lineTwo,
          postal_code: this.state.locationData.zip,
          state: this.state.selectedState,
        },
        email: this.state.email,
      },
    });

    const result = await stripe.confirmCardSetup(this.state.clientSecret, {
      payment_method: paymentMethodRQ.paymentMethod.id,
    });

    if (result.error) {
      toast.error("card not saved");
      _logger(result.error.message, "card not saved, try again");
    } else {
      _logger("card info processing");
      if (result.setupIntent.status === "succeeded") {
        _logger("card info saved successfully", result.setupIntent);
        toast.success("Card Info saved successfully!");
        this.props.history.push("/checkout");
      }
    }
  };

  render() {
    _logger("rendering");
    return (
      <div className="card">
        <form onSubmit={this.handleSubmit}>
          <CardSection />
          <button
            className="btn btn-outline-primary"
            disabled={!this.props.stripe}
          >
            Save Payment
          </button>
        </form>
      </div>
    );
  }
}
RegisterCardForm.propTypes = {
  selectedState: PropTypes.string,
  locationData: PropTypes.shape({
    city: PropTypes.string,
    latitude: PropTypes.number,
    lineOne: PropTypes.string,
    lineTwo: PropTypes.string,
    locationTypeId: PropTypes.number,
    longitude: PropTypes.number,
    stateId: PropTypes.number,
    zip: PropTypes.string,
  }),
  customerId: PropTypes.string,
  email: PropTypes.string,
  stripe: PropTypes.shape({
    confirmCardSetup: PropTypes.func,
    createPaymentMethod: PropTypes.func,
  }),
  elements: PropTypes.shape({
    getElement: PropTypes.func,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};
export default function InjectedCheckoutForm({ ...props }) {
  return (
    <Elements stripe={stripePromise} {...props}>
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <RegisterCardForm {...props} stripe={stripe} elements={elements} />
        )}
      </ElementsConsumer>
    </Elements>
  );
}
